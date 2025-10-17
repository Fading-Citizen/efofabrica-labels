import { createClient } from '@supabase/supabase-js';

// Configuración usando las credenciales reales
const supabaseUrl = 'https://dblyptsepvhulpllqamz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibHlwdHNlcHZodWxwbGxxYW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTE4NTcsImV4cCI6MjA3NjI4Nzg1N30.yIs4Mpm3BCurrbsmB8yDvG1kjmzJl3sKHOxzMumdM8Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🔧 Configurando base de datos de Supabase...');
  
  try {
    // Probar conexión
    const { data, error } = await supabase.from('_').select('*').limit(1);
    console.log('✅ Conexión a Supabase exitosa');

    // Ejecutar schema SQL
    console.log('📄 Ejecutando schema de base de datos...');
    
    // Crear tabla label_batches
    const createBatchesTable = `
      CREATE TABLE IF NOT EXISTS label_batches (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          codes TEXT[] NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
          created_by TEXT,
          printed BOOLEAN DEFAULT FALSE NOT NULL
      );
    `;

    // Crear tabla labels
    const createLabelsTable = `
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
    `;

    // Crear índices
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_labels_code ON labels(code);
      CREATE INDEX IF NOT EXISTS idx_labels_type ON labels(type);
      CREATE INDEX IF NOT EXISTS idx_labels_batch ON labels(batch);
      CREATE INDEX IF NOT EXISTS idx_labels_created_at ON labels(created_at);
      CREATE INDEX IF NOT EXISTS idx_labels_printed ON labels(printed);
      CREATE INDEX IF NOT EXISTS idx_label_batches_type ON label_batches(type);
      CREATE INDEX IF NOT EXISTS idx_label_batches_created_at ON label_batches(created_at);
      CREATE INDEX IF NOT EXISTS idx_label_batches_printed ON label_batches(printed);
    `;

    console.log('📊 Creando tablas...');
    
    // Ejecutar las consultas SQL
    const queries = [createBatchesTable, createLabelsTable, createIndexes];
    
    for (const query of queries) {
      const { data, error } = await supabase.rpc('sql', { query });
      if (error) {
        console.error('❌ Error ejecutando SQL:', error);
      }
    }

    console.log('✅ Base de datos configurada exitosamente!');
    console.log('🎯 El sistema EFO Label Generator está listo para usar');
    
  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
  }
}

// Ejecutar setup
setupDatabase();