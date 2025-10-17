import { NextRequest, NextResponse } from 'next/server';
import { PrintRequest } from '@/types';
import { markLabelsAsPrinted } from '@/lib/localLabelGenerator';

export async function POST(request: NextRequest) {
  try {
    const body: PrintRequest = await request.json();
    const { batchId } = body;

    if (!batchId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID del lote es requerido' 
        },
        { status: 400 }
      );
    }

    // Marcar las etiquetas como impresas en localStorage
    markLabelsAsPrinted(batchId);

    return NextResponse.json({
      success: true,
      message: 'Etiquetas marcadas como impresas exitosamente'
    });

  } catch (error) {
    console.error('Error marcando etiquetas como impresas:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: 500 }
    );
  }
}