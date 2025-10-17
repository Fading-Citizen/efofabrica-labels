'use client';

import React, { useState } from 'react';
import { LabelTypeConfig, GenerateLabelResponse, Label } from '@/types';
import { LABEL_TYPES } from '@/lib/labelTypes';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

export default function LabelGeneratorSimple() {
  const [selectedType, setSelectedType] = useState<LabelTypeConfig | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [generatedLabels, setGeneratedLabels] = useState<Label[]>([]);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);

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

      // Crear PDF con las etiquetas
      // Tamaño: 80mm x 60mm = 226.77 x 170.08 pixels a 72 DPI
      // En jsPDF usamos unidades en mm directamente
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [80, 60]
      });

      generatedLabels.forEach((label, index) => {
        if (index > 0) {
          pdf.addPage([80, 60], 'landscape');
        }

        // Fondo blanco
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, 80, 60, 'F');

        // Logo EFO (simulado con texto)
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 51, 102); // #003366
        pdf.text('EFO', 5, 10);

        // Línea separadora
        pdf.setDrawColor(0, 51, 102);
        pdf.setLineWidth(0.5);
        pdf.line(5, 13, 75, 13);

        // Tipo de producto
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(selectedType.name, 5, 20);

        // Código de etiqueta (PRINCIPAL)
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        const codeWidth = pdf.getTextWidth(label.code);
        pdf.text(label.code, (80 - codeWidth) / 2, 35);

        // Fecha
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120, 120, 120);
        const date = label.created_at 
          ? new Date(label.created_at).toLocaleDateString('es-CL')
          : new Date().toLocaleDateString('es-CL');
        pdf.text(`Fecha: ${date}`, 5, 52);

        // Número de serie en la etiqueta
        pdf.setFontSize(7);
        pdf.text(`${index + 1}/${generatedLabels.length}`, 70, 52);

        // Borde de la etiqueta
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.rect(2, 2, 76, 56);
      });

      // Descargar PDF
      const fileName = `EFO_${selectedType.prefix}_${generatedLabels.length}_etiquetas_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success(`PDF generado: ${fileName}`);

      // Abrir diálogo de impresión
      setTimeout(() => {
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl, '_blank');
        
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
