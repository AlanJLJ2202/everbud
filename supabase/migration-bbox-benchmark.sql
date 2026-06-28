-- Tabla para benchmarking de modelos de detección de objetos (bounding boxes)
-- Registra predicciones automáticas vs correcciones manuales del usuario
-- IoU (Intersection over Union) mide la precisión del modelo: 1.0 = perfecto, 0 = sin solapamiento

CREATE TABLE IF NOT EXISTS bbox_benchmark (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  session_id  text        NOT NULL,              -- agrupa todas las plantas de una foto
  model       text        NOT NULL DEFAULT 'claude-sonnet-4-6',
  plant_index int         NOT NULL,              -- posición en el array de resultados
  species_predicted text,
  confidence  text,
  predicted_bbox  jsonb   NOT NULL,              -- {x, y, w, h} normalizado 0-1
  corrected_bbox  jsonb,                         -- null si el usuario no corrigió
  iou         float,                             -- calculado al guardar corrección
  registered  boolean     NOT NULL DEFAULT false, -- true cuando la planta fue registrada
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bbox_benchmark ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own benchmark data"
  ON bbox_benchmark FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX bbox_benchmark_user_idx    ON bbox_benchmark (user_id);
CREATE INDEX bbox_benchmark_session_idx ON bbox_benchmark (session_id);
CREATE INDEX bbox_benchmark_model_idx   ON bbox_benchmark (model);
