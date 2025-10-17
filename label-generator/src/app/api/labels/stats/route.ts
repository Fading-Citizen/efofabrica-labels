import { NextResponse } from 'next/server';
import { getStatistics } from '@/lib/localLabelGenerator';

export async function GET() {
  try {
    const stats = getStatistics();
    
    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error obteniendo estadísticas'
      },
      { status: 500 }
    );
  }
}