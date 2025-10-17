import { NextRequest, NextResponse } from 'next/server';
import { GenerateLabelRequest, GenerateLabelResponse, Label } from '@/types';
import { generateCodes, saveLabelBatch } from '@/lib/localLabelGenerator';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateLabelRequest = await request.json();
    const { type, quantity } = body;

    // Validaciones
    if (!type || !quantity) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tipo y cantidad son requeridos' 
        } as GenerateLabelResponse,
        { status: 400 }
      );
    }

    if (quantity <= 0 || quantity > 1000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La cantidad debe estar entre 1 y 1000' 
        } as GenerateLabelResponse,
        { status: 400 }
      );
    }

    // Generar códigos secuenciales
    const codes = generateCodes(type, quantity);

    // Guardar el lote en localStorage
    const batch = saveLabelBatch(type, quantity, codes);

    // Crear las etiquetas con los datos completos
    const labels: Label[] = codes.map(code => ({
      id: batch.id + '-' + code,
      code,
      type,
      batch: batch.id,
      printed: false,
      created_at: batch.created_at
    }));

    const response: GenerateLabelResponse = {
      success: true,
      batch,
      labels
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error generando etiquetas:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      } as GenerateLabelResponse,
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'API de generación de etiquetas EFO - Sistema Local',
      status: 'ready'
    },
    { status: 200 }
  );
}