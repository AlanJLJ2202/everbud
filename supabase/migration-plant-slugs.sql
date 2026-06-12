-- ============================================================================
-- Migration: slugs legibles y compartibles para plantas
-- Run in Supabase SQL Editor AFTER migration-species-profiles.sql
--
-- Antes:  /plants/8f14e45f-ceea-467f-a8d4-91b426ed5b1c
-- Ahora:  /plants/monstera-deliciosa-8f14e4  y  /p/monstera-deliciosa-8f14e4
--
-- El slug se genera a partir del nombre común (o el nombre personal si no
-- hay) + los primeros 6 caracteres del UUID para garantizar unicidad sin
-- exponer datos del usuario.
-- ============================================================================

ALTER TABLE plants ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_plants_slug ON plants (slug);

-- ----------------------------------------------------------------------------
-- 1. Función de slugificación (sin depender de la extensión unaccent)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.plant_slug(p_label text, p_id uuid)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  base text;
BEGIN
  base := lower(coalesce(p_label, ''));
  base := translate(base, 'áéíóúüñàèìòùâêîôûãõç', 'aeiouunaeiouaeiouaoc');
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
  base := trim(both '-' from base);
  IF base = '' THEN
    base := 'planta';
  END IF;
  base := substr(base, 1, 60);
  RETURN base || '-' || substr(replace(p_id::text, '-', ''), 1, 6);
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Trigger: genera el slug al insertar (el cliente no necesita cambios)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_plant_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := public.plant_slug(
      coalesce(nullif(trim(NEW.common_name), ''), NEW.name),
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS plants_set_slug ON plants;
CREATE TRIGGER plants_set_slug
  BEFORE INSERT ON plants
  FOR EACH ROW EXECUTE FUNCTION public.set_plant_slug();

-- ----------------------------------------------------------------------------
-- 3. Backfill: slugs para las plantas existentes
-- ----------------------------------------------------------------------------
UPDATE plants
SET slug = public.plant_slug(
  coalesce(nullif(trim(common_name), ''), name),
  id
)
WHERE slug IS NULL;
