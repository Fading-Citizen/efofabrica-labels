'use client';

import React, { useState } from 'react';
import { LabelTypeConfig, GenerateLabelResponse, Label } from '@/types';
import { LABEL_TYPES } from '@/lib/labelTypes';

interface LabelGeneratorProps {}

export default function LabelGenerator({}: LabelGeneratorProps) {
  const [selectedType, setSelectedType] = useState<LabelTypeConfig | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLabels, setGeneratedLabels] = useState<Label[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleTypeSelect = (type: LabelTypeConfig) => {
    setSelectedType(type);
    setGeneratedLabels([]);
    setError(null);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 1000) {
      setQuantity(value);
    }
  };

  const generateLabels = async () => {
    if (!selectedType) {
      setError('Selecciona un tipo de etiqueta');
      return;
    }

    setIsGenerating(true);
    setError(null);

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
      setError(null);

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error generando etiquetas');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              EFO Label Generator
            </h1>
            <div className="text-sm text-gray-500">
              Sistema Local • Sin Base de Datos
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Selector de Tipo */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Seleccionar Tipo de Etiqueta
              </h2>
              
              <div className="space-y-2">
                {LABEL_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedType?.id === type.id
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-gray-500">{type.prefix}-XXXXXX</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Configuración y Generación */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Generar Etiquetas
              </h2>

              {!selectedType ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Selecciona un tipo de etiqueta para continuar
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Tipo Seleccionado */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-medium text-blue-600">{selectedType.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedType.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Formato: {selectedType.prefix}-XXXXXX
                    </p>
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad de Etiquetas (1-1000)
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max="1000"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Botón Generar */}
                  <div>
                    <button
                      onClick={generateLabels}
                      disabled={isGenerating}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generando...
                        </>
                      ) : (
                        'Generar Códigos'
                      )}
                    </button>
                  </div>

                  {/* Etiquetas Generadas */}
                  {generatedLabels.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Etiquetas Generadas ({generatedLabels.length})
                      </h3>
                      
                      <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                          {generatedLabels.map((label, index) => (
                            <div
                              key={index}
                              className="bg-white px-3 py-2 rounded border text-sm font-mono"
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
        </div>
      </div>
    </div>
  );
}