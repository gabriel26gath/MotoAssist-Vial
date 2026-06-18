import React, { useState, useEffect, useRef } from "react";
import { 
  RotateCw, 
  RotateCcw, 
  Sliders, 
  Sparkles, 
  X, 
  Check, 
  Sun, 
  Contrast, 
  Eye, 
  ScanLine, 
  Zap 
} from "lucide-react";

interface ImagePreprocessorProps {
  imageSrc: string;
  onConfirm: (optimizedBase64: string) => void;
  onClose: () => void;
}

export default function ImagePreprocessor({ imageSrc, onConfirm, onClose }: ImagePreprocessorProps) {
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [brightness, setBrightness] = useState(15); // Default slight boost
  const [contrast, setContrast] = useState(25); // Default slight boost for receipts
  const [preset, setPreset] = useState<"thermal" | "grayscale" | "none">("thermal"); // Default thermal mode works best
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    let active = true;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (!active) return;
      applyFilters(img);
    };
    return () => {
      active = false;
    };
  }, [imageSrc, rotation, brightness, contrast, preset]);

  const applyFilters = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Manejo de Rotación
    const isRotated90or270 = rotation === 90 || rotation === 270;
    const width = isRotated90or270 ? img.height : img.width;
    const height = isRotated90or270 ? img.width : img.height;

    // Escalar la imagen a un tamaño óptimo para OCR si es demasiado grande
    // pero manteniendo suficiente resolución (ej. maximo 1000px de ancho/alto)
    const MAX_DIM = 1200;
    let finalWidth = width;
    let finalHeight = height;

    if (width > MAX_DIM || height > MAX_DIM) {
      if (width > height) {
        finalHeight = Math.round((height * MAX_DIM) / width);
        finalWidth = MAX_DIM;
      } else {
        finalWidth = Math.round((width * MAX_DIM) / height);
        finalHeight = MAX_DIM;
      }
    }

    canvas.width = finalWidth;
    canvas.height = finalHeight;

    // Configurar transformaciones basadas en la rotación
    ctx.clearRect(0, 0, finalWidth, finalHeight);
    ctx.translate(finalWidth / 2, finalHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Ajustar dimensiones originales según escalado
    const scale = finalWidth / width;
    const drawW = (isRotated90or270 ? height : width) * scale;
    const drawH = (isRotated90or270 ? width : height) * scale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    // Resetear transformaciones para manipulación de pixeles
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 2. Manipulación de Píxeles (Filtros de brillo, contraste, escala de grises o térmica)
    try {
      const imgData = ctx.getImageData(0, 0, finalWidth, finalHeight);
      const data = imgData.data;

      const brightnessVal = brightness;
      // Convertir contraste de -100..100 a un factor multiplicador
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // A. Brillo
        if (brightnessVal !== 0) {
          r += brightnessVal;
          g += brightnessVal;
          b += brightnessVal;
        }

        // B. Contraste
        if (contrast !== 0) {
          r = contrastFactor * (r - 128) + 128;
          g = contrastFactor * (g - 128) + 128;
          b = contrastFactor * (b - 128) + 128;
        }

        // C. Presets
        if (preset === "grayscale") {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = g = b = gray;
        } else if (preset === "thermal") {
          // Binarización inteligente adaptativa local o umbralización severa para resaltar tinta térmica
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          // Si el contraste es extremadamente oscuro ponemos negro, de lo contrario blanco
          const threshold = 125;
          const val = gray > threshold ? 255 : 0;
          
          // Suavizado leve para no pixelear en exceso
          r = g = b = val;
        }

        // Guardar valores con límites de seguridad [0, 255]
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }

      ctx.putImageData(imgData, 0, 0);
      setPreviewUrl(canvas.toDataURL("image/jpeg", 0.9));
    } catch (e) {
      console.error("No se pudo obtener ImageData del canvas virtual:", e);
      // Fallback a dibujo plano
      setPreviewUrl(canvas.toDataURL("image/jpeg", 0.8));
    }
  };

  const handleRotateCw = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleRotateCcw = () => {
    setRotation(prev => (prev - 90 + 360) % 360);
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    // Demoramos unos ms para una animación fluida
    setTimeout(() => {
      onConfirm(previewUrl);
      setIsProcessing(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 md:p-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[90vh] md:h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Cabecera del Preprocesador */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Sliders className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold uppercase text-slate-100 tracking-wider">
                Laboratorio de Optimización de Filtros OCR
              </h2>
              <p className="text-[10px] text-zinc-450 mt-0.5">
                Mejora contraste, cambia rotación y binariza la matriz térmica física.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo del Editor */}
        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden min-h-0 bg-slate-950/35">
          
          {/* Columna Izquierda: Visualizador de Imagen */}
          <div className="flex-1 p-4 flex flex-col justify-center items-center relative overflow-y-auto">
            
            {/* Biometric-like bounding frame overlay container */}
            <div className="relative max-w-full max-h-[350px] md:max-h-[450px] aspect-[3/4] p-2 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
              
              {/* Image preview */}
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Optimización de ticket" 
                  className="max-w-full max-h-full object-contain rounded transition-all duration-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <div className="animate-spin h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <span className="text-xs">Cargando lienzo...</span>
                </div>
              )}

              {/* Holographic scanning / biometric target guide */}
              <div className="absolute inset-4 pointer-events-none border-2 border-emerald-500/20 rounded z-10 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-emerald-500"></div>
                  <div className="w-5 h-5 border-t-2 border-r-2 border-emerald-500"></div>
                </div>
                
                {/* Active scan line sweep animation effect */}
                <div className="w-full h-[0.5px] bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-[bounce_4s_infinite_ease-in-out]"></div>
                
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-2 border-l-2 border-emerald-500"></div>
                  <div className="w-5 h-5 border-b-2 border-r-2 border-emerald-500"></div>
                </div>
              </div>

              {/* Status bar top */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded border border-white/5 pointer-events-none text-[9px] font-mono select-none">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  LENTE ROI ACTIVADO
                </div>
                <div className="text-slate-400">
                  FILTRO: {preset === "thermal" ? "TÉRMICO EXTREMO" : preset === "grayscale" ? "ESCALA GRISES" : "NINGUNO"}
                </div>
              </div>

              {/* Resolution indicator of virtual canvas */}
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] text-slate-400 font-mono pointer-events-none select-none border border-white/5">
                Rotación: {rotation}°
              </div>
            </div>

            {/* Hidden canvas for operations */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Columna Derecha: Controles del Filtro / Preprocesador */}
          <div className="w-full md:w-80 p-4 md:p-5 flex flex-col gap-5 shrink-0 bg-slate-900/40 overflow-y-auto">
            
            {/* Controles de Rotación */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-amber-500" />
                Orientación Correcta
              </span>
              <p className="text-[11px] text-slate-450 leading-relaxed">
                Rotar la imagen para que el texto quede completamente horizontal y de arriba a abajo.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleRotateCcw}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-300 font-semibold transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Ir Izquierda
                </button>
                <button
                  type="button"
                  onClick={handleRotateCw}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-300 font-semibold transition cursor-pointer"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  Ir Derecha
                </button>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Selector de Presets */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
                <Eye className="h-3 w-3 text-amber-500" />
                Filtros de Contraste Biométricos
              </span>
              <div className="flex flex-col gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => setPreset("thermal")}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-semibold text-left transition text-white cursor-pointer ${
                    preset === "thermal" 
                      ? "bg-amber-600/10 border-amber-500/40" 
                      : "bg-slate-950 border-slate-800 hover:bg-slate-850"
                  }`}
                >
                  <div>
                    <span className="block font-bold">Filtro Matricial Térmico</span>
                    <span className="text-[9.5px] text-slate-400 block font-normal mt-0.5">Binariza pixeles. Ideal para tintas borrosas.</span>
                  </div>
                  {preset === "thermal" && <Check className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPreset("grayscale")}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-semibold text-left transition text-white cursor-pointer ${
                    preset === "grayscale" 
                      ? "bg-amber-600/10 border-amber-500/40" 
                      : "bg-slate-950 border-slate-800 hover:bg-slate-850"
                  }`}
                >
                  <div>
                    <span className="block font-bold">Escala de Grises Nítida</span>
                    <span className="text-[9.5px] text-slate-400 block font-normal mt-0.5">Elimina ruido y colores del fondo de papel.</span>
                  </div>
                  {preset === "grayscale" && <Check className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPreset("none")}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-semibold text-left transition text-white cursor-pointer ${
                    preset === "none" 
                      ? "bg-amber-600/10 border-amber-500/40" 
                      : "bg-slate-950 border-slate-800 hover:bg-slate-850"
                  }`}
                >
                  <div>
                    <span className="block font-bold">Imagen Original</span>
                    <span className="text-[9.5px] text-slate-450 block font-normal mt-0.5">Mantiene colores y composición original de foto.</span>
                  </div>
                  {preset === "none" && <Check className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                </button>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Ajustes Avanzados de Brillo / Contraste */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-amber-500" />
                Ajuste Manual Recíproco
              </span>

              {/* Control Brillo */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Sun className="h-3 w-3 text-slate-455" /> Brillo
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{(brightness > 0 ? "+" : "") + brightness}</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg"
                />
              </div>

              {/* Control Contraste */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Contrast className="h-3 w-3 text-slate-455" /> Contraste
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{(contrast > 0 ? "+" : "") + contrast}</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="80"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg"
                />
              </div>
            </div>

            {/* Información adicional del optimizador */}
            <div className="mt-auto p-2 bg-amber-500/5 rounded-lg border border-amber-500/10 text-[9.5px] text-slate-400/80 leading-relaxed flex gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                <strong>Sugerencia:</strong> El filtro matricial resalta la tinta negra al quemar el fondo blanco, incrementando dramáticamente el porcentaje de éxito en el OCR de Gemini.
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Acciones del Pie */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-320 rounded-lg font-semibold transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2 text-xs bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 font-extrabold transition cursor-pointer shadow-lg shadow-amber-950/20 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isProcessing ? "Procesando..." : "Optimizar e Iniciar Análisis"}
          </button>
        </div>
      </div>
    </div>
  );
}
