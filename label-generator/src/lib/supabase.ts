import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
