import { supabase, LabelCoordinateRow } from './supabase';
import { LabelType } from '@/types';
import { LabelCoordinates } from './labelCoordinates';

/**
 * Carga las coordenadas de un tipo de etiqueta desde Supabase
 */
export async function loadCoordinatesFromSupabase(
  labelType: LabelType
): Promise<LabelCoordinates | null> {
  try {
    const { data, error } = await supabase
      .from('label_coordinates')
      .select('*')
      .eq('label_type', labelType)
      .single();

    if (error) {
      console.error('Error loading coordinates:', error);
      return null;
    }

    if (!data) return null;

    return {
      ILA1: data.ila1_x && data.ila1_y ? { x: data.ila1_x, y: data.ila1_y } : undefined,
      ILA2: data.ila2_x && data.ila2_y ? { x: data.ila2_x, y: data.ila2_y } : undefined,
      RLA1: data.rla1_x && data.rla1_y ? { x: data.rla1_x, y: data.rla1_y } : undefined,
      RLA2: data.rla2_x && data.rla2_y ? { x: data.rla2_x, y: data.rla2_y } : undefined,
      fontSize: data.font_size,
    };
  } catch (error) {
    console.error('Exception loading coordinates:', error);
    return null;
  }
}

/**
 * Carga todas las coordenadas desde Supabase
 */
export async function loadAllCoordinatesFromSupabase(): Promise<Record<LabelType, LabelCoordinates> | null> {
  try {
    const { data, error } = await supabase
      .from('label_coordinates')
      .select('*');

    if (error) {
      console.error('Error loading all coordinates:', error);
      return null;
    }

    if (!data) return null;

    const coordinates: any = {};
    
    data.forEach((row: LabelCoordinateRow) => {
      coordinates[row.label_type as LabelType] = {
        ILA1: row.ila1_x && row.ila1_y ? { x: row.ila1_x, y: row.ila1_y } : undefined,
        ILA2: row.ila2_x && row.ila2_y ? { x: row.ila2_x, y: row.ila2_y } : undefined,
        RLA1: row.rla1_x && row.rla1_y ? { x: row.rla1_x, y: row.rla1_y } : undefined,
        RLA2: row.rla2_x && row.rla2_y ? { x: row.rla2_x, y: row.rla2_y } : undefined,
        fontSize: row.font_size,
      };
    });

    return coordinates;
  } catch (error) {
    console.error('Exception loading all coordinates:', error);
    return null;
  }
}

/**
 * Guarda las coordenadas de un tipo de etiqueta en Supabase
 */
export async function saveCoordinatesToSupabase(
  labelType: LabelType,
  coordinates: LabelCoordinates,
  updatedBy?: string
): Promise<boolean> {
  try {
    const row: LabelCoordinateRow = {
      label_type: labelType,
      ila1_x: coordinates.ILA1?.x ?? null,
      ila1_y: coordinates.ILA1?.y ?? null,
      ila2_x: coordinates.ILA2?.x ?? null,
      ila2_y: coordinates.ILA2?.y ?? null,
      rla1_x: coordinates.RLA1?.x ?? null,
      rla1_y: coordinates.RLA1?.y ?? null,
      rla2_x: coordinates.RLA2?.x ?? null,
      rla2_y: coordinates.RLA2?.y ?? null,
      font_size: coordinates.fontSize,
      updated_by: updatedBy,
    };

    const { error } = await supabase
      .from('label_coordinates')
      .upsert(row, { onConflict: 'label_type' });

    if (error) {
      console.error('Error saving coordinates:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception saving coordinates:', error);
    return false;
  }
}

/**
 * Guarda todas las coordenadas en Supabase
 */
export async function saveAllCoordinatesToSupabase(
  allCoordinates: Record<LabelType, LabelCoordinates>,
  updatedBy?: string
): Promise<boolean> {
  try {
    const rows: LabelCoordinateRow[] = Object.entries(allCoordinates).map(([labelType, coords]) => ({
      label_type: labelType,
      ila1_x: coords.ILA1?.x ?? null,
      ila1_y: coords.ILA1?.y ?? null,
      ila2_x: coords.ILA2?.x ?? null,
      ila2_y: coords.ILA2?.y ?? null,
      rla1_x: coords.RLA1?.x ?? null,
      rla1_y: coords.RLA1?.y ?? null,
      rla2_x: coords.RLA2?.x ?? null,
      rla2_y: coords.RLA2?.y ?? null,
      font_size: coords.fontSize,
      updated_by: updatedBy,
    }));

    const { error } = await supabase
      .from('label_coordinates')
      .upsert(rows, { onConflict: 'label_type' });

    if (error) {
      console.error('Error saving all coordinates:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception saving all coordinates:', error);
    return false;
  }
}
