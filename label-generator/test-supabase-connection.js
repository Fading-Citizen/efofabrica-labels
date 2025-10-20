// Test script para verificar conexión con Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let supabaseUrl = '';
let supabaseKey = '';

envLines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].trim();
  }
});

console.log('🔍 Verificando configuración de Supabase...\n');
console.log('📍 URL:', supabaseUrl ? '✅ Configurada' : '❌ No encontrada');
console.log('🔑 Key:', supabaseKey ? `✅ Configurada (${supabaseKey.substring(0, 20)}...)` : '❌ No encontrada');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Error: Variables de entorno no configuradas correctamente');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('\n🧪 Probando conexión con Supabase...\n');
  
  try {
    // Test 1: Verificar si la tabla existe
    console.log('Test 1: Verificando tabla label_coordinates...');
    const { data: tableData, error: tableError } = await supabase
      .from('label_coordinates')
      .select('label_type')
      .limit(1);

    if (tableError) {
      if (tableError.code === '42P01') {
        console.log('❌ La tabla "label_coordinates" NO EXISTE');
        console.log('📝 Acción requerida: Ejecuta el script coordinates-schema.sql en Supabase Dashboard\n');
        console.log('Pasos:');
        console.log('1. Ve a https://supabase.com/dashboard');
        console.log('2. Selecciona tu proyecto');
        console.log('3. Ve a SQL Editor → New Query');
        console.log('4. Copia todo el contenido de database/coordinates-schema.sql');
        console.log('5. Pega y ejecuta el script');
        return;
      }
      throw tableError;
    }

    console.log('✅ La tabla existe!\n');

    // Test 2: Contar registros
    console.log('Test 2: Contando registros...');
    const { count, error: countError } = await supabase
      .from('label_coordinates')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    console.log(`✅ Registros encontrados: ${count}\n`);

    if (count === 0) {
      console.log('⚠️  La tabla está vacía. Los datos por defecto deberían haberse insertado.');
      console.log('📝 Acción: Verifica que ejecutaste TODO el script SQL, incluyendo los INSERT\n');
      return;
    }

    // Test 3: Leer todos los registros
    console.log('Test 3: Leyendo todos los tipos de etiqueta...');
    const { data: allData, error: allError } = await supabase
      .from('label_coordinates')
      .select('label_type, updated_at')
      .order('label_type');

    if (allError) throw allError;

    console.log('✅ Tipos de etiqueta en Supabase:');
    allData.forEach(row => {
      console.log(`   - ${row.label_type} (actualizado: ${new Date(row.updated_at).toLocaleString()})`);
    });

    // Test 4: Leer coordenadas específicas
    console.log('\nTest 4: Leyendo coordenadas de PatchCord...');
    const { data: patchData, error: patchError } = await supabase
      .from('label_coordinates')
      .select('*')
      .eq('label_type', 'PatchCord')
      .single();

    if (patchError) throw patchError;

    console.log('✅ Coordenadas de PatchCord:');
    console.log(`   ILA1: (${patchData.ila1_x}, ${patchData.ila1_y})`);
    console.log(`   ILA2: (${patchData.ila2_x}, ${patchData.ila2_y})`);
    console.log(`   RLA1: (${patchData.rla1_x}, ${patchData.rla1_y})`);
    console.log(`   RLA2: (${patchData.rla2_x}, ${patchData.rla2_y})`);
    console.log(`   Font Size: ${patchData.font_size}`);

    console.log('\n✅ ¡TODAS LAS PRUEBAS EXITOSAS!');
    console.log('🎉 La integración con Supabase está funcionando correctamente\n');

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:');
    console.error(error);
    console.log('\n📝 Posibles causas:');
    console.log('- La tabla no existe (ejecuta coordinates-schema.sql)');
    console.log('- Las políticas RLS están bloqueando el acceso');
    console.log('- Las credenciales de Supabase son incorrectas');
  }
}

testConnection();
