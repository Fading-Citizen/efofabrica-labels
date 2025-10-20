'use client';

import React, { useState, useEffect } from 'react';
import { LabelTypeConfig, GenerateLabelResponse, Label } from '@/types';
import { LABEL_TYPES } from '@/lib/labelTypes';
import { LABEL_COORDINATES, LabelCoordinates } from '@/lib/labelCoordinates';
import { loadCoordinatesFromSupabase } from '@/lib/coordinatesService';
import toast from 'react-hot-toast';

export default function LabelGeneratorSimple() {
  const [selectedType, setSelectedType] = useState<LabelTypeConfig | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [generatedLabels, setGeneratedLabels] = useState<Label[]>([]);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<LabelCoordinates | null>(null);

  // Cargar coordenadas cuando se selecciona un tipo
  useEffect(() => {
    if (selectedType) {
      loadCoordinatesForType(selectedType.id);
    }
  }, [selectedType]);

  const loadCoordinatesForType = async (labelType: string) => {
    try {
      const supabaseCoords = await loadCoordinatesFromSupabase(labelType as any);
      
      if (supabaseCoords) {
        setCoordinates(supabaseCoords);
      } else {
        // Fallback a coordenadas locales
        setCoordinates(LABEL_COORDINATES[labelType as keyof typeof LABEL_COORDINATES]);
      }
    } catch (error) {
      console.error('Error loading coordinates:', error);
      // Usar coordenadas locales como fallback
      setCoordinates(LABEL_COORDINATES[labelType as keyof typeof LABEL_COORDINATES]);
    }
  };

  const handleTypeSelect = (type: LabelTypeConfig) => {
    setSelectedType(type);
    setGeneratedLabels([]);
    setCurrentBatchId(null);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 1000) {
      setQuantity(value);
    }
  };

  const generateLabels = async () => {
    if (!selectedType) {
      toast.error('Selecciona un tipo de etiqueta');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/labels/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType.id,
          quantity,
        }),
      });

      const data: GenerateLabelResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error generando etiquetas');
      }

      setGeneratedLabels(data.labels);
      setCurrentBatchId(data.batch.id);
      toast.success(`${data.labels.length} etiquetas generadas`);

    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error generando etiquetas');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    if (generatedLabels.length === 0) {
      toast.error('No hay etiquetas para imprimir');
      return;
    }

    if (!selectedType || !currentBatchId) {
      toast.error('Error: falta información del lote');
      return;
    }

    if (!coordinates) {
      toast.error('Error: coordenadas no disponibles');
      return;
    }

    setIsPrinting(true);

    try {
      // Marcar como impresas en el servidor
      const response = await fetch('/api/labels/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: currentBatchId,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Error marcando etiquetas como impresas');
      }

      // Importar jsPDF dinámicamente
      const { jsPDF } = await import('jspdf');

      // Crear PDF (80mm x 60mm en puntos: 226.77 x 170.08)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [170.08, 226.77]
      });

      // Usar coordenadas cargadas (desde Supabase o fallback local)
      const coords = coordinates;
      const fontSize = coords.fontSize;

      // Procesar cada etiqueta
      for (let i = 0; i < generatedLabels.length; i++) {
        const label = generatedLabels[i];

        if (i > 0) {
          pdf.addPage();
        }

        // Cargar imagen de plantilla
        const templateUrl = `/templates/${selectedType.template}`;
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = (e) => {
            console.error('Error cargando plantilla:', templateUrl, e);
            reject(e);
          };
          image.src = templateUrl;
        });

        // Agregar imagen al PDF (cubrir toda la página)
        pdf.addImage(img, 'JPEG', 0, 0, 226.77, 170.08);

        // Configurar texto
        pdf.setFontSize(fontSize);
        pdf.setTextColor(0, 0, 0);

        // Dibujar código en cada campo que exista
        if (coords.ILA1) {
          pdf.text(label.code, coords.ILA1.x, coords.ILA1.y);
        }

        if (coords.ILA2) {
          pdf.text(label.code, coords.ILA2.x, coords.ILA2.y);
        }

        if (coords.RLA1) {
          pdf.text(label.code, coords.RLA1.x, coords.RLA1.y);
        }

        if (coords.RLA2) {
          pdf.text(label.code, coords.RLA2.x, coords.RLA2.y);
        }
      }

      // Generar blob del PDF
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      // Descargar PDF
      const fileName = `EFO_${selectedType.prefix}_${generatedLabels.length}_etiquetas_${new Date().toISOString().split('T')[0]}.pdf`;
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();

      toast.success(`PDF generado: ${fileName}`);

      // Abrir diálogo de impresión
      setTimeout(() => {
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      }, 500);

    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error generando PDF');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '400px 1fr', 
      minHeight: 'calc(100vh - 100px)'
    }}>
      
      {/* Panel Izquierdo - Selector de Tipo */}
      <div style={{ 
        borderRight: '1px solid #e0e0e0',
        padding: '30px 20px',
        backgroundColor: '#fafafa'
      }}>
        <h2 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '20px',
          color: '#333',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Tipo de Etiqueta
        </h2>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px' 
        }}>
          {LABEL_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeSelect(type)}
              style={{
                padding: '12px 15px',
                border: selectedType?.id === type.id ? '2px solid #003366' : '1px solid #d0d0d0',
                backgroundColor: selectedType?.id === type.id ? '#f0f4f8' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                if (selectedType?.id !== type.id) {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#003366';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedType?.id !== type.id) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d0d0d0';
                }
              }}
            >
              <div style={{ 
                fontWeight: selectedType?.id === type.id ? '600' : '500', 
                color: '#333',
                marginBottom: '3px',
                fontSize: '14px'
              }}>
                {type.name}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#888',
                fontFamily: 'monospace'
              }}>
                {type.prefix}-XXXXXX
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Panel Derecho - Generación e Impresión */}
      <div style={{ padding: '30px 40px', backgroundColor: 'white' }}>
        
        {!selectedType ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '100px 0',
            color: '#999'
          }}>
            <p style={{ fontSize: '16px', margin: 0 }}>
              Seleccione un tipo de etiqueta para comenzar
            </p>
          </div>
        ) : (
          <div>
            {/* Info del tipo seleccionado */}
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '4px',
              marginBottom: '30px',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{ 
                fontWeight: '600', 
                color: '#003366',
                marginBottom: '8px',
                fontSize: '18px'
              }}>
                {selectedType.name}
              </h3>
              <p style={{ 
                fontSize: '13px', 
                color: '#666',
                margin: '5px 0 10px 0',
                lineHeight: '1.5'
              }}>
                {selectedType.description}
              </p>
              <p style={{ 
                fontSize: '12px', 
                color: '#888',
                fontFamily: 'monospace',
                margin: 0
              }}>
                Formato: {selectedType.prefix}-XXXXXX
              </p>
              <p style={{ 
                fontSize: '11px', 
                color: '#999',
                margin: '5px 0 0 0'
              }}>
                Plantilla: {selectedType.template}
              </p>
            </div>

            {/* Formulario de generación */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Cantidad */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  color: '#555',
                  marginBottom: '8px'
                }}>
                  Cantidad (1-1000)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={handleQuantityChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#003366'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d0d0d0'}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{
              display: 'flex',
              gap: '15px',
              marginBottom: '30px'
            }}>
              <button
                onClick={generateLabels}
                disabled={isGenerating}
                style={{
                  flex: 1,
                  backgroundColor: isGenerating ? '#cccccc' : '#003366',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  if (!isGenerating) e.currentTarget.style.backgroundColor = '#004080';
                }}
                onMouseLeave={(e) => {
                  if (!isGenerating) e.currentTarget.style.backgroundColor = '#003366';
                }}
              >
                {isGenerating ? 'Generando...' : 'Generar Códigos'}
              </button>

              {generatedLabels.length > 0 && (
                <button
                  onClick={generatePDF}
                  disabled={isPrinting}
                  style={{
                    flex: 1,
                    backgroundColor: isPrinting ? '#cccccc' : '#006633',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isPrinting ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isPrinting) e.currentTarget.style.backgroundColor = '#007a3d';
                  }}
                  onMouseLeave={(e) => {
                    if (!isPrinting) e.currentTarget.style.backgroundColor = '#006633';
                  }}
                >
                  {isPrinting ? 'Generando PDF...' : `Imprimir PDF (${generatedLabels.length})`}
                </button>
              )}
            </div>

            {/* Lista de etiquetas generadas */}
            {generatedLabels.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  <h3 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#333',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Etiquetas Generadas
                  </h3>
                  <span style={{
                    backgroundColor: '#003366',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {generatedLabels.length}
                  </span>
                </div>
                
                <div style={{ 
                  backgroundColor: '#fafafa', 
                  borderRadius: '4px', 
                  padding: '20px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                    gap: '10px' 
                  }}>
                    {generatedLabels.map((label, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: 'white',
                          padding: '10px 12px',
                          borderRadius: '3px',
                          fontSize: '13px',
                          fontFamily: 'monospace',
                          fontWeight: '600',
                          border: '1px solid #d0d0d0',
                          color: '#333',
                          textAlign: 'center'
                        }}
                      >
                        {label.code}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
