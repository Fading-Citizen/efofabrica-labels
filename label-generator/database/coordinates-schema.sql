-- Tabla para almacenar las coordenadas de cada tipo de etiqueta
CREATE TABLE IF NOT EXISTS label_coordinates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label_type TEXT UNIQUE NOT NULL,
  ila1_x INTEGER,
  ila1_y INTEGER,
  ila2_x INTEGER,
  ila2_y INTEGER,
  rla1_x INTEGER,
  rla1_y INTEGER,
  rla2_x INTEGER,
  rla2_y INTEGER,
  font_size NUMERIC NOT NULL DEFAULT 8,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Índice para búsquedas rápidas por tipo
CREATE INDEX IF NOT EXISTS idx_label_coordinates_type ON label_coordinates(label_type);

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_label_coordinates_updated_at ON label_coordinates;
CREATE TRIGGER update_label_coordinates_updated_at
  BEFORE UPDATE ON label_coordinates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar coordenadas por defecto para los 10 tipos de etiquetas
INSERT INTO label_coordinates (label_type, ila1_x, ila1_y, ila2_x, ila2_y, rla1_x, rla1_y, rla2_x, rla2_y, font_size) VALUES
  ('PatchCord', 50, 60, 50, 75, 170, 60, 170, 75, 8),
  ('PatchCord RIMPORT', 50, 60, 50, 75, 170, 60, 170, 75, 8),
  ('PatchCord COENTEL', 50, 60, 50, 75, 170, 60, 170, 75, 8),
  ('PatchCord Duplex', 50, 60, 50, 75, 170, 60, 170, 75, 8),
  ('PatchCord Duplex RIMPORT', 50, 60, 50, 75, 170, 60, 170, 75, 8),
  ('PatchCord Duplex COENTEL', 50, 60, 50, 75, 170, 60, 170, 75, 8),
  ('Pigtail', 50, 60, 50, 75, NULL, NULL, NULL, NULL, 8),
  ('Pigtail RIMPORT', 50, 60, 50, 75, NULL, NULL, NULL, NULL, 8),
  ('Pigtail COENTEL', 50, 60, 50, 75, NULL, NULL, NULL, NULL, 8),
  ('Bobina', 50, 60, 50, 75, NULL, NULL, NULL, NULL, 8)
ON CONFLICT (label_type) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE label_coordinates IS 'Almacena las coordenadas de posicionamiento para cada tipo de etiqueta';
COMMENT ON COLUMN label_coordinates.label_type IS 'Tipo de etiqueta (debe coincidir con LabelType del frontend)';
COMMENT ON COLUMN label_coordinates.ila1_x IS 'Coordenada X del campo ILA1';
COMMENT ON COLUMN label_coordinates.ila1_y IS 'Coordenada Y del campo ILA1';
COMMENT ON COLUMN label_coordinates.ila2_x IS 'Coordenada X del campo ILA2';
COMMENT ON COLUMN label_coordinates.ila2_y IS 'Coordenada Y del campo ILA2';
COMMENT ON COLUMN label_coordinates.rla1_x IS 'Coordenada X del campo RLA1 (A1:)';
COMMENT ON COLUMN label_coordinates.rla1_y IS 'Coordenada Y del campo RLA1 (A1:)';
COMMENT ON COLUMN label_coordinates.rla2_x IS 'Coordenada X del campo RLA2 (A2:)';
COMMENT ON COLUMN label_coordinates.rla2_y IS 'Coordenada Y del campo RLA2 (A2:)';
COMMENT ON COLUMN label_coordinates.font_size IS 'Tamaño de fuente en puntos';
COMMENT ON COLUMN label_coordinates.updated_by IS 'Usuario que realizó la última actualización';
