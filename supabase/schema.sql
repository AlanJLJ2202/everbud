-- Plantas
CREATE TABLE plants (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name              text NOT NULL,
  common_name       text,
  scientific_name   text,
  type              text,
  light_type        text,
  water_every_days  int,
  tips              text[],
  image_url         text,
  status            text DEFAULT 'alive',
  created_at        timestamptz DEFAULT now()
);

-- Log de cuidados diarios
CREATE TABLE care_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id    uuid REFERENCES plants(id) ON DELETE CASCADE,
  care_type   text NOT NULL,
  weather     text,
  notes       text,
  logged_at   timestamptz DEFAULT now()
);

-- Germinaciones
CREATE TABLE germinations (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seed_name         text NOT NULL,
  started_at        date NOT NULL,
  check_every_days  int NOT NULL DEFAULT 3,
  last_checked_at   date,
  status            text DEFAULT 'en_curso',
  notes             text,
  created_at        timestamptz DEFAULT now()
);

-- Registro de muertes
CREATE TABLE death_logs (
  id        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id  uuid REFERENCES plants(id) ON DELETE CASCADE,
  cause     text NOT NULL,
  notes     text,
  died_at   date DEFAULT CURRENT_DATE
);

-- Enable Row Level Security (optional for personal use, but good practice)
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE germinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (personal app, single user)
CREATE POLICY "Allow all on plants" ON plants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on care_logs" ON care_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on germinations" ON germinations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on death_logs" ON death_logs FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for plant images
INSERT INTO storage.buckets (id, name, public) VALUES ('plant-images', 'plant-images', true);

-- Allow public access to plant-images bucket
CREATE POLICY "Allow public access to plant-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'plant-images');

CREATE POLICY "Allow uploads to plant-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'plant-images');
