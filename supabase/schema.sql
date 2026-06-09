-- Plantas
CREATE TABLE plants (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plant_id    uuid REFERENCES plants(id) ON DELETE CASCADE,
  care_type   text NOT NULL,
  weather     text,
  notes       text,
  logged_at   timestamptz DEFAULT now()
);

-- Germinaciones
CREATE TABLE germinations (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  user_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plant_id  uuid REFERENCES plants(id) ON DELETE CASCADE,
  cause     text NOT NULL,
  notes     text,
  died_at   date DEFAULT CURRENT_DATE
);

-- Enable Row Level Security
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE germinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
-- Plants
CREATE POLICY "Users can view own plants" ON plants
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plants" ON plants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plants" ON plants
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plants" ON plants
  FOR DELETE USING (auth.uid() = user_id);

-- Care logs
CREATE POLICY "Users can view own care_logs" ON care_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own care_logs" ON care_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own care_logs" ON care_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own care_logs" ON care_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Germinations
CREATE POLICY "Users can view own germinations" ON germinations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own germinations" ON germinations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own germinations" ON germinations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own germinations" ON germinations
  FOR DELETE USING (auth.uid() = user_id);

-- Death logs
CREATE POLICY "Users can view own death_logs" ON death_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own death_logs" ON death_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own death_logs" ON death_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own death_logs" ON death_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_care_logs_user_id ON care_logs(user_id);
CREATE INDEX idx_germinations_user_id ON germinations(user_id);
CREATE INDEX idx_death_logs_user_id ON death_logs(user_id);

-- Storage bucket for plant images
INSERT INTO storage.buckets (id, name, public) VALUES ('plant-images', 'plant-images', true);

-- Allow public read access to plant-images bucket
CREATE POLICY "Allow public access to plant-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'plant-images');

-- Allow authenticated users to upload to plant-images bucket
CREATE POLICY "Allow uploads to plant-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'plant-images' AND auth.role() = 'authenticated');
