'use client';

import React from 'react';
import { Label } from '@/types';

interface LabelPreviewProps {
  labels: Label[];
  onClose: () => void;
  onPrint: () => void;
}

export default function LabelPreview({ labels, onClose, onPrint }: LabelPreviewProps) {
  const getBrandFromType = (type: string): string => {
    if (type.includes('RIMPORT')) return 'RIMPORT';
    if (type.includes('COENTEL')) return 'COENTEL';
    return 'EFO';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Vista Previa de Etiquetas ({labels.length})
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={onPrint}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Imprimir Ahora
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {labels.map((label, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
                style={{
                  width: '160px',
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {/* Brand */}
                <div className="text-sm font-bold text-gray-800 mb-2">
                  {getBrandFromType(label.type)}
                </div>
                
                {/* Code */}
                <div className="text-lg font-bold text-center mb-2">
                  {label.code}
                </div>
                
                {/* Type */}
                <div className="text-xs text-gray-600 text-center">
                  {label.type}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Tamaño real: 80mm x 60mm cada etiqueta
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={onPrint}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Confirmar Impresión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}