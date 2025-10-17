'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Package, CheckCircle, Clock } from 'lucide-react';
import { LabelType } from '@/types';

interface StatsData {
  totalLabels: number;
  printedLabels: number;
  pendingLabels: number;
  totalBatches: number;
  printedBatches: number;
  labelsByType: Record<LabelType, number>;
  lastNumbers: Record<LabelType, number>;
}

export default function StatsPanel() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/labels/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    // Actualizar stats cada 5 segundos si el panel está abierto
    const interval = setInterval(() => {
      if (isOpen) {
        fetchStats();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!stats) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <BarChart3 className="h-6 w-6" />
      </button>

      {/* Stats Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border w-80 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Resumen General */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-xl font-bold text-blue-600">{stats.totalLabels}</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Impresas</div>
                  <div className="text-xl font-bold text-green-600">{stats.printedLabels}</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                  <div className="text-xl font-bold text-yellow-600">{stats.pendingLabels}</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Lotes</div>
                  <div className="text-xl font-bold text-purple-600">{stats.totalBatches}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Próximos Números */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Próximos Números</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {Object.entries(stats.lastNumbers).map(([type, number]) => (
                <div key={type} className="flex justify-between text-xs">
                  <span className="text-gray-600">{type}:</span>
                  <span className="font-mono font-semibold">
                    {type.includes('PatchCord Duplex RIMPORT') ? 'PCDR' :
                     type.includes('PatchCord Duplex COENTEL') ? 'PCDC' :
                     type.includes('PatchCord Duplex') ? 'PCD' :
                     type.includes('PatchCord RIMPORT') ? 'PCR' :
                     type.includes('PatchCord COENTEL') ? 'PCC' :
                     type.includes('PatchCord') ? 'PC' :
                     type.includes('Pigtail RIMPORT') ? 'PTR' :
                     type.includes('Pigtail COENTEL') ? 'PTC' :
                     type.includes('Pigtail') ? 'PT' :
                     'BB'}-{(number + 1).toString().padStart(6, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Por Tipo */}
          {Object.keys(stats.labelsByType).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Por Tipo</h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {Object.entries(stats.labelsByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-xs">
                    <span className="text-gray-600 truncate">{type}:</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}