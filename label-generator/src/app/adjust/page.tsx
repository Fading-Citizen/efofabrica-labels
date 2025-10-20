'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LABEL_TYPES } from '@/lib/labelTypes';
import { LABEL_COORDINATES } from '@/lib/labelCoordinates';
import { LabelType } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import { 
  loadCoordinatesFromSupabase, 
  saveCoordinatesToSupabase, 
  saveAllCoordinatesToSupabase 
} from '@/lib/coordinatesService';

export default function AdjustCoordinatesPage() {
  const [selectedType, setSelectedType] = useState<LabelType>('PatchCord');
  const [coords, setCoords] = useState(LABEL_COORDINATES[selectedType]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const labelTypeConfig = LABEL_TYPES.find(t => t.id === selectedType);
  const templateUrl = labelTypeConfig ? `/templates/${labelTypeConfig.template}` : '';

  const WIDTH = 226.77;
  const HEIGHT = 170.08;

  useEffect(() => {
    loadCoordinates();
  }, [selectedType]);

  const loadCoordinates = async () => {
    setIsLoading(true);
    try {
      // Intentar cargar desde Supabase
      const supabaseCoords = await loadCoordinatesFromSupabase(selectedType);
      
      if (supabaseCoords) {
        setCoords(supabaseCoords);
        toast.success('Coordenadas cargadas desde Supabase', { duration: 2000 });
      } else {
        // Fallback a coordenadas por defecto
        setCoords(LABEL_COORDINATES[selectedType]);
        toast('Usando coordenadas por defecto', { icon: '📋', duration: 2000 });
      }
    } catch (error) {
      console.error('Error loading coordinates:', error);
      setCoords(LABEL_COORDINATES[selectedType]);
      toast.error('Error cargando coordenadas, usando valores por defecto');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Precargar imagen solo si hay templateUrl válido
    if (!templateUrl) {
      setImageLoaded(true); // Si no hay URL, mostrar de todos modos
      return;
    }

    console.log('🔄 Cargando plantilla:', templateUrl);
    setImageLoaded(false);
    
    // Dar un pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        console.log('✅ Imagen cargada exitosamente:', templateUrl);
        setImageLoaded(true);
      };
      img.onerror = (e) => {
        console.error('❌ Error cargando imagen:', templateUrl, e);
        toast.error(`No se pudo cargar la plantilla: ${labelTypeConfig?.template}`);
        setImageLoaded(true); // Mostrar de todos modos
      };
      img.src = templateUrl;
    }, 100);

    return () => clearTimeout(timer);
  }, [templateUrl, labelTypeConfig?.template]);

  const addToHistory = (newCoords: any) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCoords);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleMouseDown = (field: string) => {
    setDragging(field);
    addToHistory(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * HEIGHT;

    setCoords(prev => ({
      ...prev,
      [dragging]: { x: Math.round(x), y: Math.round(y) }
    }));
  };

  const handleMouseUp = () => {
    if (dragging) {
      toast.success(`${dragging} actualizado`, { duration: 1000 });
    }
    setDragging(null);
  };

  const handleTypeChange = (type: LabelType) => {
    setSelectedType(type);
  };

  const copyCoordinates = () => {
    const coordsText = `'${selectedType}': {
    ${coords.ILA1 ? `ILA1: { x: ${coords.ILA1.x}, y: ${coords.ILA1.y} },` : ''}
    ${coords.ILA2 ? `ILA2: { x: ${coords.ILA2.x}, y: ${coords.ILA2.y} },` : ''}
    ${coords.RLA1 ? `RLA1: { x: ${coords.RLA1.x}, y: ${coords.RLA1.y} },` : ''}
    ${coords.RLA2 ? `RLA2: { x: ${coords.RLA2.x}, y: ${coords.RLA2.y} },` : ''}
    fontSize: ${coords.fontSize}
  },`;
    
    navigator.clipboard.writeText(coordsText);
    toast.success('¡Coordenadas copiadas!');
  };

  const saveCoordinates = async () => {
    try {
      const success = await saveCoordinatesToSupabase(selectedType, coords, 'EFO Admin');
      if (success) {
        toast.success(`✅ Guardado en Supabase: ${labelTypeConfig?.name}`);
      } else {
        toast.error('Error guardando en Supabase');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error guardando coordenadas');
    }
  };

  const resetCoordinates = async () => {
    const original = LABEL_COORDINATES[selectedType];
    setCoords(original);
    toast.success('Coordenadas restauradas a valores por defecto');
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCoords(history[historyIndex - 1]);
      toast('Deshacer', { icon: '↩️', duration: 1000 });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCoords(history[historyIndex + 1]);
      toast('Rehacer', { icon: '↪️', duration: 1000 });
    }
  };

  const exportAllCoordinates = async () => {
    try {
      toast.loading('Exportando desde Supabase...', { id: 'export' });
      
      // Cargar todas las coordenadas desde Supabase
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.from('label_coordinates').select('*');

      if (error) throw error;

      const allCoords = LABEL_TYPES.map(type => {
        const supabaseCoords = data?.find(d => d.label_type === type.id);
        const coordsToUse = supabaseCoords || LABEL_COORDINATES[type.id];
        
        if (supabaseCoords) {
          return `  '${type.id}': {
    ${supabaseCoords.ila1_x ? `ILA1: { x: ${supabaseCoords.ila1_x}, y: ${supabaseCoords.ila1_y} },` : ''}
    ${supabaseCoords.ila2_x ? `ILA2: { x: ${supabaseCoords.ila2_x}, y: ${supabaseCoords.ila2_y} },` : ''}
    ${supabaseCoords.rla1_x ? `RLA1: { x: ${supabaseCoords.rla1_x}, y: ${supabaseCoords.rla1_y} },` : ''}
    ${supabaseCoords.rla2_x ? `RLA2: { x: ${supabaseCoords.rla2_x}, y: ${supabaseCoords.rla2_y} },` : ''}
    fontSize: ${supabaseCoords.font_size}
  },`;
        } else {
          const coords = LABEL_COORDINATES[type.id];
          return `  '${type.id}': {
    ${coords.ILA1 ? `ILA1: { x: ${coords.ILA1.x}, y: ${coords.ILA1.y} },` : ''}
    ${coords.ILA2 ? `ILA2: { x: ${coords.ILA2.x}, y: ${coords.ILA2.y} },` : ''}
    ${coords.RLA1 ? `RLA1: { x: ${coords.RLA1.x}, y: ${coords.RLA1.y} },` : ''}
    ${coords.RLA2 ? `RLA2: { x: ${coords.RLA2.x}, y: ${coords.RLA2.y} },` : ''}
    fontSize: ${coords.fontSize}
  },`;
        }
      }).join('\n\n');

      const fullText = `export const LABEL_COORDINATES: Record<LabelType, LabelCoordinates> = {\n${allCoords}\n};`;
      navigator.clipboard.writeText(fullText);
      toast.success('¡TODO exportado desde Supabase!', { id: 'export' });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exportando coordenadas', { id: 'export' });
    }
  };

  const fieldColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
    ILA1: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-700', label: 'bg-red-600' },
    ILA2: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-700', label: 'bg-blue-600' },
    RLA1: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700', label: 'bg-green-600' },
    RLA2: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', label: 'bg-yellow-600' },
  };

  const renderMarker = (field: 'ILA1' | 'ILA2' | 'RLA1' | 'RLA2') => {
    if (!coords[field]) return null;

    const color = fieldColors[field];
    const position = coords[field]!;
    
    // Simulación del tamaño del texto en el PDF basado en fontSize
    const fontSize = coords.fontSize || 8;
    const charsCount = 9; // Aproximadamente PC-000001
    const textWidthPx = (fontSize * charsCount * 0.6) * zoom;
    const textHeightPx = (fontSize * 1.2) * zoom;

    // jsPDF.text() por defecto coloca el texto con baseline en la posición Y
    // Esto significa que la posición Y es donde se asienta la base de las letras
    // Para simular esto visualmente, el rectángulo debe estar SOBRE la coordenada Y

    return (
      <div
        key={field}
        className={`absolute cursor-move z-50 transition-all duration-100 ${dragging === field ? 'ring-4 ring-offset-2 ring-opacity-50 scale-110' : 'hover:scale-105'}`}
        style={{ 
          left: `${(position.x / WIDTH) * 100}%`, 
          top: `${(position.y / HEIGHT) * 100}%`,
          transform: 'translate(0, -100%)', // Posiciona el rectángulo ENCIMA de la coordenada Y (baseline)
          transformOrigin: 'left top'
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleMouseDown(field);
        }}
      >
        {/* Rectángulo simulando el campo de texto */}
        <div 
          className={`${color.bg} ${color.border} border-3 rounded shadow-xl flex items-center justify-start px-1 relative`}
          style={{
            width: `${textWidthPx}px`,
            height: `${textHeightPx}px`,
            minWidth: '40px',
            minHeight: '10px'
          }}
        >
          {/* Texto de ejemplo dentro del rectángulo */}
          <span className={`${color.text} font-mono font-bold whitespace-nowrap`} style={{ fontSize: `${fontSize * zoom}px` }}>
            PC-000001
          </span>
          
          {/* Línea guía mostrando el baseline (posición Y exacta) */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 opacity-50" style={{ zIndex: 100 }}></div>
          
          {/* Punto indicador de la posición X exacta */}
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-red-600 rounded-full" style={{ transform: 'translate(-50%, 50%)', zIndex: 101 }}></div>
          
          {/* Esquinas para indicar que es draggable */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-white border-l-2 border-t-2 border-gray-400"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-white border-r-2 border-t-2 border-gray-400"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-white border-l-2 border-b-2 border-gray-400"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-white border-r-2 border-b-2 border-gray-400"></div>
        </div>
        
        {/* Etiqueta con el nombre del campo y coordenadas */}
        {showLabels && (
          <div className={`absolute -top-8 left-1/2 -translate-x-1/2 ${color.label} text-white text-xs font-bold px-3 py-1 rounded shadow-xl whitespace-nowrap border-2 border-white z-10`}>
            {field} ({position.x}, {position.y})
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Toaster position="top-right" />
      
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎯 Ajustador de Coordenadas</h1>
              <p className="text-sm text-gray-600 mt-1">Sistema de calibración de etiquetas EFO</p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <button
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <span>←</span>
                  <span>Volver al Generador</span>
                </button>
              </Link>
              <button
                onClick={exportAllCoordinates}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
              >
                📦 Exportar Todo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-700">📄 Tipo de Etiqueta</label>
              <select
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value as LabelType)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg font-medium focus:border-blue-500 focus:outline-none transition-colors"
              >
                {LABEL_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.prefix})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">� Tamaño de Fuente</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCoords(prev => ({ ...prev, fontSize: Math.max(4, (prev.fontSize || 8) - 1) }))}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
                >
                  −
                </button>
                <div className="flex-1 text-center">
                  <input
                    type="number"
                    min="4"
                    max="20"
                    value={coords.fontSize || 8}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 8;
                      setCoords(prev => ({ ...prev, fontSize: Math.max(4, Math.min(20, val)) }));
                    }}
                    className="w-full px-2 py-2 border-2 border-gray-200 rounded text-center font-bold text-blue-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setCoords(prev => ({ ...prev, fontSize: Math.min(20, (prev.fontSize || 8) + 1) }))}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">�👁️ Visualización</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showGrid ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showLabels ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Labels
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">⏮️ Historial</label>
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                >
                  ↩️
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                >
                  ↪️
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">🖼️ Editor Visual</h2>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600">Zoom:</span>
                    <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 font-bold">−</button>
                    <span className="font-mono font-bold text-blue-600 min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(Math.min(2, zoom + 0.25))} className="px-3 py-1 bg-white border rounded hover:bg-gray-50 font-bold">+</button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50">
                {!imageLoaded && (
                  <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 font-medium">Cargando plantilla...</p>
                  </div>
                )}
                
                <div className="overflow-auto" style={{ maxHeight: '70vh', display: imageLoaded ? 'block' : 'none' }}>
                  <div 
                    className="relative border-4 border-gray-400 bg-white cursor-crosshair mx-auto shadow-2xl"
                    style={{ 
                      width: `${600 * zoom}px`,
                      aspectRatio: `${WIDTH} / ${HEIGHT}`,
                      backgroundImage: `url(${templateUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      minHeight: '300px'
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {showGrid && (
                      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
                        backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                        backgroundSize: `${20 * zoom}px ${20 * zoom}px`
                      }} />
                    )}

                    {imageLoaded && renderMarker('ILA1')}
                    {imageLoaded && renderMarker('ILA2')}
                    {imageLoaded && renderMarker('RLA1')}
                    {imageLoaded && renderMarker('RLA2')}

                    {dragging && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        Arrastrando {dragging}...
                      </div>
                    )}
                    
                    {/* Debug info */}
                    {imageLoaded && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {WIDTH.toFixed(0)}x{HEIGHT.toFixed(0)}pt
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  💡 <span className="font-medium">Arrastra los puntos de colores</span> para ajustar las coordenadas
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b">
                <h3 className="font-bold text-gray-900">📍 Coordenadas</h3>
              </div>
              <div className="p-4 space-y-3">
                {coords.ILA1 && (
                  <div className="p-3 bg-red-50 rounded-lg border-2 border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-700">🔴 ILA1</span>
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded">x: {coords.ILA1.x}, y: {coords.ILA1.y}</span>
                    </div>
                  </div>
                )}

                {coords.ILA2 && (
                  <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700">🔵 ILA2</span>
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded">x: {coords.ILA2.x}, y: {coords.ILA2.y}</span>
                    </div>
                  </div>
                )}

                {coords.RLA1 && (
                  <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-700">🟢 RLA1</span>
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded">x: {coords.RLA1.x}, y: {coords.RLA1.y}</span>
                    </div>
                  </div>
                )}

                {coords.RLA2 && (
                  <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-yellow-700">🟡 RLA2</span>
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded">x: {coords.RLA2.x}, y: {coords.RLA2.y}</span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <label className="font-bold text-gray-700 block mb-2">📏 Tamaño de Fuente</label>
                  <input
                    type="range"
                    value={coords.fontSize}
                    onChange={(e) => setCoords(prev => ({ ...prev, fontSize: parseFloat(e.target.value) }))}
                    className="w-full"
                    step="0.5"
                    min="6"
                    max="12"
                  />
                  <div className="text-center font-mono font-bold text-blue-600 mt-1">{coords.fontSize}pt</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b">
                <h3 className="font-bold text-gray-900">⚡ Acciones</h3>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={saveCoordinates}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  💾 Guardar
                </button>
                <button
                  onClick={copyCoordinates}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  📋 Copiar Código
                </button>
                <button
                  onClick={resetCoordinates}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  🔄 Resetear
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b">
                <h3 className="font-bold text-gray-900">💻 Código</h3>
              </div>
              <div className="p-4">
                <pre className="text-xs font-mono bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`'${selectedType}': {
  ${coords.ILA1 ? `ILA1: { x: ${coords.ILA1.x}, y: ${coords.ILA1.y} },` : ''}
  ${coords.ILA2 ? `ILA2: { x: ${coords.ILA2.x}, y: ${coords.ILA2.y} },` : ''}
  ${coords.RLA1 ? `RLA1: { x: ${coords.RLA1.x}, y: ${coords.RLA1.y} },` : ''}
  ${coords.RLA2 ? `RLA2: { x: ${coords.RLA2.x}, y: ${coords.RLA2.y} },` : ''}
  fontSize: ${coords.fontSize}
},`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
          <h3 className="font-bold text-blue-900 mb-4 text-lg">📖 Guía de Uso</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-bold text-blue-800 mb-2">🎯 Editor Visual</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Arrastra los puntos de colores sobre la plantilla</li>
                <li>• Usa los controles de Zoom para mayor precisión</li>
                <li>• Activa el Grid para alineación perfecta</li>
                <li>• Las coordenadas se actualizan en tiempo real</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-blue-800 mb-2">💾 Gestión</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Guarda para persistir en localStorage</li>
                <li>• Copia el código para pegarlo en labelCoordinates.ts</li>
                <li>• Exporta Todo para obtener todas las configuraciones</li>
                <li>• Usa Undo/Redo para deshacer cambios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
