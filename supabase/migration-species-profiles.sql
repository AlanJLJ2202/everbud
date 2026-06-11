-- ============================================================================
-- Migration: Species registry (global), rarity + story, public profiles
-- Run in Supabase SQL Editor AFTER schema.sql / migration-auth.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SPECIES — registro global de especies (compartido entre todos los usuarios)
--    La primera vez que alguien registra una especie se guarda aquí; los
--    siguientes usuarios solo se vinculan a este registro vía plants.species_id
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS species (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scientific_name   text NOT NULL,
  common_name       text,
  type              text CHECK (type IN ('frutal', 'floral', 'suculenta', 'aromatica', 'otro')),
  light_type        text CHECK (light_type IN ('sol_pleno', 'media_sombra', 'sombra')),
  water_every_days  int,
  tips              text[],
  rarity            text NOT NULL DEFAULT 'comun'
                    CHECK (rarity IN ('comun', 'poco_comun', 'rara', 'muy_rara', 'legendaria')),
  story             text,   -- "Historia / About" de la especie
  family            text,   -- familia botánica (ej. Rosaceae)
  origin            text,   -- región de origen (ej. Asia oriental)
  image_url         text,   -- primera foto registrada de la especie
  created_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz DEFAULT now()
);

-- Dedupe: nombre científico único (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_species_scientific_name
  ON species (lower(scientific_name));

ALTER TABLE species ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer el catálogo (incluye visitantes anónimos en perfiles públicos)
DROP POLICY IF EXISTS "Anyone can view species" ON species;
CREATE POLICY "Anyone can view species" ON species
  FOR SELECT USING (true);

-- Solo usuarios autenticados pueden agregar especies al catálogo
DROP POLICY IF EXISTS "Authenticated users can insert species" ON species;
CREATE POLICY "Authenticated users can insert species" ON species
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- El creador puede corregir su registro
DROP POLICY IF EXISTS "Creators can update own species" ON species;
CREATE POLICY "Creators can update own species" ON species
  FOR UPDATE USING (auth.uid() = created_by);

-- ----------------------------------------------------------------------------
-- 2. PLANTS — vínculo al registro global de especies
-- ----------------------------------------------------------------------------
ALTER TABLE plants ADD COLUMN IF NOT EXISTS species_id uuid REFERENCES species(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_plants_species_id ON plants(species_id);

-- ----------------------------------------------------------------------------
-- 3. PROFILES — perfil público compartible (everbud.vercel.app/<username>)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text NOT NULL UNIQUE CHECK (username ~ '^[A-Za-z0-9_]{3,30}$'),
  display_name  text,
  bio           text,
  is_public     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower
  ON profiles (lower(username));

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver perfiles públicos; el dueño siempre ve el suyo
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (is_public OR auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 4. Auto-crear profile al registrarse (username derivado del email)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username  text;
  final_username text;
  suffix         int := 0;
BEGIN
  base_username := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^A-Za-z0-9_]', '', 'g'));
  IF base_username IS NULL OR length(base_username) < 3 THEN
    base_username := 'gardener' || substr(replace(NEW.id::text, '-', ''), 1, 6);
  END IF;
  base_username := substr(base_username, 1, 26);

  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = lower(final_username)) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: crear profiles para usuarios existentes que no tengan uno
DO $$
DECLARE
  u              record;
  base_username  text;
  final_username text;
  suffix         int;
BEGIN
  FOR u IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
  LOOP
    base_username := lower(regexp_replace(split_part(u.email, '@', 1), '[^A-Za-z0-9_]', '', 'g'));
    IF base_username IS NULL OR length(base_username) < 3 THEN
      base_username := 'gardener' || substr(replace(u.id::text, '-', ''), 1, 6);
    END IF;
    base_username := substr(base_username, 1, 26);

    final_username := base_username;
    suffix := 0;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = lower(final_username)) LOOP
      suffix := suffix + 1;
      final_username := base_username || suffix::text;
    END LOOP;

    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
      u.id,
      final_username,
      COALESCE(u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1))
    );
  END LOOP;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. Perfil público: visitantes pueden ver las plantas de perfiles públicos
--    (las policies de RLS se combinan con OR, así que el dueño no pierde nada)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view plants of public profiles" ON plants;
CREATE POLICY "Anyone can view plants of public profiles" ON plants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = plants.user_id AND p.is_public
    )
  );
