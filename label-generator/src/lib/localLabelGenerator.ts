import { LabelType, Label, LabelBatch } from '@/types';
import { LABEL_TYPES } from './labelTypes';
import { v4 as uuidv4 } from 'uuid';

// Storage en localStorage para persistir entre sesiones
const STORAGE_KEY = 'efo_label_data';

interface LabelStorage {
  lastNumbers: Record<LabelType, number>;
  batches: LabelBatch[];
  labels: Label[];
}

// Función para obtener datos del localStorage
function getStorageData(): LabelStorage {
  if (typeof window === 'undefined') {
    return { lastNumbers: {} as Record<LabelType, number>, batches: [], labels: [] };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading storage:', error);
  }

  return { lastNumbers: {} as Record<LabelType, number>, batches: [], labels: [] };
}

// Función para guardar datos en localStorage
function saveStorageData(data: LabelStorage): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving storage:', error);
  }
}

export function getLastCodeNumber(type: LabelType): number {
  const data = getStorageData();
  return data.lastNumbers[type] || 0;
}

export function generateCode(prefix: string, number: number): string {
  return `${prefix}-${number.toString().padStart(6, '0')}`;
}

export function generateCodes(type: LabelType, quantity: number): string[] {
  const labelConfig = LABEL_TYPES.find(l => l.id === type);
  if (!labelConfig) {
    throw new Error(`Tipo de etiqueta no encontrado: ${type}`);
  }

  const lastNumber = getLastCodeNumber(type);
  const codes: string[] = [];

  for (let i = 1; i <= quantity; i++) {
    const newNumber = lastNumber + i;
    codes.push(generateCode(labelConfig.prefix, newNumber));
  }

  return codes;
}

export function saveLabelBatch(
  type: LabelType,
  quantity: number,
  codes: string[]
): LabelBatch {
  const batchId = uuidv4();
  const now = new Date().toISOString();
  
  const batchData: LabelBatch = {
    id: batchId,
    type,
    quantity,
    codes,
    created_at: now,
    printed: false
  };

  // Crear etiquetas individuales
  const newLabels: Label[] = codes.map(code => ({
    id: uuidv4(),
    code,
    type,
    batch: batchId,
    created_at: now,
    printed: false
  }));

  // Obtener datos actuales
  const data = getStorageData();
  
  // Actualizar último número usado
  const lastNumber = getLastCodeNumber(type);
  data.lastNumbers[type] = lastNumber + quantity;
  
  // Agregar nuevo lote y etiquetas
  data.batches.push(batchData);
  data.labels.push(...newLabels);
  
  // Guardar en localStorage
  saveStorageData(data);

  return batchData;
}

export function markLabelsAsPrinted(batchId: string): void {
  const data = getStorageData();
  const now = new Date().toISOString();
  
  // Marcar lote como impreso
  const batch = data.batches.find(b => b.id === batchId);
  if (batch) {
    batch.printed = true;
  }
  
  // Marcar etiquetas como impresas
  data.labels.forEach(label => {
    if (label.batch === batchId) {
      label.printed = true;
      label.printed_at = now;
    }
  });
  
  saveStorageData(data);
}

export function getAllBatches(): LabelBatch[] {
  const data = getStorageData();
  return data.batches.sort((a, b) => 
    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );
}

export function getAllLabels(): Label[] {
  const data = getStorageData();
  return data.labels.sort((a, b) => 
    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );
}

export function getStatistics() {
  const data = getStorageData();
  
  const totalLabels = data.labels.length;
  const printedLabels = data.labels.filter(l => l.printed).length;
  const totalBatches = data.batches.length;
  const printedBatches = data.batches.filter(b => b.printed).length;
  
  const labelsByType: Record<LabelType, number> = {} as Record<LabelType, number>;
  data.labels.forEach(label => {
    labelsByType[label.type] = (labelsByType[label.type] || 0) + 1;
  });
  
  return {
    totalLabels,
    printedLabels,
    pendingLabels: totalLabels - printedLabels,
    totalBatches,
    printedBatches,
    labelsByType,
    lastNumbers: data.lastNumbers
  };
}

export function clearAllData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}