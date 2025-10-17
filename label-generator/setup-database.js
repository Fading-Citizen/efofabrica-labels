const https = require('https');
const fs = require('fs');

// Configuración de Supabase
const SUPABASE_URL = 'https://dblyptsepvhulpllqamz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibHlwdHNlcHZodWxwbGxxYW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTE4NTcsImV4cCI6MjA3NjI4Nzg1N30.yIs4Mpm3BCurrbsmB8yDvG1kjmzJl3sKHOxzMumdM8Y';

// SQL para crear las tablas
const CREATE_TABLES_SQL = `
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

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE label_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (para desarrollo)
CREATE POLICY "Allow all operations on label_batches" ON label_batches
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on labels" ON labels
    FOR ALL USING (true) WITH CHECK (true);
`;

async function setupDatabase() {
    console.log('🔧 Configurando base de datos en Supabase...');

    // Preparar datos para la solicitud
    const postData = JSON.stringify({
        query: CREATE_TABLES_SQL
    });

    const options = {
        hostname: 'dblyptsepvhulpllqamz.supabase.co',
        port: 443,
        path: '/rest/v1/rpc/exec_sql',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('✅ Base de datos configurada exitosamente!');
                    console.log('🎯 El sistema EFO Label Generator está listo');
                    resolve(data);
                } else {
                    console.log('❌ Error configurando base de datos');
                    console.log('📝 Código de estado:', res.statusCode);
                    console.log('📄 Respuesta:', data);
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            console.error('❌ Error de conexión:', e.message);
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

// Intentar configuración automática
console.log('🚀 Iniciando configuración automática de EFO Label Generator...');
setupDatabase()
    .then(() => {
        console.log('');
        console.log('✅ ¡CONFIGURACIÓN COMPLETADA!');
        console.log('🌐 Abrir: http://localhost:3002');
        console.log('📊 El sistema ya está listo para generar etiquetas');
    })
    .catch((error) => {
        console.log('');
        console.log('⚠️  Configuración automática falló');
        console.log('📋 CONFIGURACIÓN MANUAL:');
        console.log('');
        console.log('1. Ir a: https://dblyptsepvhulpllqamz.supabase.co');
        console.log('2. Ir a "SQL Editor"');
        console.log('3. Ejecutar el contenido del archivo database/schema.sql');
        console.log('4. Recargar http://localhost:3002');
        console.log('');
        console.log('💡 Error:', error.message);
    });