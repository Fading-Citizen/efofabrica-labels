import { createClient } from '@supabase/supabase-js';

// Usar valores por defecto vacíos si las variables no están disponibles durante el build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Solo crear el cliente si las variables existen
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // Temporal para evitar errores en build

// Tipos para la tabla label_coordinates
export interface LabelCoordinateRow {
  id?: string;
  label_type: string;
  ila1_x: number | null;
  ila1_y: number | null;
  ila2_x: number | null;
  ila2_y: number | null;
  rla1_x: number | null;
  rla1_y: number | null;
  rla2_x: number | null;
  rla2_y: number | null;
  font_size: number;
  updated_at?: string;
  updated_by?: string;
}
