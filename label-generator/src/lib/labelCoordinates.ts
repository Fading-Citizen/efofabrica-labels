import { LabelType } from '@/types';

// Coordenadas para cada campo en las plantillas (en puntos)
// 80mm x 60mm = 226.77 x 170.08 puntos
// jsPDF: origen (0,0) en esquina SUPERIOR izquierda
// Y aumenta hacia ABAJO, X aumenta hacia la derecha

export interface LabelCoordinates {
  ILA1?: { x: number; y: number };  // Izquierda Línea Arriba 1
  ILA2?: { x: number; y: number };  // Izquierda Línea Arriba 2
  RLA1?: { x: number; y: number };  // Derecha (A1:) Línea Arriba 1
  RLA2?: { x: number; y: number };  // Derecha (A2:) Línea Arriba 2
  fontSize: number;
}

export const LABEL_COORDINATES: Record<LabelType, LabelCoordinates> = {
  // PatchCord EFO - 4 campos (ILA1, ILA2, A1, A2)
  // Coordenadas ajustadas para etiqueta 80x60mm (226.77 x 170.08 pts)
  'PatchCord': {
    ILA1: { x: 50, y: 60 },    // Después de "ILA1:" (más abajo)
    ILA2: { x: 50, y: 75 },    // Después de "ILA2:" (más abajo)
    RLA1: { x: 170, y: 60 },   // Después de "A1:" (más abajo)
    RLA2: { x: 170, y: 75 },   // Después de "A2:" (más abajo)
    fontSize: 8
  },
  
  // PatchCord RIMPORT - 4 campos
  'PatchCord RIMPORT': {
    ILA1: { x: 50, y: 25 },
    ILA2: { x: 50, y: 38 },
    RLA1: { x: 170, y: 25 },
    RLA2: { x: 170, y: 38 },
    fontSize: 8
  },
  
  // PatchCord COENTEL - 4 campos
  'PatchCord COENTEL': {
    ILA1: { x: 50, y: 25 },
    ILA2: { x: 50, y: 38 },
    RLA1: { x: 170, y: 25 },
    RLA2: { x: 170, y: 38 },
    fontSize: 8
  },
  
  // PatchCord Duplex EFO - 4 campos
  'PatchCord Duplex': {
    ILA1: { x: 50, y: 25 },
    ILA2: { x: 50, y: 38 },
    RLA1: { x: 170, y: 25 },
    RLA2: { x: 170, y: 38 },
    fontSize: 8
  },
  
  // PatchCord Duplex RIMPORT - 4 campos
  'PatchCord Duplex RIMPORT': {
    ILA1: { x: 50, y: 25 },
    ILA2: { x: 50, y: 38 },
    RLA1: { x: 170, y: 25 },
    RLA2: { x: 170, y: 38 },
    fontSize: 8
  },
  
  // PatchCord Duplex COENTEL - 4 campos
  'PatchCord Duplex COENTEL': {
    ILA1: { x: 50, y: 25 },
    ILA2: { x: 50, y: 38 },
    RLA1: { x: 170, y: 25 },
    RLA2: { x: 170, y: 38 },
    fontSize: 8
  },
  
  // Pigtail EFO - 2 campos (solo lado izquierdo)
  'Pigtail': {
    ILA1: { x: 50, y: 25 },
    ILA2: { x: 50, y: 38 },
    fontSize: 8
  },
  
  // Pigtail RIMPORT - 2 campos
  'Pigtail RIMPORT': {
    ILA1: { x: 50, y: 25 },
    ILA2: { x: 50, y: 38 },
    fontSize: 8
  },
  
  // Pigtail COENTEL - 2 campos
  'Pigtail COENTEL': {
    ILA1: { x: 50, y: 25 },
    ILA2: { x: 50, y: 38 },
    fontSize: 8
  },
  
  // Bobina - 2 campos
  'Bobina': {
    ILA1: { x: 50, y: 25 },
    ILA2: { x: 50, y: 38 },
    fontSize: 8
  }
};
