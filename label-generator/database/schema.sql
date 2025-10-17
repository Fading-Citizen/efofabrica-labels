-- Crear tabla para los lotes de etiquetas
CREATE TABLE IF NOT EXISTS label_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    codes TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    created_by TEXT,
    printed BOOLEAN DEFAULT FALSE NOT NULL
);

-- Crear tabla para las etiquetas individuales
CREATE TABLE IF NOT EXISTS labels (
    id BIGSERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    batch UUID NOT NULL REFERENCES label_batches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    printed BOOLEAN DEFAULT FALSE NOT NULL,
    printed_at TIMESTAMP WITH TIME ZONE,
    printed_by TEXT
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_labels_code ON labels(code);
CREATE INDEX IF NOT EXISTS idx_labels_type ON labels(type);
CREATE INDEX IF NOT EXISTS idx_labels_batch ON labels(batch);
CREATE INDEX IF NOT EXISTS idx_labels_created_at ON labels(created_at);
CREATE INDEX IF NOT EXISTS idx_labels_printed ON labels(printed);

CREATE INDEX IF NOT EXISTS idx_label_batches_type ON label_batches(type);
CREATE INDEX IF NOT EXISTS idx_label_batches_created_at ON label_batches(created_at);
CREATE INDEX IF NOT EXISTS idx_label_batches_printed ON label_batches(printed);

-- Función para obtener el próximo número de código para un tipo específico
CREATE OR REPLACE FUNCTION get_next_code_number(label_type TEXT, prefix TEXT)
RETURNS INTEGER AS $$
DECLARE
    last_number INTEGER := 0;
BEGIN
    SELECT COALESCE(
        MAX(
            CAST(
                SUBSTRING(code FROM LENGTH(prefix) + 2) AS INTEGER
            )
        ), 
        0
    ) INTO last_number
    FROM labels 
    WHERE type = label_type 
    AND code ~ ('^' || prefix || '-[0-9]{6}$');
    
    RETURN last_number;
END;
$$ LANGUAGE plpgsql;

-- Función para generar códigos secuenciales
CREATE OR REPLACE FUNCTION generate_sequential_codes(
    label_type TEXT, 
    prefix TEXT, 
    quantity INTEGER
)
RETURNS TEXT[] AS $$
DECLARE
    last_number INTEGER;
    codes TEXT[] := '{}';
    i INTEGER;
BEGIN
    -- Obtener el último número usado
    SELECT get_next_code_number(label_type, prefix) INTO last_number;
    
    -- Generar los códigos
    FOR i IN 1..quantity LOOP
        codes := array_append(codes, prefix || '-' || LPAD((last_number + i)::TEXT, 6, '0'));
    END LOOP;
    
    RETURN codes;
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE label_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (para desarrollo)
-- En producción, estas políticas deberían ser más restrictivas
CREATE POLICY "Allow all operations on label_batches" ON label_batches
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on labels" ON labels
    FOR ALL USING (true) WITH CHECK (true);

-- Trigger para actualizar automáticamente la fecha de impresión
CREATE OR REPLACE FUNCTION update_printed_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.printed = TRUE AND OLD.printed = FALSE THEN
        NEW.printed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_printed_timestamp
    BEFORE UPDATE ON labels
    FOR EACH ROW
    EXECUTE FUNCTION update_printed_timestamp();

-- Comentarios para documentación
COMMENT ON TABLE label_batches IS 'Almacena información sobre lotes de etiquetas generadas';
COMMENT ON TABLE labels IS 'Almacena información sobre etiquetas individuales';

COMMENT ON COLUMN label_batches.id IS 'Identificador único del lote';
COMMENT ON COLUMN label_batches.type IS 'Tipo de etiqueta (PatchCord, Pigtail, etc.)';
COMMENT ON COLUMN label_batches.quantity IS 'Cantidad de etiquetas en el lote';
COMMENT ON COLUMN label_batches.codes IS 'Array con todos los códigos generados';
COMMENT ON COLUMN label_batches.created_at IS 'Fecha y hora de creación del lote';
COMMENT ON COLUMN label_batches.printed IS 'Indica si el lote ha sido impreso';

COMMENT ON COLUMN labels.id IS 'Identificador único de la etiqueta';
COMMENT ON COLUMN labels.code IS 'Código único de la etiqueta (ej: PC-000001)';
COMMENT ON COLUMN labels.type IS 'Tipo de etiqueta';
COMMENT ON COLUMN labels.batch IS 'Referencia al lote al que pertenece';
COMMENT ON COLUMN labels.printed IS 'Indica si la etiqueta ha sido impresa';
COMMENT ON COLUMN labels.printed_at IS 'Fecha y hora de impresión';

-- Insertar datos de ejemplo para testing (opcional)
-- INSERT INTO label_batches (type, quantity, codes, printed) VALUES 
-- ('PatchCord', 5, ARRAY['PC-000001', 'PC-000002', 'PC-000003', 'PC-000004', 'PC-000005'], false);

-- INSERT INTO labels (code, type, batch, printed) VALUES 
-- ('PC-000001', 'PatchCord', (SELECT id FROM label_batches WHERE codes @> ARRAY['PC-000001'] LIMIT 1), false),
-- ('PC-000002', 'PatchCord', (SELECT id FROM label_batches WHERE codes @> ARRAY['PC-000002'] LIMIT 1), false),
-- ('PC-000003', 'PatchCord', (SELECT id FROM label_batches WHERE codes @> ARRAY['PC-000003'] LIMIT 1), false),
-- ('PC-000004', 'PatchCord', (SELECT id FROM label_batches WHERE codes @> ARRAY['PC-000004'] LIMIT 1), false),
-- ('PC-000005', 'PatchCord', (SELECT id FROM label_batches WHERE codes @> ARRAY['PC-000005'] LIMIT 1), false);