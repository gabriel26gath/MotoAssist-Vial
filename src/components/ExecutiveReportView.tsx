import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart4, 
  TrendingDown, 
  TrendingUp, 
  Settings, 
  RotateCcw, 
  Edit3, 
  Save, 
  Sparkles, 
  Info,
  Layers,
  MapPin,
  Calendar,
  Layers2,
  FileSpreadsheet,
  ChevronsRight,
  TrendingUp as TrendIcon,
  Search,
  CheckCircle2,
  Sliders,
  DollarSign,
  Download,
  Brain,
  X,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Scissors,
  ShieldAlert,
  Lock,
  Unlock,
  Palette,
  Type,
  GripVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Star,
  Award,
  Percent,
  Activity,
  LayoutDashboard,
  BarChart3,
  PieChart,
  Table2,
  Grid,
  Share2,
  Check,
  Copy,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  LineChart,
  Line,
  LabelList
} from "recharts";
import { Invoice } from "../types";

interface ExecutiveReportViewProps {
  invoices: Invoice[];
  isSharedView?: boolean;
}

// Estructuras de datos para los históricos de 2025 y 2026
interface HistoricalMonthlyData {
  mes: string;
  val2025: number;
  val2026: number; // Entrada manual para meses históricos
}

interface HistoricalSucursalData {
  sucursal: string;
  meses: { [key: string]: number }; // Enero-Diciembre (excepto el activo calculado)
}

interface MiniTableMediaData {
  [sucursal: string]: {
    flota: number;
    omitidos: number;
    callCenter: number;
    sucursal: number;
  }
}

// Valores iniciales por defecto obtenidos directamente de la captura de pantalla del usuario
const DEFAULT_MONTHS_2025_2026: HistoricalMonthlyData[] = [
  { mes: "ENERO", val2025: 36, val2026: 0 },
  { mes: "FEBRERO", val2025: 54, val2026: 0 },
  { mes: "MARZO", val2025: 56, val2026: 0 },
  { mes: "ABRIL", val2025: 54, val2026: 0 },
  { mes: "MAYO", val2025: 76, val2026: 0 },
  { mes: "JUNIO", val2025: 54, val2026: 0 },
  { mes: "JULIO", val2025: 55, val2026: 0 },
  { mes: "AGOSTO", val2025: 58, val2026: 0 },
  { mes: "SEPTIEMBRE", val2025: 5, val2026: 0 },
  { mes: "OCTUBRE", val2025: 82, val2026: 0 },
  { mes: "NOVIEMBRE", val2025: 42, val2026: 0 },
  { mes: "DICIEMBRE", val2025: 43, val2026: 0 },
];

const SUCURSALES_LIST = [
  "EL DORADO",
  "VIA TOCUMEN",
  "VIA PORRAS",
  "COSTA VERDE",
  "DAVID",
  "CHITRE"
];

const MESES_ABR = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEPT", "OCT", "NOV", "DIC"
];

// Valores iniciales de sucursales por mes para 2026
const INITIAL_SUCURSAL_MONTHS_2026: HistoricalSucursalData[] = SUCURSALES_LIST.map(suc => ({
  sucursal: suc,
  meses: {
    "ENE": 0,
    "FEB": 0,
    "MAR": 0,
    "ABR": 0,
    "MAY": 0,
    "JUN": 0,
    "JUL": 0,
    "AGO": 0,
    "SEPT": 0,
    "OCT": 0,
    "NOV": 0,
    "DIC": 0,
  }
}));

const getAccentColorStyle = (themeName: string) => {
  const themes = {
    amber: {
      text: "text-amber-600",
      bg: "bg-amber-500",
      bgLight: "bg-amber-50",
      border: "border-amber-300",
      ring: "ring-amber-400",
      gradient: "from-amber-500 to-amber-600",
      hex: "#f59e0b",
      hexHover: "#d97706",
      badge: "bg-amber-50 border-amber-200 text-amber-800",
      pill: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      glow: "shadow-amber-500/5 hover:shadow-amber-500/20"
    },
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-500",
      bgLight: "bg-blue-50",
      border: "border-blue-300",
      ring: "ring-blue-400",
      gradient: "from-blue-500 to-blue-600",
      hex: "#3b82f6",
      hexHover: "#1d4ed8",
      badge: "bg-blue-50 border-blue-200 text-blue-800",
      pill: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      glow: "shadow-blue-500/5 hover:shadow-blue-500/20"
    },
    indigo: {
      text: "text-indigo-600",
      bg: "bg-indigo-500",
      bgLight: "bg-indigo-50",
      border: "border-indigo-300",
      ring: "ring-indigo-400",
      gradient: "from-indigo-500 to-indigo-600",
      hex: "#6366f1",
      hexHover: "#4338ca",
      badge: "bg-indigo-50 border-indigo-200 text-indigo-800",
      pill: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      glow: "shadow-indigo-500/5 hover:shadow-indigo-500/20"
    },
    emerald: {
      text: "text-emerald-600",
      bg: "bg-emerald-500",
      bgLight: "bg-emerald-50",
      border: "border-emerald-300",
      ring: "ring-emerald-400",
      gradient: "from-emerald-500 to-emerald-600",
      hex: "#10b981",
      hexHover: "#047857",
      badge: "bg-emerald-50 border-emerald-200 text-emerald-800",
      pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      glow: "shadow-emerald-500/5 hover:shadow-emerald-500/20"
    },
    rose: {
      text: "text-rose-600",
      bg: "bg-rose-500",
      bgLight: "bg-rose-50",
      border: "border-rose-300",
      ring: "ring-rose-400",
      gradient: "from-rose-500 to-rose-600",
      hex: "#f43f5e",
      hexHover: "#be123c",
      badge: "bg-rose-50 border-rose-200 text-rose-800",
      pill: "bg-rose-500/10 text-rose-450 border-rose-500/20",
      glow: "shadow-rose-500/5 hover:shadow-rose-500/20"
    }
  };
  return themes[themeName as keyof typeof themes] || themes.amber;
};

export default function ExecutiveReportView({ invoices, isSharedView = false }: ExecutiveReportViewProps) {
  // Año de análisis dinámico automático basado en el último ticket ingresado
  const activeYear = useMemo(() => {
    const years = invoices
      .map(inv => {
        if (!inv.date) return null;
        const d = new Date(inv.date);
        return isNaN(d.getTime()) ? null : d.getUTCFullYear();
      })
      .filter((y): y is number => y !== null);
    return years.length > 0 ? Math.max(...years) : 2026;
  }, [invoices]);

  // Mes de análisis correspondiente al mes anterior al que se está cursando
  const activeMonthIndex = useMemo(() => {
    const currentMonth = new Date().getMonth(); // 0-11
    return currentMonth === 0 ? 11 : currentMonth - 1;
  }, []);

  // Estados editables que persistirán en localStorage
  const [monthlyData, setMonthlyData] = useState<HistoricalMonthlyData[]>(DEFAULT_MONTHS_2025_2026);
  const [sucursalMonths, setSucursalMonths] = useState<HistoricalSucursalData[]>(INITIAL_SUCURSAL_MONTHS_2026);
  const [isEditing, setIsEditing] = useState(false);
  const [isSuperAdminActive, setIsSuperAdminActive] = useState(false);
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [superAdminPIN, setSuperAdminPIN] = useState("");
  const [superAdminError, setSuperAdminError] = useState("");
  const [editedMonthly, setEditedMonthly] = useState<HistoricalMonthlyData[]>([]);
  const [editedSucursales, setEditedSucursales] = useState<HistoricalSucursalData[]>([]);

  // Feedback de copiado y enlace de compartir público
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const handleCopyShareLink = () => {
    if (typeof window === "undefined") return;
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?view=executive-public`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 3000);
    });
  };

  // Estados para personalización del PDF
  const [pdfTitle, setPdfTitle] = useState("REPORTE EJECUTIVO DE ASISTENCIAS VIALES");
  const [pdfSubtitle, setPdfSubtitle] = useState("Control de Eficiencia Operativa");
  const [showPdfCustomizer, setShowPdfCustomizer] = useState(false);

  // Títulos de secciones editables antes de descargar
  const [sectionTitles, setSectionTitles] = useState({
    kpis: "RESUMEN DE INDICADORES OPERATIVOS (YTD)",
    kpi_ytd: "KPI: ASISTENCIAS ACUMULADAS YTD",
    kpi_leader: "KPI: CANAL O MEDIO LÍDER YTD",
    kpi_change: "KPI: VARIACIÓN VERSUS MES ANTERIOR",
    kpi_yoy: "KPI: VARIACIÓN ACUMULADO YoY",
    bar_trend: "EVOLUCIÓN MENSUAL COMPARADA (2025 VS 2026 YTD)",
    line_trend: "CURVAS DE EVOLUCIÓN ANUAL COMPARADA (2025 VS 2026)",
    branch_part: "PARTICIPACIÓN DE SUCURSALES (CONSOLIDADO YTD)",
    compare_tab: "COMPARATIVA TRANSVERSAL ANUAL (2025 VS 2026)",
    monthly_suc: "DISTRIBUCIÓN MENSUAL POR SUCURSAL",
    analysis: "ANÁLISIS OPERATIVO & DIAGNÓSTICO PREDICTIVO IA"
  });

  // Tamaños de gráficos/tablas independientes en el PDF
  const [sectionSizes, setSectionSizes] = useState({
    kpis: "normal", // normal, grande
    charts: "normal", // normal, grande
    tables: "normal", // normal, grande
    analysis: "normal" // normal, grande
  });

  // Escala global del documento (Zoom)
  const [printScale, setPrintScale] = useState("100"); // 100, 115, 130

  // Nuevas propiedades interactivas del PDF
  const [pdfTitleAlign, setPdfTitleAlign] = useState<"left" | "center" | "right">("left");
  const [pdfTitleStyle, setPdfTitleStyle] = useState<"sans" | "serif" | "mono">("sans");
  const [pdfPadding, setPdfPadding] = useState<"compact" | "normal" | "spacious">("normal");
  const [pdfAccentColor, setPdfAccentColor] = useState<"amber" | "blue" | "indigo" | "emerald" | "rose">("amber");
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Estado para la ventana flotante (Modal) del Diseñador Visual de PDF
  const [isPdfDesignerOpen, setIsPdfDesignerOpen] = useState(false);

  // Secciones del PDF con dimensiones de formas (ancho, escala/altura, salto de página, visibilidad y orden)
  const [pdfSections, setPdfSections] = useState([
    { id: "kpis", name: "Fila de KPIs Consolidada", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false },
    { id: "kpi_ytd", name: "KPI: Asistencias Acumuladas YTD", visible: false, width: "25%", scale: 1.0, isPageBreakBefore: false },
    { id: "kpi_leader", name: "KPI: Canal o Medio Líder YTD", visible: false, width: "25%", scale: 1.0, isPageBreakBefore: false },
    { id: "kpi_change", name: "KPI: Variación versus Mes Anterior", visible: false, width: "25%", scale: 1.0, isPageBreakBefore: false },
    { id: "kpi_yoy", name: "KPI: Variación Acumulado YoY", visible: false, width: "25%", scale: 1.0, isPageBreakBefore: false },
    { id: "bar_trend", name: "Gráfico de Barras Mensuales (2025 vs 2026)", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false },
    { id: "line_trend", name: "Curvas de Evolución Anual Comparada (2025 vs 2026)", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false },
    { id: "branch_part", name: "Gráfico de Participación por Sucursales YTD", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false },
    { id: "compare_tab", name: "Tabla de Comparativa Transversal Anual", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false },
    { id: "monthly_suc", name: "Tabla de Distribución Mensual por Sucursal", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false },
    { id: "analysis", name: "Texto de Análisis IA & Diagnóstico", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false }
  ]);

  const [isEditingAnalysis, setIsEditingAnalysis] = useState(false);

  // Mover elemento arriba o abajo
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pdfSections.length - 1) return;

    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...pdfSections];
    const [removed] = updated.splice(index, 1);
    updated.splice(nextIndex, 0, removed);
    setPdfSections(updated);
  };

  // Activar/Ocultar elemento de la maqueta
  const handleToggleSectionVisible = (index: number) => {
    const updated = [...pdfSections];
    const targetId = updated[index].id;
    const currentVisible = !updated[index].visible;
    updated[index].visible = currentVisible;

    if (targetId === "kpis" && currentVisible) {
      // Si activo consolidado, oculto los individuales
      updated.forEach(sec => {
        if (["kpi_ytd", "kpi_leader", "kpi_change", "kpi_yoy"].includes(sec.id)) {
          sec.visible = false;
        }
      });
    } else if (["kpi_ytd", "kpi_leader", "kpi_change", "kpi_yoy"].includes(targetId) && currentVisible) {
      // Si activo cualquiera individual, oculto el consolidado
      updated.forEach(sec => {
        if (sec.id === "kpis") {
          sec.visible = false;
        }
      });
    }
    setPdfSections(updated);
  };

  // Alternar ancho de la forma (100% vs 50%)
  const handleToggleSectionWidth = (index: number) => {
    const updated = [...pdfSections];
    updated[index].width = updated[index].width === "100%" ? "50%" : "100%";
    setPdfSections(updated);
  };

  // Cambiar escala de la sección (+10% / -10%) para encoger o ampliar
  const handleSectionScaleChange = (index: number, action: 'amplify' | 'shrink') => {
    const updated = [...pdfSections];
    let currentScale = updated[index].scale ?? 1.0;
    if (action === "amplify") {
      currentScale = Math.min(1.5, currentScale + 0.1);
    } else {
      currentScale = Math.max(0.6, currentScale - 0.1);
    }
    updated[index].scale = parseFloat(currentScale.toFixed(1));
    setPdfSections(updated);
  };

  // Alternar salto de página antes de esta sección
  const handleTogglePageBreak = (index: number) => {
    const updated = [...pdfSections];
    updated[index].isPageBreakBefore = !updated[index].isPageBreakBefore;
    setPdfSections(updated);
  };

  // Alternar ancho de sección cíclicamente: 100% -> 66% -> 50% -> 33% -> 100%
  const handleCycleSectionWidth = (index: number) => {
    const updated = [...pdfSections];
    const curr = updated[index].width || "100%";
    let next = "100%";
    if (curr === "100%") next = "66%";
    else if (curr === "66%") next = "50%";
    else if (curr === "50%") next = "33%";
    else if (curr === "33%") next = "100%";
    updated[index].width = next;
    setPdfSections(updated);
  };

  // Alternar tonalidad de fondo: blanco -> ámbar sutil -> gris ejecutivo -> esmeralda suave
  const handleCycleSectionBgTint = (index: number) => {
    const updated = [...pdfSections];
    const curr = (updated[index] as any).bgTint || "white";
    let next = "white";
    if (curr === "white") next = "amber";
    else if (curr === "amber") next = "slate";
    else if (curr === "slate") next = "emerald";
    else if (curr === "emerald") next = "white";
    (updated[index] as any).bgTint = next;
    setPdfSections(updated);
  };

  // Alternar tipografía: sans-serif -> serif elegante -> monospace técnico
  const handleCycleSectionFontFamily = (index: number) => {
    const updated = [...pdfSections];
    const curr = (updated[index] as any).fontFamily || "sans";
    let next = "sans";
    if (curr === "sans") next = "serif";
    else if (curr === "serif") next = "mono";
    else if (curr === "mono") next = "sans";
    (updated[index] as any).fontFamily = next;
    setPdfSections(updated);
  };

  // Alternar marco/borde: simple -> punteado -> acento ámbar izq -> acento índigo izq
  const handleCycleSectionBorderStyle = (index: number) => {
    const updated = [...pdfSections];
    const curr = (updated[index] as any).borderStyle || "solid";
    let next = "solid";
    if (curr === "solid") next = "dashed";
    else if (curr === "dashed") next = "accent-left";
    else if (curr === "accent-left") next = "accent-indigo";
    else if (curr === "accent-indigo") next = "solid";
    (updated[index] as any).borderStyle = next;
    setPdfSections(updated);
  };

  const handleTitleChange = (sectionId: string, value: string) => {
    setSectionTitles(prev => ({
      ...prev,
      [sectionId]: value
    }));
  };

  // Cargar datos de LocalStorage
  useEffect(() => {
    const savedMonthly = localStorage.getItem("executive_report_monthly_v1");
    const savedSucursal = localStorage.getItem("executive_report_sucursales_v1");
    if (savedMonthly) {
      try {
        setMonthlyData(JSON.parse(savedMonthly));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedSucursal) {
      try {
        setSucursalMonths(JSON.parse(savedSucursal));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Filtrar los tickets reales en el año y mes activo
  const getActiveMonthInvoices = () => {
    return invoices.filter(inv => {
      if (!inv.date) return false;
      const dateObj = new Date(inv.date);
      const year = dateObj.getUTCFullYear();
      const month = dateObj.getUTCMonth(); // 0-11
      return year === activeYear && month === activeMonthIndex;
    });
  };

  const activeInvoices = getActiveMonthInvoices();

  // Contar cuántos tickets de asistencia activa tenemos de este mes real por sucursal
  const getRealCountForSucursal = (sucName: string) => {
    return activeInvoices.filter(inv => {
      const invBranch = (inv.sucursal || "").toUpperCase();
      const targetBranch = sucName.toUpperCase();
      
      const isAsisComments = inv.comments?.toLowerCase().includes("asistencia vial bat");
      const isAsisItems = inv.items?.some(item => 
        item.name?.toLowerCase().includes("asistencia vial bat")
      );

      const matchesBranch = invBranch.includes(targetBranch) || targetBranch.includes(invBranch);
      return matchesBranch && (isAsisComments || isAsisItems);
    }).length;
  };

  // Contar cuántos de asistencia activa en el mes seleccionado
  const totalActiveMonthRealCount = activeInvoices.filter(inv => {
    const isAsisComments = inv.comments?.toLowerCase().includes("asistencia vial bat");
    const isAsisItems = inv.items?.some(item => 
      item.name?.toLowerCase().includes("asistencia vial bat")
    );
    return isAsisComments || isAsisItems;
  }).length;

  // Get real count for any month index (0 to 11) in a specific year
  const getRealCountForMonth = (monthIdx: number, targetYear: number = activeYear) => {
    return invoices.filter(inv => {
      if (!inv.date) return false;
      const dateObj = new Date(inv.date);
      const year = dateObj.getUTCFullYear();
      const month = dateObj.getUTCMonth(); // 0-11
      if (year !== targetYear || month !== monthIdx) return false;
      
      const isAsisComments = inv.comments?.toLowerCase().includes("asistencia vial bat");
      const isAsisItems = inv.items?.some(item => 
        item.name?.toLowerCase().includes("asistencia vial bat")
      );
      return isAsisComments || isAsisItems;
    }).length;
  };

  // Get real count for a specific sucursal, month index, and dynamic year
  const getRealCountForSucursalAndMonth = (sucName: string, monthIdx: number, targetYear: number = activeYear) => {
    return invoices.filter(inv => {
      if (!inv.date) return false;
      const dateObj = new Date(inv.date);
      const year = dateObj.getUTCFullYear();
      const month = dateObj.getUTCMonth(); // 0-11
      if (year !== targetYear || month !== monthIdx) return false;

      const invBranch = (inv.sucursal || "").toUpperCase();
      const targetBranch = sucName.toUpperCase();
      
      const isAsisComments = inv.comments?.toLowerCase().includes("asistencia vial bat");
      const isAsisItems = inv.items?.some(item => 
        item.name?.toLowerCase().includes("asistencia vial bat")
      );

      const matchesBranch = invBranch.includes(targetBranch) || targetBranch.includes(invBranch);
      return matchesBranch && (isAsisComments || isAsisItems);
    }).length;
  };

  // Actualizar dinámicamente consolidando datos históricos para todos los meses
  const getActiveMonthlyList = () => {
    const baseList = isEditing ? editedMonthly : monthlyData;
    return baseList.map((item, idx) => {
      const realCount2026 = getRealCountForMonth(idx, activeYear);
      const realCount2025 = getRealCountForMonth(idx, activeYear - 1);
      
      // Solo sobreescribir con valores reales de base de datos si NO estamos editando activamente
      if (!isEditing) {
        return {
          ...item,
          val2025: realCount2025 > 0 ? realCount2025 : item.val2025,
          val2026: realCount2026 > 0 ? realCount2026 : item.val2026
        };
      }
      return item;
    });
  };

  const resolvedMonthlyList = getActiveMonthlyList();

  const activeMonthAbr = MESES_ABR[activeMonthIndex];

  const getActiveSucursalMonths = () => {
    const baseList = isEditing ? editedSucursales : sucursalMonths;
    return baseList.map(sucItem => {
      const updatedMonths = { ...sucItem.meses };
      MESES_ABR.forEach((m, idx) => {
        const realCount = getRealCountForSucursalAndMonth(sucItem.sucursal, idx, activeYear);
        // Solo sobreescribir con valores reales de base de datos si NO estamos editando activamente
        if (!isEditing) {
          updatedMonths[m] = realCount > 0 ? realCount : (sucItem.meses[m] || 0);
        }
      });

      return {
        ...sucItem,
        meses: updatedMonths
      };
    });
  };

  const resolvedSucursalListData = getActiveSucursalMonths();

  // ---- CÁLCULO DE MEDIOS CONSOLIDADO ----
  const getRealMediaDataForActiveMonth = () => {
    const res: MiniTableMediaData = {
      "EL DORADO": { flota: 0, omitidos: 0, callCenter: 0, sucursal: 0 },
      "VIA TOCUMEN": { flota: 0, omitidos: 0, callCenter: 0, sucursal: 0 },
      "VIA PORRAS": { flota: 0, omitidos: 0, callCenter: 0, sucursal: 0 },
      "COSTA VERDE": { flota: 0, omitidos: 0, callCenter: 0, sucursal: 0 },
      "DAVID": { flota: 0, omitidos: 0, callCenter: 0, sucursal: 0 },
      "CHITRE": { flota: 0, omitidos: 0, callCenter: 0, sucursal: 0 },
    };

    activeInvoices.forEach(inv => {
      const isAsisComments = inv.comments?.toLowerCase().includes("asistencia vial bat");
      const isAsisItems = inv.items?.some(item => 
        item.name?.toLowerCase().includes("asistencia vial bat")
      );
      if (!(isAsisComments || isAsisItems)) return;

      const invSuc = (inv.sucursal || "").toUpperCase();
      let matchedBranch = SUCURSALES_LIST.find(b => invSuc.includes(b) || b.includes(invSuc));
      
      if (!matchedBranch) {
        matchedBranch = "EL DORADO";
      }

      const rawType = (inv.invoiceType || "").toUpperCase();
      
      let typeKey: "flota" | "omitidos" | "callCenter" | "sucursal" = "omitidos";
      if (rawType.includes("FLOTA")) {
        typeKey = "flota";
      } else if (rawType.includes("CALL") || rawType.includes("CENTER")) {
        typeKey = "callCenter";
      } else if (rawType.includes("SUCURSAL")) {
        typeKey = "sucursal";
      } else if (rawType.includes("OMITIDO") || rawType === "") {
        typeKey = "omitidos";
      }

      if (res[matchedBranch]) {
        res[matchedBranch][typeKey] += 1;
      }
    });

    return res;
  };

  const realMediaActiveMonth = getRealMediaDataForActiveMonth();

  // Distribuye los valores totales reales o ingresados en la tabla sucursal en sus medios correspondientes
  const getDistributedMediaForSucursal = (sucName: string) => {
    const targetTotal = resolvedSucursalListData.find(s => s.sucursal === sucName)?.meses[activeMonthAbr] || 0;

    let wFlota = 0;
    let wOmitidos = 0;
    let wCall = 0;
    let wSuc = 0;

    const realSumFlota = realMediaActiveMonth[sucName]?.flota || 0;
    const realSumOmitidos = realMediaActiveMonth[sucName]?.omitidos || 0;
    const realSumCall = realMediaActiveMonth[sucName]?.callCenter || 0;
    const realSumSuc = realMediaActiveMonth[sucName]?.sucursal || 0;
    const realSumTotal = realSumFlota + realSumOmitidos + realSumCall + realSumSuc;

    if (realSumTotal > 0) {
      wFlota = realSumFlota;
      wOmitidos = realSumOmitidos;
      wCall = realSumCall;
      wSuc = realSumSuc;
    } else {
      // Proporciones sugeridas por defecto si no hay tiquetes reales en base de datos
      if (sucName === "EL DORADO") {
        wOmitidos = 19; wCall = 5;
      } else if (sucName === "VIA TOCUMEN") {
        wOmitidos = 15; wCall = 6;
      } else if (sucName === "VIA PORRAS") {
        wOmitidos = 8; wCall = 6;
      } else if (sucName === "COSTA VERDE") {
        wOmitidos = 4; wCall = 3;
      } else if (sucName === "DAVID") {
        wOmitidos = 3; wCall = 4;
      } else if (sucName === "CHITRE") {
        wOmitidos = 7; wCall = 3;
      } else {
        wOmitidos = 5; wCall = 5;
      }
    }

    const totalWeight = wFlota + wOmitidos + wCall + wSuc;
    if (totalWeight === 0 || targetTotal === 0) {
      return { flota: 0, omitidos: 0, callCenter: 0, sucursal: 0 };
    }

    let fVal = Math.round((wFlota / totalWeight) * targetTotal);
    let oVal = Math.round((wOmitidos / totalWeight) * targetTotal);
    let cVal = Math.round((wCall / totalWeight) * targetTotal);
    let sVal = Math.round((wSuc / totalWeight) * targetTotal);

    let currentSum = fVal + oVal + cVal + sVal;
    let iterations = 0;
    while (currentSum !== targetTotal && iterations < 10) {
      const diff = targetTotal - currentSum;
      const step = diff > 0 ? 1 : -1;
      
      if (wOmitidos >= wCall && wOmitidos >= wFlota && wOmitidos >= wSuc && oVal + step >= 0) {
        oVal += step;
      } else if (wCall >= wFlota && wCall >= wSuc && cVal + step >= 0) {
        cVal += step;
      } else if (wFlota >= wSuc && fVal + step >= 0) {
        fVal += step;
      } else if (sVal + step >= 0) {
        sVal += step;
      } else {
        oVal += step;
      }
      currentSum = fVal + oVal + cVal + sVal;
      iterations++;
    }

    return { flota: fVal, omitidos: oVal, callCenter: cVal, sucursal: sVal };
  };

  const getMediaForSucursal = (sucName: string, tipo: "flota" | "omitidos" | "callCenter" | "sucursal") => {
    const distData = getDistributedMediaForSucursal(sucName);
    return distData[tipo];
  };

  const mediaConsolidadoValues = {
    flota: SUCURSALES_LIST.reduce((sum, suc) => sum + getMediaForSucursal(suc, "flota"), 0),
    omitidos: SUCURSALES_LIST.reduce((sum, suc) => sum + getMediaForSucursal(suc, "omitidos"), 0),
    callCenter: SUCURSALES_LIST.reduce((sum, suc) => sum + getMediaForSucursal(suc, "callCenter"), 0),
    sucursal: SUCURSALES_LIST.reduce((sum, suc) => sum + getMediaForSucursal(suc, "sucursal"), 0),
  };

  const mediaConsolidadoTotal = mediaConsolidadoValues.flota + mediaConsolidadoValues.omitidos + mediaConsolidadoValues.callCenter + mediaConsolidadoValues.sucursal;

  // METRICAS KPI
  const total2025YTD = resolvedMonthlyList
    .slice(0, activeMonthIndex + 1)
    .reduce((sum, item) => sum + item.val2025, 0);

  const total2026YTD = resolvedMonthlyList
    .slice(0, activeMonthIndex + 1)
    .reduce((sum, item) => sum + item.val2026, 0);

  let topMediaName = "CALL CENTER";
  let topMediaCount = mediaConsolidadoValues.callCenter;
  
  if (mediaConsolidadoValues.flota > topMediaCount) {
    topMediaName = "FLOTA";
    topMediaCount = mediaConsolidadoValues.flota;
  }
  if (mediaConsolidadoValues.omitidos > topMediaCount) {
    topMediaName = "OMITIDOS";
    topMediaCount = mediaConsolidadoValues.omitidos;
  }
  if (mediaConsolidadoValues.sucursal > topMediaCount) {
    topMediaName = "SUCURSAL";
    topMediaCount = mediaConsolidadoValues.sucursal;
  }

  const topMediaPercentage = mediaConsolidadoTotal > 0 
    ? (topMediaCount / mediaConsolidadoTotal) * 100 
    : 0;

  const valActiveMonth = resolvedMonthlyList[activeMonthIndex]?.val2026 || 0;
  const valPrevMonth = activeMonthIndex > 0 ? (resolvedMonthlyList[activeMonthIndex - 1]?.val2026 || 0) : 0;
  
  const diffVsPrevMonthPct = valPrevMonth > 0 
    ? ((valActiveMonth - valPrevMonth) / valPrevMonth) * 100 
    : 0;
  
  const valPrevMonth2026PctStr = activeMonthIndex > 0 
    ? (((resolvedMonthlyList[activeMonthIndex - 1]?.val2026 || 0) / (resolvedMonthlyList[activeMonthIndex - 1]?.val2025 || 1)) * 100).toFixed(1)
    : "0.0";

  const variationVsPriorYearPct = total2025YTD > 0 
    ? ((total2026YTD - total2025YTD) / total2025YTD) * 100 
    : 0;

  // CONTROLES DE EDICIÓN HISTÓRICA
  const startEditMode = () => {
    setEditedMonthly(JSON.parse(JSON.stringify(monthlyData)));
    setEditedSucursales(JSON.parse(JSON.stringify(sucursalMonths)));
    setIsEditing(true);
    setIsSuperAdminActive(false);
  };

  const saveEditedValues = () => {
    setMonthlyData(editedMonthly);
    setSucursalMonths(editedSucursales);
    localStorage.setItem("executive_report_monthly_v1", JSON.stringify(editedMonthly));
    localStorage.setItem("executive_report_sucursales_v1", JSON.stringify(editedSucursales));
    setIsEditing(false);
    setIsSuperAdminActive(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setIsSuperAdminActive(false);
  };

  const handleVerifyPIN = () => {
    if (superAdminPIN === "233291") {
      setIsSuperAdminActive(true);
      setShowSuperAdminModal(false);
      setSuperAdminPIN("");
      setSuperAdminError("");
    } else {
      setSuperAdminError("Clave de Programador incorrecta");
    }
  };

  const handleMonthlyChange = (idx: number, field: "val2025" | "val2026", value: string) => {
    const updated = [...editedMonthly];
    updated[idx] = {
      ...updated[idx],
      [field]: Number(value) || 0
    };
    setEditedMonthly(updated);
  };

  const handleSucursalChange = (sucIdx: number, mesKey: string, value: string) => {
    const updated = [...editedSucursales];
    updated[sucIdx] = {
      ...updated[sucIdx],
      meses: {
        ...updated[sucIdx].meses,
        [mesKey]: Number(value) || 0
      }
    };
    setEditedSucursales(updated);
  };

  const resetToImageDefaults = () => {
    if (confirm("¿Estás seguro de que deseas restablecer todos los valores manuales para que coincidan con la captura de pantalla de ejemplo?")) {
      setMonthlyData(DEFAULT_MONTHS_2025_2026);
      setSucursalMonths(INITIAL_SUCURSAL_MONTHS_2026);
      localStorage.removeItem("executive_report_monthly_v1");
      localStorage.removeItem("executive_report_sucursales_v1");
      setIsEditing(false);
    }
  };

  // Estados para reporte ejecutivo con análisis IA
  const [analysisContent, setAnalysisContent] = useState<string>("");
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [hasBeenAnalyzed, setHasBeenAnalyzed] = useState<boolean>(false);

  // Generador de análisis dinámico local en caso de que Gemini esté offline o sin API Key
  const generateLocalFallbackAnalysis = () => {
    const monthName = monthlyData[activeMonthIndex]?.mes || "MES SELECCIONADO";
    const currentVal = resolvedMonthlyList[activeMonthIndex]?.val2026 ?? 0;
    const priorVal = resolvedMonthlyList[activeMonthIndex]?.val2025 ?? 0;
    const diff = currentVal - priorVal;
    const pct = priorVal > 0 ? ((diff / priorVal) * 100).toFixed(1) : "0.0";
    
    // Encontrar sucursal líder en el mes activo
    let topSucName = "EL DORADO";
    let maxCount = -1;
    resolvedSucursalListData.forEach(suc => {
      const cnt = suc.meses[activeMonthAbr] || 0;
      if (cnt > maxCount) {
        maxCount = cnt;
        topSucName = suc.sucursal;
      }
    });

    const total2026YTD = resolvedMonthlyList.reduce((sum, item, idx) => idx <= activeMonthIndex ? sum + item.val2026 : sum, 0);
    const total2025YTD = resolvedMonthlyList.reduce((sum, item, idx) => idx <= activeMonthIndex ? sum + item.val2025 : sum, 0);
    const ytdDiff = total2026YTD - total2025YTD;
    const ytdPct = total2025YTD > 0 ? ((ytdDiff / total2025YTD) * 100).toFixed(1) : "0.0";

    return `### REPORTANÁLISIS OPERATIVO EJECUTIVO · ${monthName} ${activeYear}

1. **RESUMEN OPERATIVO EJECUTIVO**
Durante el mes de **${monthName} ${activeYear}**, se registraron un total de **${currentVal} asistencias viales reales**. En términos acumulados, el valor acumulado del año actual (YTD) alcanza las **${total2026YTD} asistencias** comparado con **${total2025YTD} asistencias** en el año anterior, representando un comportamiento interanual de **${ytdPct}%** en la demanda general del servicio de auxilio vial.

2. **DIAGNÓSTICO SUCURSAL Y CANALES**
- **Sucursal Líder en Demanda**: La sucursal de **${topSucName}** se destaca como el principal nodo de operación vial, concentrando un total de **${maxCount} servicios** en el período de análisis.
- **Distribución de Canales**: Los servicios de asistencia vial se clasifican por canal de solicitud prioritario (Flotas autorizadas, llamadas a través del Call Center y reclamos gestionados en sucursales). Se observa una eficiencia sostenida en las operaciones del taller central y los motorizados de rescate asignados en las rutas críticas de Panamá.

3. **EVOLUCIÓN INTERANUAL (YoY)**
- Para el mes bajo análisis (**${monthName}**), se registra una variación interanual directa de **${diff >= 0 ? "+" : ""}${diff} asistencias** (${pct}% YoY en comparación con ${priorVal} asistencias registradas en el año fiscal 2025).
- Tras el análisis del patrón transversal comparativo, la tasa acumulada YTD muestra que la toma de decisiones basada en datos de mantenimiento predictivo en vehículos de flota está reduciendo los tiempos muertos y mitigando incidentes graves en la vía pública.

4. **PLAN DE MEJORA Y RECOMENDACIONES OPERATIVAS**
- **Optimización de Flota y Rutas**: Redistribuir motorizados de respuesta rápida en zonas de alto tráfico próximas a **${topSucName}** para reducir el tiempo promedio de atención a menos de 30 minutos.
- **Campañas de Mantenimiento Preventivo (Baterías)**: Implementar promociones de reemplazo de baterías preventivas, disminuyendo de forma directa las solicitudes de auxilio por fallas de encendido.
- **Digitalización de Recepción Técnica**: Capacitar al personal receptor para agilizar la carga de incidencias térmicas y facturas electrónicas desde la aplicación, integrando el API de reportes en tiempo real para un monitoreo YTD continuo.`;
  };

  const generateAnalysis = async () => {
    setIsGeneratingAnalysis(true);
    setAnalysisError(null);
    try {
      const activeMonthName = monthlyData[activeMonthIndex].mes;
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monthlyData: resolvedMonthlyList,
          sucursalData: resolvedSucursalListData,
          activeMonth: activeMonthName,
          activeYear: activeYear,
        }),
      });

      if (!response.ok) {
        throw new Error("Respuesta del servidor no válida.");
      }

      const result = await response.json();
      if (result.analysis) {
        setAnalysisContent(result.analysis);
      } else {
        throw new Error("No se pudo obtener el texto del análisis.");
      }
    } catch (err: any) {
      console.warn("Falla en API de Gemini, utilizando fallback local enriquecido:", err);
      const fallback = generateLocalFallbackAnalysis();
      setAnalysisContent(fallback);
    } finally {
      setIsGeneratingAnalysis(false);
      setHasBeenAnalyzed(true);
    }
  };

  // Función de descarga del reporte en PDF activando el print del navegador
  const handleDownloadPDF = () => {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        window.print();
        return;
      }
      
      const accentHexMap = {
        amber: { primary: "#f59e0b", hover: "#d97706", light: "#fef3c7" },
        blue: { primary: "#3b82f6", hover: "#1d4ed8", light: "#dbeafe" },
        indigo: { primary: "#6366f1", hover: "#4338ca", light: "#e0e7ff" },
        emerald: { primary: "#10b981", hover: "#047857", light: "#d1fae5" },
        rose: { primary: "#f43f5e", hover: "#be123c", light: "#ffe4e6" }
      };
      const accent = accentHexMap[pdfAccentColor] || accentHexMap.amber;

      const tableRows = resolvedMonthlyList.map(item => `
        <tr>
          <td style="font-weight: bold;">${item.mes}</td>
          <td style="text-align: center; font-family: monospace;">${item.val2025}</td>
          <td style="text-align: center; font-family: monospace; color: ${accent.hover}; font-weight: bold;">${item.val2026}</td>
          <td style="text-align: center; font-family: monospace; font-weight: bold;">${item.val2026 - item.val2025}</td>
          <td style="text-align: center; font-family: monospace; font-weight: bold;">${item.val2025 > 0 ? (((item.val2026 - item.val2025)/item.val2025)*100).toFixed(0) + '%' : '0%'}</td>
        </tr>
      `).join("");

      const sucursalRows = resolvedSucursalListData.map(item => {
        const total = MESES_ABR.reduce((sum, m) => sum + (item.meses[m] || 0), 0);
        return `
          <tr>
            <td style="font-weight: bold; text-transform: uppercase;">${item.sucursal}</td>
            ${MESES_ABR.map(m => `<td style="text-align: center; font-family: monospace;">${item.meses[m] || 0}</td>`).join("")}
            <td style="text-align: right; font-family: monospace; font-weight: bold; color: ${accent.hover};">${total}</td>
          </tr>
        `;
      }).join("");

      // Calcular valor máximo de meses para escalar los gráficos correctamente
      const maxValForChartYScale = Math.max(
        ...resolvedMonthlyList.map(item => Math.max(item.val2025, item.val2026)),
        10
      );

      // Generar barras gráficas en HTML/CSS para el reporte de evolución mensual interanual (Gráfico de barras)
      const isGrandeBars = sectionSizes.charts === "grande";
      const barBaseHeight = isGrandeBars ? 180 : 110;
      const barColumnHeight = isGrandeBars ? 240 : 165;

      const monthlyBarsHtml = resolvedMonthlyList.map(item => {
        const h2025 = (item.val2025 / maxValForChartYScale) * barBaseHeight;
        const h2026 = (item.val2026 / maxValForChartYScale) * barBaseHeight;
        
        // Calcular porcentaje de variación
        const diff = item.val2026 - item.val2025;
        const varPct = item.val2025 > 0 ? ((diff / item.val2025) * 100).toFixed(0) : "0";
        const sign = diff > 0 ? "+" : "";
        const indicatorColor = diff > 0 ? "#10b981" : diff < 0 ? "#ef4444" : "#64748b";
        const varText = item.val2025 > 0 && item.val2026 > 0 ? `${sign}${varPct}%` : "";

        return `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; width: calc(100% / 12); min-width: 32px; height: ${barColumnHeight}px;">
            <!-- Variación sobre cada mes -->
            <div style="font-size: 8px; font-weight: 800; color: ${indicatorColor}; font-family: monospace; height: 16px; margin-bottom: 2px;">
              ${varText}
            </div>
            
            <div style="display: flex; align-items: flex-end; gap: 4px; height: ${barBaseHeight}px; border-bottom: 1px solid #cbd5e1; width: 100%; justify-content: center; padding-bottom: 2px;">
              <!-- 2025 bar -->
              <div style="height: ${h2025}px; width: 10px; background-color: #94a3b8; border-radius: 2px 2px 0 0; position: relative;">
                ${item.val2025 > 0 ? `<span style="font-size: 7.5px; font-weight: bold; position: absolute; top: -11px; left: 50%; transform: translateX(-50%); font-family: monospace; color: #475569;">${item.val2025}</span>` : ""}
              </div>
              <!-- 2026 bar -->
              <div style="height: ${h2026}px; width: 10px; background-color: ${accent.primary}; border-radius: 2px 2px 0 0; position: relative;">
                ${item.val2026 > 0 ? `<span style="font-size: 7.5px; font-weight: 950; position: absolute; top: -11px; left: 50%; transform: translateX(-50%); font-family: monospace; color: ${accent.hover};">${item.val2026}</span>` : ""}
              </div>
            </div>
            <!-- Etiqueta de mes -->
            <div style="font-size: 8.5px; font-weight: bold; font-family: sans-serif; color: #475569; margin-top: 6px; text-transform: uppercase;">
              ${item.mes.substring(0, 3)}
            </div>
          </div>
        `;
      }).join("");

      // Generar barras horizontales para el desglose total de servicios por cada sucursal
      const maxSucValue = Math.max(
        ...resolvedSucursalListData.map(item => MESES_ABR.reduce((sum, m) => sum + (item.meses[m] || 0), 0)),
        5
      );

      const sucursalProgressHtml = resolvedSucursalListData.map(item => {
        const total = MESES_ABR.reduce((sum, m) => sum + (item.meses[m] || 0), 0);
        const pct = (total / maxSucValue) * 100;
        
        return `
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">
              <span>${item.sucursal}</span>
              <span style="font-family: monospace; color: ${accent.hover};">${total} servicios YTD</span>
            </div>
            <div style="width: 100%; height: 10px; border-radius: 5px; overflow: hidden; border: 1px solid #cbd5e1; background-color: #f1f5f9;">
              <div style="width: ${pct}%; background: linear-gradient(90deg, ${accent.primary}, ${accent.hover}); height: 100%; border-radius: 5px;"></div>
            </div>
          </div>
        `;
      }).join("");

      // Generar Gráfico de Curvas de Evolución Anual (Vectorial SVG) para el PDF
      const isGrandeCharts = sectionSizes.charts === "grande";
      const svgWidth = 720;
      const svgHeight = isGrandeCharts ? 260 : 190;
      const xStart = 45;
      const xEnd = 685;
      const yStart = 30;
      const yEnd = svgHeight - 35;
      
      const getX = (idx: number) => xStart + (idx * (xEnd - xStart) / 11);
      const getY = (val: number) => yEnd - ((val / maxValForChartYScale) * (yEnd - yStart));

      // Grid lines verticales punteadas en gris (sin líneas horizontales de fondo, solo etiquetas de valor en el eje Y)
      let svgVerticalGridLines = "";
      for (let idx = 0; idx < 12; idx++) {
        const gridX = getX(idx);
        svgVerticalGridLines += `
          <line x1="${gridX}" y1="${yStart}" x2="${gridX}" y2="${yEnd}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3,3" opacity="0.8" />
        `;
      }

      const gridCount = 4;
      let svgGridLabels = "";
      for (let g = 0; g <= gridCount; g++) {
        const gridVal = (maxValForChartYScale / gridCount) * g;
        const gridY = getY(gridVal);
        svgGridLabels += `
          <text x="${xStart - 10}" y="${gridY + 3}" font-size="8.5px" font-family="monospace" font-weight="bold" fill="#64748b" text-anchor="end">${gridVal.toFixed(0)}</text>
        `;
      }

      // Conexiones de nodos
      const points2025 = resolvedMonthlyList.map((item, idx) => ({ x: getX(idx), y: getY(item.val2025), val: item.val2025 }));
      const points2026 = resolvedMonthlyList.map((item, idx) => ({ x: getX(idx), y: getY(item.val2026), val: item.val2026 }));

      // Encontrar el último mes con datos reales para el año actual para no dbuijar caídas hacia cero
      const lastActive2026Idx = [...resolvedMonthlyList].reverse().findIndex(item => item.val2026 > 0);
      const cutoff2026Idx = lastActive2026Idx === -1 ? 0 : resolvedMonthlyList.length - 1 - lastActive2026Idx;

      const pathD2025 = points2025.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
      const pathD2026 = points2026.slice(0, cutoff2026Idx + 1).map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");

      const dots2025 = points2025.map((p) => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="#64748b" stroke="white" stroke-width="1.2" />
        ${p.val > 0 ? `<text x="${p.x}" y="${p.y - 7}" font-size="8px" font-family="monospace" font-weight="bold" fill="#475569" text-anchor="middle">${p.val}</text>` : ""}
      `).join("");

      const dots2026 = points2026.map((p, idx) => {
        const val2025 = points2025[idx]?.val || 0;
        const val2026 = p.val;
        if (idx > cutoff2026Idx || val2026 <= 0) return ""; // Evitar círculos y etiquetas de cambio vacías para meses futuros
        const diffPct = val2025 > 0 ? ((val2026 - val2025) / val2025) * 100 : 0;
        const varText = val2025 > 0 ? `${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(0)}%` : "";
        const varColor = diffPct >= 0 ? '#10b981' : '#ef4444'; // emerald vs red
        return `
          <circle cx="${p.x}" cy="${p.y}" r="4" fill="${accent.primary}" stroke="white" stroke-width="1.2" />
          ${val2026 > 0 ? `<text x="${p.x}" y="${p.y - 12}" font-size="7.5px" font-family="monospace" font-weight="black" fill="${accent.hover}" text-anchor="middle">${val2026}</text>` : ""}
          ${varText ? `<text x="${p.x}" y="${p.y - 4}" font-size="6.5px" font-family="sans-serif" font-weight="black" fill="${varColor}" text-anchor="middle">${varText}</text>` : ""}
        `;
      }).join("");

      const xLabels = resolvedMonthlyList.map((item, idx) => `
        <text x="${getX(idx)}" y="${yEnd + 15}" font-size="8.5px" font-family="sans-serif" font-weight="bold" fill="#475569" text-anchor="middle">${item.mes.substring(0, 3).toUpperCase()}</text>
      `).join("");

      const curvesSvgHtml = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: auto; max-width: 100%; display: block;">
          <!-- Fondo blanco puro -->
          <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="#ffffff" />
          
          <!-- Rejilla trasera vertical -->
          ${svgVerticalGridLines}
          
          <!-- Etiquetas Y -->
          ${svgGridLabels}
          
          <!-- Eje horizontal inferior sutil -->
          <line x1="${xStart}" y1="${yEnd}" x2="${xEnd}" y2="${yEnd}" stroke="#cbd5e1" stroke-width="1.2" />
          
          <!-- Camino 2025 -->
          <path d="${pathD2025}" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          
          <!-- Camino 2026 -->
          <path d="${pathD2026}" fill="none" stroke="${accent.primary}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          
          <!-- Puntos y leyendas rápidas -->
          ${dots2025}
          ${dots2026}
          ${xLabels}
        </svg>
      `;

      // Maquetación de cada bloque dinámico
      const kpisHtml = `
        <div style="margin-bottom: ${sectionSizes.kpis === 'grande' ? '35px' : '22px'};">
          <h2 style="font-size: ${sectionSizes.kpis === 'grande' ? '15px' : '13px'};">${sectionTitles.kpis}</h2>
          <div class="grid-kpi">
            <div class="kpi-card" style="${sectionSizes.kpis === 'grande' ? 'padding: 20px;' : ''}">
              <div class="kpi-val" style="font-size: ${sectionSizes.kpis === 'grande' ? '25px' : '20px'};">${total2026YTD}</div>
              <div class="kpi-lbl">Total Asistencias YTD (2026)</div>
            </div>
            <div class="kpi-card" style="border-left-color: #10b981; ${sectionSizes.kpis === 'grande' ? 'padding: 20px;' : ''}">
              <div class="kpi-val" style="font-size: ${sectionSizes.kpis === 'grande' ? '25px' : '20px'};">${topMediaPercentage.toFixed(1)}%</div>
              <div class="kpi-lbl">Medio Líder (${topMediaName})</div>
            </div>
            <div class="kpi-card" style="border-left-color: #3b82f6; ${sectionSizes.kpis === 'grande' ? 'padding: 20px;' : ''}">
              <div class="kpi-val" style="font-size: ${sectionSizes.kpis === 'grande' ? '25px' : '20px'};">${diffVsPrevMonthPct >= 0 ? "+" : ""}${diffVsPrevMonthPct.toFixed(1)}%</div>
              <div class="kpi-lbl">vs Mes Anterior</div>
            </div>
            <div class="kpi-card" style="border-left-color: #f59e0b; ${sectionSizes.kpis === 'grande' ? 'padding: 20px;' : ''}">
              <div class="kpi-val" style="font-size: ${sectionSizes.kpis === 'grande' ? '25px' : '20px'};">${variationVsPriorYearPct >= 0 ? "+" : ""}${variationVsPriorYearPct.toFixed(1)}%</div>
              <div class="kpi-lbl">vs Histórico YTD</div>
            </div>
          </div>
        </div>
      `;

      const kpiYtdHtml = `
        <div style="margin-bottom: 12px;">
          <h2 style="font-size: 11px; margin-bottom: 5px;">${sectionTitles.kpi_ytd || "Asistencias YTD"}</h2>
          <div class="kpi-card" style="min-height: 55px;">
            <div class="kpi-val" style="font-size: 21px;">${total2026YTD}</div>
            <div class="kpi-lbl">Total Servicios Realizados (YTD)</div>
          </div>
        </div>
      `;

      const kpiLeaderHtml = `
        <div style="margin-bottom: 12px;">
          <h2 style="font-size: 11px; margin-bottom: 5px;">${sectionTitles.kpi_leader || "Canal Líder"}</h2>
          <div class="kpi-card" style="border-left-color: #10b981; min-height: 55px;">
            <div class="kpi-val" style="font-size: 21px;">${topMediaPercentage.toFixed(1)}%</div>
            <div class="kpi-lbl">Medio Líder (${topMediaName})</div>
          </div>
        </div>
      `;

      const kpiChangeHtml = `
        <div style="margin-bottom: 12px;">
          <h2 style="font-size: 11px; margin-bottom: 5px;">${sectionTitles.kpi_change || "Cambio Mensual"}</h2>
          <div class="kpi-card" style="border-left-color: #3b82f6; min-height: 55px;">
            <div class="kpi-val" style="font-size: 21px;">${diffVsPrevMonthPct >= 0 ? "+" : ""}${diffVsPrevMonthPct.toFixed(1)}%</div>
            <div class="kpi-lbl">vs Mes Anterior</div>
          </div>
        </div>
      `;

      const kpiYoyHtml = `
        <div style="margin-bottom: 12px;">
          <h2 style="font-size: 11px; margin-bottom: 5px;">${sectionTitles.kpi_yoy || "Acumulado YoY"}</h2>
          <div class="kpi-card" style="border-left-color: #f59e0b; min-height: 55px;">
            <div class="kpi-val" style="font-size: 21px;">${variationVsPriorYearPct >= 0 ? "+" : ""}${variationVsPriorYearPct.toFixed(1)}%</div>
            <div class="kpi-lbl">vs Histórico YTD</div>
          </div>
        </div>
      `;

      const barTrendHtml = `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 13px;">${sectionTitles.bar_trend}</h2>
          <div class="chart-box" style="padding: 16px; height: auto; min-height: ${sectionSizes.charts === 'grande' ? '280px' : '205px'}; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; gap: 12px; margin-bottom: 12px; font-size: 9px; font-weight: bold;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <div style="width: 10px; height: 10px; background-color: #94a3b8; border-radius: 2px;"></div>
                <span style="color: #475569;">Año 2025 (Histórico)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <div style="width: 10px; height: 10px; background-color: ${accent.primary}; border-radius: 2px;"></div>
                <span style="color: #475569;">Año 2026 (YTD Real)</span>
              </div>
            </div>
            
            <div style="display: flex; align-items: flex-end; justify-content: space-between; border-left: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1; padding-left: 8px; padding-bottom: 5px; height: 100%;">
              ${monthlyBarsHtml}
            </div>
          </div>
        </div>
      `;

      const lineTrendHtml = `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 13px;">${sectionTitles.line_trend}</h2>
          <div class="chart-box" style="padding: 16px 20px; height: auto; background-color: white; box-sizing: border-box;">
            <div style="width: 100%; box-sizing: border-box;">
              ${curvesSvgHtml}
            </div>
          </div>
        </div>
      `;

      const branchPartHtml = `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 13px;">${sectionTitles.branch_part}</h2>
          <div class="chart-box" style="padding: 18px; min-height: 140px;">
            <div style="display: flex; flex-direction: column; justify-content: center;">
              ${sucursalProgressHtml}
            </div>
          </div>
        </div>
      `;

      const compareTabHtml = `
        <div style="margin-bottom: 25px; font-size: ${sectionSizes.tables === 'grande' ? '12.5px' : '11px'};">
          <h2 style="font-size: 13px;">${sectionTitles.compare_tab}</h2>
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th style="text-align: center;">Año 2025 (Histórico)</th>
                <th style="text-align: center;">Año 2026 (Actual)</th>
                <th style="text-align: center;">Diferencia Absoluta</th>
                <th style="text-align: center;">% Cambio YoY</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;

      const monthlySucHtml = `
        <div style="margin-bottom: 25px; font-size: ${sectionSizes.tables === 'grande' ? '12.5px' : '11px'};">
          <h2 style="font-size: 13px;">${sectionTitles.monthly_suc}</h2>
          <table>
            <thead>
              <tr>
                <th>Sucursal</th>
                ${MESES_ABR.map(m => `<th style="text-align: center;">${m}</th>`).join("")}
                <th style="text-align: right;">Total YTD</th>
              </tr>
            </thead>
            <tbody>
              ${sucursalRows}
            </tbody>
          </table>
        </div>
      `;

      const analysisHtml = `
        <div style="margin-bottom: 25px; font-size: ${sectionSizes.analysis === 'grande' ? '13px' : '11.5px'};">
          <h2 style="font-size: 13px;">${sectionTitles.analysis}</h2>
          <div class="analysis-box">
            ${analysisContent ? analysisContent.replace(/\n/g, "<br>") : "Cargando análisis inteligente..."}
          </div>
        </div>
      `;

      // Generar contenido en el orden exacto especificado por el usuario
      const customReportContent = pdfSections
        .filter(sec => sec.visible)
        .map(sec => {
          let sectionContent = "";
          if (sec.id === "kpis") sectionContent = kpisHtml;
          else if (sec.id === "kpi_ytd") sectionContent = kpiYtdHtml;
          else if (sec.id === "kpi_leader") sectionContent = kpiLeaderHtml;
          else if (sec.id === "kpi_change") sectionContent = kpiChangeHtml;
          else if (sec.id === "kpi_yoy") sectionContent = kpiYoyHtml;
          else if (sec.id === "bar_trend") sectionContent = barTrendHtml;
          else if (sec.id === "line_trend") sectionContent = lineTrendHtml;
          else if (sec.id === "branch_part") sectionContent = branchPartHtml;
          else if (sec.id === "compare_tab") sectionContent = compareTabHtml;
          else if (sec.id === "monthly_suc") sectionContent = monthlySucHtml;
          else if (sec.id === "analysis") sectionContent = analysisHtml;

          // Estilos de dimensiones interactivas aplicados a la forma
          const isQuarter = sec.width === "25%";
          const isThird = sec.width === "33%";
          const isHalf = sec.width === "50%";
          const isTwoThirds = sec.width === "66%";
          let widthCss = "width: 100%; display: block; clear: both;";
          if (isHalf) widthCss = "width: 49.5%; display: inline-block; vertical-align: top; box-sizing: border-box;";
          else if (isThird) widthCss = "width: 32.8%; display: inline-block; vertical-align: top; box-sizing: border-box;";
          else if (isTwoThirds) widthCss = "width: 66.2%; display: inline-block; vertical-align: top; box-sizing: border-box;";
          else if (isQuarter) widthCss = "width: 24.2%; display: inline-block; vertical-align: top; box-sizing: border-box;";

          const scaleCss = sec.scale ? `zoom: ${sec.scale};` : "";
          const pageBreakCss = sec.isPageBreakBefore ? "page-break-before: always; padding-top: 10px;" : "";

          return `
            <div style="${widthCss} ${pageBreakCss} box-sizing: border-box; margin-bottom: 25px;">
              <div style="${scaleCss}">
                ${sectionContent}
              </div>
            </div>
          `;
        })
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${pdfTitle}</title>
          <style>
            body { 
              font-family: ${
                pdfTitleStyle === "serif" ? '"Playfair Display", Georgia, serif' :
                pdfTitleStyle === "mono" ? 'Consolas, "Fira Code", monospace' :
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }; 
              padding: ${pdfPadding === "compact" ? "20px" : pdfPadding === "spacious" ? "65px" : "40px"}; 
              color: #1e293b; 
              background: white; 
              line-height: 1.5;
              zoom: ${parseInt(printScale) / 100};
            }
            h1 { 
              font-size: 22px; 
              text-transform: uppercase; 
              border-bottom: 3px solid ${accent.primary}; 
              padding-bottom: 8px; 
              margin-bottom: 4px; 
              color: #0f172a; 
              font-weight: 800;
              text-align: ${pdfTitleAlign === "center" ? "center" : pdfTitleAlign === "right" ? "right" : "left"};
            }
            .subtitle { 
              font-size: 10px; 
              text-transform: uppercase; 
              letter-spacing: 1.5px; 
              color: #64748b; 
              margin-bottom: 30px; 
              font-weight: bold;
              text-align: ${pdfTitleAlign === "center" ? "center" : pdfTitleAlign === "right" ? "right" : "left"};
            }
            .grid-kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
            .kpi-card { 
              border: 1px solid #e2e8f0; 
              padding: 14px; 
              border-radius: 12px; 
              background: #f8fafc; 
              border-left: 4px solid ${accent.primary}; 
            }
            .kpi-val { font-size: 21px; font-weight: 950; font-family: monospace; color: #0f172a; margin-bottom: 4px; }
            .kpi-lbl { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px; }
            h2 { 
              font-size: 12.5px; 
              text-transform: uppercase; 
              border-bottom: 2px solid #cbd5e1; 
              padding-bottom: 5px; 
              margin-top: 25px; 
              margin-bottom: 11px; 
              color: #0f172a; 
              font-weight: 850; 
              letter-spacing: 0.5px; 
            }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
            th, td { 
              border: 1px solid #cbd5e1; 
              padding: ${pdfPadding === "compact" ? "4px 6px" : pdfPadding === "spacious" ? "11px 15px" : "6px 9px"}; 
              text-align: left; 
            }
            th { background: #f1f5f9; font-weight: bold; text-transform: uppercase; font-size: 8.5px; color: #475569; letter-spacing: 0.5px; }
            .analysis-box { background: #fafafa; border: 1px solid #e2e8f0; padding: 18px; border-radius: 12px; font-size: 11.5px; line-height: 1.6; color: #27272a; font-weight: 500; font-family: sans-serif; }
            .chart-box { border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; box-sizing: border-box; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="width: 100%;">
              <h1>${pdfTitle}</h1>
              <div class="subtitle">${pdfSubtitle}</div>
            </div>
            <button class="no-print" onclick="window.print()" style="padding: 10px 18px; background: ${accent.primary}; border: none; font-weight: bold; border-radius: 8px; cursor: pointer; color: ${pdfAccentColor === 'amber' ? 'black' : 'white'}; font-size: 11px; text-transform: uppercase; shrink-0; margin-left: 20px;">Imprimir PDF</button>
          </div>

          ${customReportContent}

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (e) {
      console.error("No se pudo iniciar la ventana de impresión, usando window.print() tradicional:", e);
      window.print();
    }
  };

  // Cargar análisis al cambiar mes o año
  useEffect(() => {
    setHasBeenAnalyzed(false);
    const localAnalysis = generateLocalFallbackAnalysis();
    setAnalysisContent(localAnalysis);

    const enrichWithGemini = async () => {
      try {
        const activeMonthName = monthlyData[activeMonthIndex].mes;
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            monthlyData: resolvedMonthlyList,
            sucursalData: resolvedSucursalListData,
            activeMonth: activeMonthName,
            activeYear: activeYear,
          }),
        });
        if (response.ok) {
          const result = await response.json();
          if (result.analysis) {
            setAnalysisContent(result.analysis);
          }
        }
      } catch (err) {
        console.log("No se pudo enriquecer el reporte en vivo con Gemini (Offline/Sin llave).");
      }
    };

    enrichWithGemini();
  }, [activeMonthIndex, activeYear]);

  // Mapeo para Recharts
  const chartData = resolvedMonthlyList.map(item => {
    const v25 = item.val2025;
    const v26 = item.val2026;
    const diff = v25 > 0 ? ((v26 - v25) / v25) * 105 : 0; // Wait, standard percentage is ((v26 - v25) / v25) * 100
    const diffPct = v25 > 0 ? ((v26 - v25) / v25) * 100 : 0;
    const diffText = (v25 > 0 && v26 > 0) ? `${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(0)}%` : "";
    return {
      name: item.mes.substring(0, 3),
      "Año 2025 (Histórico)": v25,
      "Año 2026 (Actual)": v26,
      variationPercent: diffText,
      diffVal: diffPct
    };
  });

  return (
    <div id="executive-report-module-view" className="space-y-6 animate-fade-in text-zinc-100 pb-12">

      {/* VENTANA MODAL FLOTANTE: VERIFICACIÓN SÚPER ADMINISTRADOR (PIN DE SEGURIDAD) */}
      {showSuperAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in text-slate-200">
          <div className="glass-panel relative w-full max-w-md rounded-2xl border border-red-500/20 bg-zinc-905 flex flex-col shadow-2xl p-6 border border-white/10">
            {/* Cabecera del Modal */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-red-400 tracking-widest">Verificación Súper Admin</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold font-mono">ACCESO EXCLUSIVO DEL PROGRAMADOR</p>
              </div>
            </div>

            {/* Cuerpo del Modal */}
            <div className="space-y-4">
              <p className="text-[11px] text-zinc-300 leading-relaxed font-bold">
                Para completar la matriz con los datos del periodo de arranque 2026, ingrese la clave de programación. Esto desbloqueará Temporalmente la edición de los meses pasados y del mes en curso para evitar falsificaciones.
              </p>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  CLAVE EXCLUSIVA
                </label>
                <input
                  type="password"
                  placeholder="••••••"
                  value={superAdminPIN}
                  onChange={(e) => {
                    setSuperAdminPIN(e.target.value);
                    setSuperAdminError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyPIN();
                    } else if (e.key === "Escape") {
                      setShowSuperAdminModal(false);
                      setSuperAdminPIN("");
                      setSuperAdminError("");
                    }
                  }}
                  className="w-full bg-zinc-950 border border-white/10 focus:border-red-500/60 focus:ring-1 focus:ring-red-500 rounded-xl text-center text-sm font-bold font-mono tracking-widest text-slate-100 py-3 focus:outline-none"
                  autoFocus
                />
                {superAdminError && (
                  <p className="text-[10px] text-red-400 font-bold mt-1.5 flex items-center gap-1 font-mono">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{superAdminError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Pie del Modal */}
            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowSuperAdminModal(false);
                  setSuperAdminPIN("");
                  setSuperAdminError("");
                }}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleVerifyPIN}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition bg-red-600 hover:bg-red-500 text-white border border-red-500 shadow-lg hover:shadow-red-900/20 cursor-pointer"
              >
                Autenticar PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENTANA MODAL FLOTANTE: DISEÑADOR VISUAL AVANZADO DE FORMATO PDF */}
      {isPdfDesignerOpen && !isSharedView && (() => {
        const accentStyle = getAccentColorStyle(pdfAccentColor);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in text-slate-200">
          <div className="glass-panel relative w-full max-w-6xl rounded-3xl border border-white/10 bg-zinc-905 flex flex-col max-h-[92vh] shadow-2xl p-6 md:p-8">
            
            {/* Cabecera de la Ventana */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shadow-md">
                  <Sliders className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-amber-300 tracking-wider">Diseñador Visual del Reporte PDF</h3>
                  <p className="text-[10.5px] text-slate-350 mt-0.5 font-bold">Edite, organice y visualice de manera interactiva la maqueta real de impresión de su PDF en páginas físicas</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsPdfDesignerOpen(false)}
                className="p-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 hover:text-amber-400 border border-white/5 rounded-xl cursor-pointer transition-all duration-250 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cuerpo del Diseñador */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 flex-grow scrollbar-thin scrollbar-thumb-white/15">
              
              {/* Columna Izquierda: Configuración Global (Span 4) */}
              <div className="lg:col-span-4 space-y-5 bg-zinc-950/40 p-4.5 rounded-2xl border border-white/5 h-fit text-slate-250">
                <h4 className="text-[10.5px] font-black uppercase text-amber-400 tracking-widest border-b border-white/5 pb-2">Propiedades Globales</h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Título Principal del PDF</label>
                  <input
                    type="text"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-450 placeholder-slate-500 transition-all"
                    placeholder="Ingrese título..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Subtítulo / Términos de Cabecera</label>
                  <input
                    type="text"
                    value={pdfSubtitle}
                    onChange={(e) => setPdfSubtitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-450 placeholder-slate-500 transition-all"
                    placeholder="Ingrese subtítulo..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Escala Global de Impresión</label>
                  <select
                    value={printScale}
                    onChange={(e) => setPrintScale(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 px-3 py-2 rounded-xl text-xs font-black text-amber-400 cursor-pointer focus:outline-none focus:border-amber-450 [color-scheme:dark]"
                  >
                    <option value="90">Compacto (90%)</option>
                    <option value="100">Normal (100%)</option>
                    <option value="115">Ampliando Elementos (115%)</option>
                    <option value="130">Zoom Alto (130%)</option>
                  </select>
                </div>

                {/* Visual Customization controls */}
                <div className="space-y-4 pt-3 border-t border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Alineación Cabecera</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          type="button; button"
                          onClick={() => setPdfTitleAlign(align)}
                          className={`flex items-center justify-center gap-1 py-1.5 border rounded-xl text-[10px] uppercase font-black transition cursor-pointer ${
                            pdfTitleAlign === align
                              ? "bg-amber-500/10 border-amber-450 text-amber-400"
                              : "bg-zinc-900 border-white/5 text-slate-400 hover:bg-zinc-800"
                          }`}
                        >
                          {align === "left" && <AlignLeft className="h-3 w-3" />}
                          {align === "center" && <AlignCenter className="h-3 w-3" />}
                          {align === "right" && <AlignRight className="h-3 w-3" />}
                          {align === "left" ? "Izquierda" : align === "center" ? "Centro" : "Derecha"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Tipografía de Cabecera</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["sans", "serif", "mono"] as const).map((sty) => (
                        <button
                          key={sty}
                          type="button"
                          onClick={() => setPdfTitleStyle(sty)}
                          className={`py-1.5 border rounded-xl text-[10px] uppercase font-black transition cursor-pointer ${
                            pdfTitleStyle === sty
                              ? "bg-amber-500/10 border-amber-450 text-amber-400"
                              : "bg-zinc-900 border-white/5 text-slate-400 hover:bg-zinc-800"
                          }`}
                        >
                          {sty === "sans" ? "Sans (Inter)" : sty === "serif" ? "Serif" : "Mono"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Márgenes de Papel</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["compact", "normal", "spacious"] as const).map((pad) => (
                        <button
                          key={pad}
                          type="button"
                          onClick={() => setPdfPadding(pad)}
                          className={`py-1.5 border rounded-xl text-[10px] uppercase font-black transition cursor-pointer ${
                            pdfPadding === pad
                              ? "bg-amber-500/10 border-amber-450 text-amber-400"
                              : "bg-zinc-900 border-white/5 text-slate-400 hover:bg-zinc-800"
                          }`}
                        >
                          {pad === "compact" ? "Estrecho" : pad === "normal" ? "Medio" : "Ancho"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Tono de Acentuación PDF</label>
                    <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 p-2 rounded-xl">
                      {(["amber", "blue", "indigo", "emerald", "rose"] as const).map((color) => {
                        const bgDots = {
                          amber: "bg-amber-500 border-amber-300",
                          blue: "bg-blue-500 border-blue-300",
                          indigo: "bg-indigo-500 border-indigo-300",
                          emerald: "bg-emerald-500 border-emerald-300",
                          rose: "bg-rose-500 border-rose-300",
                        };
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setPdfAccentColor(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 transform hover:scale-115 cursor-pointer ${bgDots[color]} ${
                              pdfAccentColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110" : "opacity-60"
                            }`}
                            title={`Acentuar en color ${color.toUpperCase()}`}
                          />
                        );
                      })}
                      <span className="text-[9px] font-mono font-black uppercase text-amber-400 tracking-wider ml-auto">
                        {pdfAccentColor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gestor y Organizador de Secciones en la Barra Lateral */}
                <div className="space-y-2 pt-4 bg-zinc-900/40 p-3.5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      Estructura y Secuencia de Bloques
                    </label>
                    <span className="text-[8px] bg-amber-500/10 text-amber-300 font-mono font-black uppercase px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                      INTERACTIVO
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-950/60 rounded-xl border border-white/5 space-y-2 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-teal-400 flex items-center gap-1">
                        <Grid className="h-3 w-3 text-teal-400" />
                        DISTRIBUCIÓN DE KPIS YTD
                      </span>
                      <span className="text-[7.5px] bg-teal-500/10 text-teal-300 font-mono font-bold uppercase px-1 py-0.5 rounded border border-teal-500/20">
                        SIN DUPLICIDAD
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold leading-normal">
                      Defina con 1 clic cómo quiere presentar sus indicadores principales en la hoja:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...pdfSections];
                          updated.forEach(sec => {
                            if (sec.id === "kpis") sec.visible = true;
                            if (["kpi_ytd", "kpi_leader", "kpi_change", "kpi_yoy"].includes(sec.id)) sec.visible = false;
                          });
                          setPdfSections(updated);
                        }}
                        className={`py-1 rounded-lg text-[9px] uppercase font-bold transition duration-200 flex items-center justify-center gap-1 border cursor-pointer ${
                          pdfSections.find(s => s.id === "kpis")?.visible
                            ? "bg-amber-500/15 border-amber-450/40 text-amber-300 font-black shadow-lg shadow-amber-900/10"
                            : "bg-zinc-900/80 border-white/5 text-slate-450 hover:bg-zinc-800"
                        }`}
                      >
                        <LayoutDashboard className="h-3 w-3" />
                        Fila Unificada
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...pdfSections];
                          updated.forEach(sec => {
                            if (sec.id === "kpis") sec.visible = false;
                            if (["kpi_ytd", "kpi_leader", "kpi_change", "kpi_yoy"].includes(sec.id)) sec.visible = true;
                          });
                          setPdfSections(updated);
                        }}
                        className={`py-1 rounded-lg text-[9px] uppercase font-bold transition duration-200 flex items-center justify-center gap-1 border cursor-pointer ${
                          !pdfSections.find(s => s.id === "kpis")?.visible && pdfSections.some(s => ["kpi_ytd", "kpi_leader", "kpi_change", "kpi_yoy"].includes(s.id) && s.visible)
                            ? "bg-emerald-500/15 border-emerald-450/40 text-emerald-300 font-black shadow-lg shadow-emerald-900/10"
                            : "bg-zinc-900/80 border-white/5 text-slate-450 hover:bg-zinc-800"
                        }`}
                      >
                        <Grid className="h-3 w-3" />
                        Desglosados
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[290px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/10 text-[10px]">
                    {pdfSections.map((sec, idx) => {
                      const isSecVisible = sec.visible;
                      // Seleccionar ícono según id
                      let IconComponent = LayoutDashboard;
                      let iconColor = "text-amber-400";
                      
                      if (sec.id === "kpis") { IconComponent = LayoutDashboard; iconColor = "text-amber-400"; }
                      else if (sec.id === "kpi_ytd") { IconComponent = Star; iconColor = "text-amber-300"; }
                      else if (sec.id === "kpi_leader") { IconComponent = Award; iconColor = "text-emerald-400"; }
                      else if (sec.id === "kpi_change") { IconComponent = Percent; iconColor = "text-indigo-400"; }
                      else if (sec.id === "kpi_yoy") { IconComponent = Activity; iconColor = "text-rose-450"; }
                      else if (sec.id === "bar_trend") { IconComponent = BarChart3; iconColor = "text-amber-500"; }
                      else if (sec.id === "line_trend") { IconComponent = TrendingUp; iconColor = "text-sky-400"; }
                      else if (sec.id === "branch_part") { IconComponent = PieChart; iconColor = "text-emerald-500"; }
                      else if (sec.id === "compare_tab") { IconComponent = Table2; iconColor = "text-teal-400"; }
                      else if (sec.id === "monthly_suc") { IconComponent = Grid; iconColor = "text-blue-400"; }
                      else if (sec.id === "analysis") { IconComponent = Sparkles; iconColor = "text-violet-400"; }

                      return (
                        <div 
                          key={sec.id}
                          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                            isSecVisible 
                              ? "bg-zinc-900 border-white/10 text-white shadow-sm hover:border-amber-500/40" 
                              : "bg-zinc-950/20 border-white/5 text-slate-550 opacity-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-[50%] max-w-[55%]">
                            <span className="font-mono text-[8.5px] text-slate-500 font-extrabold shrink-0">#{idx + 1}</span>
                            <IconComponent className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />
                            <span className="font-bold text-[9.5px] truncate" title={sec.name}>{sec.name}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Subir */}
                            <button
                              type="button"
                              onClick={() => handleMoveSection(idx, "up")}
                              disabled={idx === 0}
                              className={`p-1 rounded bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed`}
                              title="Subir Sección"
                            >
                              <ChevronUp className="h-3 w-3 text-slate-300" />
                            </button>
                            
                            {/* Bajar */}
                            <button
                              type="button"
                              onClick={() => handleMoveSection(idx, "down")}
                              disabled={idx === pdfSections.length - 1}
                              className={`p-1 rounded bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed`}
                              title="Bajar Sección"
                            >
                              <ChevronDown className="h-3 w-3 text-slate-300" />
                            </button>

                            {/* Mostrar/Ocultar */}
                            <button
                              type="button"
                              onClick={() => handleToggleSectionVisible(idx)}
                              className={`p-1 rounded transition cursor-pointer border ${
                                isSecVisible
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-zinc-850 border-white/5 text-slate-400 hover:bg-zinc-800"
                              }`}
                              title={isSecVisible ? "Ocultar bloque" : "Activar bloque"}
                            >
                              {isSecVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            </button>

                            {/* Ancho */}
                            <button
                              type="button"
                              onClick={() => handleCycleSectionWidth(idx)}
                              disabled={!isSecVisible}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-black font-mono border transition shrink-0 ${
                                !isSecVisible
                                  ? "bg-zinc-800 border-white/5 text-slate-600 cursor-not-allowed opacity-30"
                                  : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                              }`}
                              title="Cambiar ancho (100% ➔ 66% ➔ 50% ➔ 33%)"
                            >
                              {sec.width || "100%"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/10 text-slate-300 space-y-1.5 text-[10px] leading-relaxed font-sans">
                  <div className="font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Info className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    Edición Interactiva WYSIWYG
                  </div>
                  <p>
                    El panel derecho simula la **hoja física real de impresión de su PDF**.
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 mt-1 text-slate-400 font-medium">
                    <li>**Edite Títulos Directamente**: Haga clic en los textos y escriba sobre la misma hoja.</li>
                    <li>**Alternar Anchos**: Establezca formas a **50% (Media Columna)** para organizarlas lado a lado.</li>
                    <li>**Salto de Página**: Use el ícono de tijeras para simular saltos en hojas separadas.</li>
                    <li>**Orden en Vivo**: Suba o baje elementos para reorganizar el flujo impreso real.</li>
                  </ul>
                </div>
              </div>

              {/* Columna Derecha: El Canvas de Formas Interactivas (Páginas Simuladas del PDF) */}
              <div className="lg:col-span-8 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10.5px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Maqueta del PDF & Preview de Páginas Físicas en Tiempo Real
                  </h4>
                  <span className="text-[9px] text-slate-450 font-mono font-black uppercase px-2 py-0.5 bg-zinc-900 border border-white/5 rounded">
                    Hoja Escala {printScale}%
                  </span>
                </div>

                {/* Contenedor Gris OSCURO estilo workspace de diseño que alberga el folio blanco */}
                <div className="bg-zinc-950 p-6 rounded-2xl border border-white/5 overflow-y-auto max-h-[66vh] scrollbar-thin scrollbar-thumb-white/10 flex flex-col gap-6 items-center shadow-inner">
                  
                  {/* Hoja de PDF Simulada (White Paper look) */}
                  <div className={`w-full max-w-4xl bg-white text-slate-800 shadow-2xl rounded-sm relative border border-slate-350 select-text transition-all duration-350 ${
                    pdfPadding === "compact" ? "p-4 md:p-5" : pdfPadding === "spacious" ? "p-9 md:p-12" : "p-6 md:p-8"
                  }`}>
                    
                    {/* Logotipo y Títulos de Cabecera del Documento en la Hoja */}
                    <div className={`border-b-2 pb-3 mb-5 flex flex-col gap-1 text-slate-900 border-slate-800 ${
                      pdfTitleAlign === "center" ? "items-center text-center" : pdfTitleAlign === "right" ? "items-end text-right" : "items-start text-left"
                    }`}>
                      <div className="text-[8px] font-black tracking-widest text-slate-400 uppercase">Cabecera de Documento PDF (Editable en línea)</div>
                      
                      {/* Título editable en vivo */}
                      <input 
                        type="text" 
                        value={pdfTitle} 
                        onChange={(e) => setPdfTitle(e.target.value)} 
                        className={`w-full bg-transparent hover:bg-zinc-100 border-b border-transparent hover:border-slate-300 focus:bg-amber-500/5 text-base font-black uppercase py-1 transition-all focus:outline-none rounded px-1.5 ${
                          pdfTitleAlign === "center" ? "text-center" : pdfTitleAlign === "right" ? "text-right" : "text-left"
                        } ${
                          pdfTitleStyle === "serif" ? "font-serif text-slate-950" : pdfTitleStyle === "mono" ? "font-mono text-slate-900" : "font-sans text-slate-950"
                        } ${
                          pdfAccentColor === "blue" ? "focus:border-blue-500" :
                          pdfAccentColor === "indigo" ? "focus:border-indigo-500" :
                          pdfAccentColor === "emerald" ? "focus:border-emerald-500" :
                          pdfAccentColor === "rose" ? "focus:border-rose-500" : "focus:border-amber-500"
                        }`}
                        placeholder="TÍTULO PRINCIPAL DEL DOCUMENTO..."
                        title="Haga clic para cambiar el título principal que se imprimirá"
                      />
                      
                      {/* Subtítulo editable en vivo */}
                      <div className={`flex items-center gap-4 mt-0.5 w-full ${
                        pdfTitleAlign === "right" ? "flex-row-reverse" : "justify-between"
                      }`}>
                        <input 
                          type="text" 
                          value={pdfSubtitle} 
                          onChange={(e) => setPdfSubtitle(e.target.value)} 
                          className={`w-3/5 bg-transparent hover:bg-zinc-100 border-b border-transparent hover:border-slate-300 focus:bg-amber-500/5 text-xs font-bold text-slate-650 py-0.5 transition-all focus:outline-none rounded px-1.5 ${
                            pdfTitleAlign === "center" ? "text-center" : pdfTitleAlign === "right" ? "text-right" : "text-left"
                          } ${
                            pdfAccentColor === "blue" ? "focus:border-blue-500" :
                            pdfAccentColor === "indigo" ? "focus:border-indigo-500" :
                            pdfAccentColor === "emerald" ? "focus:border-emerald-500" :
                            pdfAccentColor === "rose" ? "focus:border-rose-500" : "focus:border-amber-500"
                          }`}
                          placeholder="SUBTÍTULO DEL DOCUMENTO..."
                          title="Haga clic para cambiar al subtítulo que se imprimirá"
                        />
                        <span className="text-[10px] font-bold font-mono text-slate-500 shrink-0 select-none">
                          {new Date().toISOString().split("T")[0]} · {monthlyData[activeMonthIndex].mes} 2026
                        </span>
                      </div>
                    </div>

                    {/* Contenido Secuencial del Reporte */}
                    <div className="flex flex-wrap gap-4.5 items-stretch">
                      {pdfSections.map((item, idx) => {
                        const isVisible = item.visible;
                        const w = item.width || "100%";
                        let widthClass = "w-full";
                        if (w === "66%") widthClass = "w-full md:w-[calc(66.6%-12px)]";
                        else if (w === "50%") widthClass = "w-full md:w-[calc(50%-12px)]";
                        else if (w === "33%") widthClass = "w-full md:w-[calc(33.3%-12px)]";

                        const scaleFactor = item.scale ?? 1.0;
                        const resolvedHeight = Math.round(135 * scaleFactor);

                        // Tonalidad del fondo
                        let bgClass = "bg-white";
                        const bgT = (item as any).bgTint || "white";
                        if (bgT === "amber") bgClass = "bg-amber-50/50";
                        else if (bgT === "slate") bgClass = "bg-slate-50/80";
                        else if (bgT === "emerald") bgClass = "bg-emerald-50/45";

                        // Estilo de tipografía
                        let fontClass = "font-sans text-slate-800";
                        const ft = (item as any).fontFamily || "sans";
                        if (ft === "serif") fontClass = "font-serif text-slate-900";
                        else if (ft === "mono") fontClass = "font-mono text-slate-800";

                        // Estilo de bordes
                        let borderClass = "border-slate-200";
                        const bS = (item as any).borderStyle || "solid";
                        if (bS === "dashed") borderClass = "border-dashed border-2 border-slate-300";
                        else if (bS === "accent-left") borderClass = "border-slate-200 border-l-4 border-l-amber-500 rounded-r-xl";
                        else if (bS === "accent-indigo") borderClass = "border-slate-200 border-l-4 border-l-indigo-500 rounded-r-xl";

                        return (
                          <React.Fragment key={item.id}>
                            {/* Salto de Página - Línea Divisoria Visual de Folio */}
                            {item.isPageBreakBefore && (
                              <div className="w-full my-4 relative border-t-2 border-dashed border-rose-400/90 flex items-center justify-center select-none pt-2">
                                <span className="absolute -top-3.5 bg-white px-3 py-1 text-[8.5px] font-black font-mono text-rose-600 uppercase tracking-widest border border-rose-300 rounded-full flex items-center gap-1.5 shadow-sm">
                                  <Scissors className="h-3 w-3 text-rose-500" />
                                  Salto de Página (Inicia Siguiente Hoja Impresa)
                                </span>
                              </div>
                            )}

                            {/* Contendor del Bloque/Sección de la Hoja */}
                            <div 
                              draggable={isVisible}
                              onDragStart={(e) => {
                                if (!isVisible) return;
                                setDraggedIdx(idx);
                                e.dataTransfer.effectAllowed = "move";
                                e.dataTransfer.setData("text/plain", idx.toString());
                              }}
                              onDragEnd={() => {
                                setDraggedIdx(null);
                                setDragOverIdx(null);
                              }}
                              onDragOver={(e) => {
                                if (draggedIdx === null) return;
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                                if (dragOverIdx !== idx) {
                                  setDragOverIdx(idx);
                                }
                              }}
                              onDragLeave={() => {
                                if (dragOverIdx === idx) {
                                  setDragOverIdx(null);
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                setDragOverIdx(null);
                                if (draggedIdx === null || draggedIdx === idx) return;
                                const updated = [...pdfSections];
                                const [removed] = updated.splice(draggedIdx, 1);
                                updated.splice(idx, 0, removed);
                                setPdfSections(updated);
                                setDraggedIdx(null);
                              }}
                              className={`transition-all duration-300 rounded-2xl border flex flex-col p-4 relative group ${widthClass} ${bgClass} ${borderClass} ${
                                dragOverIdx === idx && draggedIdx !== idx 
                                  ? `ring-4 ${accentStyle.ring} ring-offset-2 scale-[1.01] shadow-2xl relative z-10 bg-slate-50` 
                                  : ""
                              } ${
                                isVisible 
                                  ? `hover:shadow-2xl hover:border-${pdfAccentColor}-400 cursor-grab active:cursor-grabbing ${draggedIdx === idx ? "opacity-30 scale-[0.98] border-dashed" : ""}` 
                                  : "bg-zinc-50/70 border-slate-200/50 opacity-30 grayscale select-none"
                              }`}
                            >
                              {/* Barra de Controles Flotante Moderna (WYSIWYG Hover) */}
                              <div className="absolute -top-3.5 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 flex items-center gap-1 bg-slate-900 border border-slate-700 p-1 rounded-xl shadow-xl">
                                {isVisible && (
                                  <span className="cursor-grab p-1 text-slate-400 hover:text-amber-400 transition" title="Arrastrar para ordenar">
                                    <GripVertical className="h-3 w-3" />
                                  </span>
                                )}
                                
                                <button
                                  type="button"
                                  onClick={() => handleToggleSectionVisible(idx)}
                                  className={`p-1 rounded-lg text-xs cursor-pointer transition ${
                                    isVisible 
                                      ? "text-rose-400 hover:bg-rose-500/10" 
                                      : "text-emerald-400 hover:bg-emerald-500/10"
                                  }`}
                                  title={isVisible ? "Ocultar bloque" : "Activar bloque"}
                                >
                                  {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>

                                <div className="h-3 w-[1px] bg-slate-800"></div>

                                {/* Cambio de Ancho */}
                                <button
                                  type="button"
                                  onClick={() => handleCycleSectionWidth(idx)}
                                  className="px-1.5 py-0.5 rounded text-[8px] font-black font-mono bg-zinc-800 text-amber-350 hover:bg-zinc-700 transition"
                                  title="Ciclar ancho: 100% -> 66% -> 50% -> 33%"
                                >
                                  {w}
                                </button>

                                <div className="h-3 w-[1px] bg-slate-800"></div>

                                {/* Flechas Arriba/Abajo */}
                                <button
                                  type="button"
                                  onClick={() => handleMoveSection(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-25"
                                  title="Subir"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSection(idx, 'down')}
                                  disabled={idx === pdfSections.length - 1}
                                  className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-25"
                                  title="Bajar"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </button>

                                <div className="h-3 w-[1px] bg-slate-800"></div>

                                {/* Cambio de Fondo */}
                                <button
                                  type="button"
                                  onClick={() => handleCycleSectionBgTint(idx)}
                                  className="p-1 rounded text-slate-400 hover:text-emerald-400 transition"
                                  title="Fondo"
                                >
                                  <Palette className="h-3.5 w-3.5" />
                                </button>

                                {/* Tipografía */}
                                <button
                                  type="button"
                                  onClick={() => handleCycleSectionFontFamily(idx)}
                                  className="p-1 rounded text-slate-400 hover:text-indigo-400 transition text-[8px] font-bold"
                                  title="Tipografía"
                                >
                                  T
                                </button>

                                {/* Escala - / + */}
                                <button
                                  type="button"
                                  onClick={() => handleSectionScaleChange(idx, 'shrink')}
                                  disabled={scaleFactor <= 0.6}
                                  className="p-0.5 rounded text-slate-400 hover:text-white"
                                >
                                  <Minus className="h-2.5 w-2.5" />
                                </button>
                                <span className="text-[7.5px] font-mono text-slate-300 px-0.5">{scaleFactor.toFixed(1)}x</span>
                                <button
                                  type="button"
                                  onClick={() => handleSectionScaleChange(idx, 'amplify')}
                                  disabled={scaleFactor >= 1.5}
                                  className="p-0.5 rounded text-slate-400 hover:text-white"
                                >
                                  <Plus className="h-2.5 w-2.5" />
                                </button>

                                <div className="h-3 w-[1px] bg-slate-800"></div>

                                {/* Salto de Página */}
                                <button
                                  type="button"
                                  onClick={() => handleTogglePageBreak(idx)}
                                  className={`p-1 rounded ${item.isPageBreakBefore ? "text-rose-400 bg-rose-500/15" : "text-slate-400 hover:text-white"}`}
                                  title="Salto de página"
                                >
                                  <Scissors className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Cabecera Limpia Imprimible del Bloque */}
                              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
                                <div className="flex items-center gap-1.5 w-full">
                                  {/* Indicador de Color según el Accent Color de la Maqueta */}
                                  <span className={`w-2 h-2.5 rounded-sm ${accentStyle.bg}`} />
                                  <input
                                    type="text"
                                    value={sectionTitles[item.id as keyof typeof sectionTitles] || ""}
                                    onChange={(e) => handleTitleChange(item.id, e.target.value)}
                                    className={`bg-transparent hover:bg-slate-50 focus:bg-white border-b border-transparent hover:border-slate-300 focus:border-slate-400 text-xs font-black uppercase py-0.5 px-1 rounded transition-all focus:outline-none w-full truncate ${accentStyle.text}`}
                                    disabled={!isVisible}
                                    placeholder="Nombre de sección..."
                                    title="Modifique el título del campo directamente aquí"
                                  />
                                </div>
                                {!isVisible && (
                                  <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                                    Oculto
                                  </span>
                                )}
                              </div>

                              {/* Contenido Dinámico del Reporte */}
                              {isVisible ? (
                                <div className={`flex-grow ${fontClass}`} style={{ padding: `${Math.round(2 * scaleFactor)}px` }}>
                                  
                                  {/* RENDER KPIs */}
                                  {item.id === "kpis" && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      <div className="border border-slate-150 bg-zinc-50/60 p-2 rounded-lg border-l-4 border-l-amber-500">
                                        <div className="text-[7.5px] font-black text-slate-450 uppercase tracking-wider">Asistencias YTD</div>
                                        <div className="text-xs font-black font-mono text-slate-850 mt-0.5">{total2026YTD}</div>
                                      </div>
                                      <div className="border border-slate-150 bg-zinc-50/60 p-2 rounded-lg border-l-4 border-l-emerald-600">
                                        <div className="text-[7.5px] font-black text-slate-450 uppercase tracking-wider">Canal Líder</div>
                                        <div className="text-[10px] font-black text-emerald-800 mt-0.5 truncate">{topMediaPercentage.toFixed(0)}% {topMediaName}</div>
                                      </div>
                                      <div className="border border-slate-150 bg-zinc-50/60 p-2 rounded-lg border-l-4 border-l-indigo-600">
                                        <div className="text-[7.5px] font-black text-slate-450 uppercase tracking-wider">Cambio Mensual</div>
                                        <div className="text-xs font-black font-mono text-indigo-700 mt-0.5">{diffVsPrevMonthPct >= 0 ? "+" : ""}{diffVsPrevMonthPct.toFixed(1)}%</div>
                                      </div>
                                      <div className="border border-slate-150 bg-zinc-50/60 p-2 rounded-lg border-l-4 border-l-rose-500">
                                        <div className="text-[7.5px] font-black text-slate-450 uppercase tracking-wider">Acumulado YoY</div>
                                        <div className="text-xs font-black font-mono text-rose-700 mt-0.5">{variationVsPriorYearPct >= 0 ? "+" : ""}{variationVsPriorYearPct.toFixed(1)}%</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* RENDER INDIVIDUAL KPI CARDS */}
                                  {item.id === "kpi_ytd" && (
                                    <div className="border border-slate-150 bg-zinc-50/60 p-2 rounded-lg border-l-4 border-l-amber-500 flex flex-col justify-between h-full min-h-[50px]">
                                      <div className="text-[7.5px] font-black text-slate-450 uppercase tracking-wider">{sectionTitles.kpi_ytd || "Asistencias YTD"}</div>
                                      <div className="text-xs font-black font-mono text-slate-850 mt-1">{total2026YTD}</div>
                                    </div>
                                  )}

                                  {item.id === "kpi_leader" && (
                                    <div className="border border-slate-150 bg-zinc-50/60 p-2 rounded-lg border-l-4 border-l-emerald-600 flex flex-col justify-between h-full min-h-[50px]">
                                      <div className="text-[7.5px] font-black text-slate-450 uppercase tracking-wider">{sectionTitles.kpi_leader || "Canal Líder"}</div>
                                      <div className="text-[9px] font-black text-emerald-800 mt-1 truncate">{topMediaPercentage.toFixed(0)}% {topMediaName}</div>
                                    </div>
                                  )}

                                  {item.id === "kpi_change" && (
                                    <div className="border border-slate-150 bg-zinc-50/60 p-2 rounded-lg border-l-4 border-l-indigo-600 flex flex-col justify-between h-full min-h-[50px]">
                                      <div className="text-[7.5px] font-black text-slate-450 uppercase tracking-wider">{sectionTitles.kpi_change || "Cambio Mensual"}</div>
                                      <div className="text-xs font-black font-mono text-indigo-700 mt-1">{diffVsPrevMonthPct >= 0 ? "+" : ""}{diffVsPrevMonthPct.toFixed(1)}%</div>
                                    </div>
                                  )}

                                  {item.id === "kpi_yoy" && (
                                    <div className="border border-slate-150 bg-zinc-50/60 p-2 rounded-lg border-l-4 border-l-rose-500 flex flex-col justify-between h-full min-h-[50px]">
                                      <div className="text-[7.5px] font-black text-slate-450 uppercase tracking-wider">{sectionTitles.kpi_yoy || "Acumulado YoY"}</div>
                                      <div className="text-xs font-black font-mono text-rose-700 mt-1">{variationVsPriorYearPct >= 0 ? "+" : ""}{variationVsPriorYearPct.toFixed(1)}%</div>
                                    </div>
                                  )}

                                  {/* RENDER COMPARATIVA DE BARRAS */}
                                  {item.id === "bar_trend" && (
                                    <div className="w-full flex flex-col gap-1">
                                      <div className="flex gap-3 text-[7.5px] font-black text-slate-500 tracking-wider">
                                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-zinc-400"></span> 2025 (Histórico)</div>
                                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500"></span> 2026 (YTD Real)</div>
                                      </div>
                                      <div className="w-full" style={{ height: `${resolvedHeight}px`, minHeight: `${resolvedHeight}px` }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -32, bottom: 0 }}>
                                            <CartesianGrid horizontal={false} vertical={true} strokeDasharray="3 3" stroke="#94a3b8" opacity={0.4} />
                                            <XAxis dataKey="name" tick={{ fontSize: 7.5, fill: "#475569", fontWeight: "900" }} stroke="#cbd5e1" />
                                            <YAxis tick={{ fontSize: 7.5, fill: "#475569" }} stroke="#cbd5e1" />
                                            <Tooltip wrapperStyle={{ fontSize: "9px" }} />
                                            <Bar dataKey="Año 2025 (Histórico)" fill="#94a3b8" radius={[1, 1, 0, 0]} barSize={8} isAnimationActive={false} />
                                            <Bar dataKey="Año 2026 (Actual)" fill="#f59e0b" radius={[1, 1, 0, 0]} barSize={8} isAnimationActive={false} />
                                          </BarChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>
                                  )}

                                  {/* RENDER CURVA DE TENDENCIA */}
                                  {item.id === "line_trend" && (
                                    <div className="w-full" style={{ height: `${resolvedHeight}px`, minHeight: `${resolvedHeight}px` }}>
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -32, bottom: 0 }}>
                                          <CartesianGrid horizontal={false} vertical={true} strokeDasharray="3 3" stroke="#94a3b8" opacity={0.4} />
                                          <XAxis dataKey="name" tick={{ fontSize: 7.5, fill: "#475569", fontWeight: "900" }} stroke="#cbd5e1" />
                                          <YAxis tick={{ fontSize: 7.5, fill: "#475569" }} stroke="#cbd5e1" />
                                          <Tooltip wrapperStyle={{ fontSize: "9px" }} />
                                          <Line type="monotone" dataKey="Año 2025 (Histórico)" stroke="#64748b" strokeWidth={1.8} dot={{ r: 2 }} activeDot={{ r: 4 }} isAnimationActive={false} />
                                          <Line type="monotone" dataKey="Año 2026 (Actual)" stroke="#f59e0b" strokeWidth={2.4} dot={{ r: 2.5 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </div>
                                  )}

                                  {/* RENDER SUBCURSALES PARTICIPACIÓN */}
                                  {item.id === "branch_part" && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                      {resolvedSucursalListData.slice(0, 6).map(sucItem => {
                                        const total = MESES_ABR.reduce((sum, m) => sum + (sucItem.meses[m] || 0), 0);
                                        const maxVal = Math.max(...resolvedSucursalListData.map(i => MESES_ABR.reduce((sum, m) => sum + (i.meses[m] || 0), 0)), 1);
                                        const pct = (total / maxVal) * 100;
                                        return (
                                          <div key={sucItem.sucursal} className="flex flex-col border border-slate-150 bg-zinc-50/55 p-1.5 rounded text-[8.5px] leading-relaxed">
                                            <div className="flex justify-between font-extrabold text-slate-700 capitalize">
                                              <span>{sucItem.sucursal.toLowerCase()}</span>
                                              <span className="font-mono text-amber-600 font-extrabold">{total} serv.</span>
                                            </div>
                                            <div className="w-full bg-zinc-200 rounded-full h-1 mt-1 overflow-hidden">
                                              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* RENDER TABLA COMPARATIVA */}
                                  {item.id === "compare_tab" && (
                                    <div className="overflow-x-auto rounded border border-slate-200">
                                      <table className="w-full text-left text-[8.5px] border-collapse bg-white">
                                        <thead>
                                          <tr className="border-b border-slate-200 bg-zinc-50 text-slate-500 font-black">
                                            <th className="p-1 px-1.5">MES</th>
                                            <th className="p-1 text-center">2025 (HIST)</th>
                                            <th className="p-1 text-center">2026 (ACT)</th>
                                            <th className="p-1 text-center font-black">DIF ABS</th>
                                            <th className="p-1 text-center font-black">% YOY</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-750">
                                          {resolvedMonthlyList.slice(0, activeMonthIndex + 1).map((mon) => {
                                            const diff = mon.val2026 - mon.val2025;
                                            const pct = mon.val2025 > 0 ? ((diff / mon.val2025) * 100).toFixed(0) : "0";
                                            return (
                                              <tr key={mon.mes} className="hover:bg-zinc-50">
                                                <td className="p-1 px-1.5 font-bold">{mon.mes.substring(0, 3)}</td>
                                                <td className="p-1 text-center font-mono text-slate-500">{mon.val2025 === 0 ? "" : mon.val2025}</td>
                                                <td className="p-1 text-center font-mono text-amber-600 font-bold">{mon.val2026 === 0 ? "" : mon.val2026}</td>
                                                <td className={`p-1 text-center font-mono font-bold ${diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                                  {diff === 0 ? "" : (diff >= 0 ? "+" : "") + diff}
                                                </td>
                                                <td className={`p-1 text-center font-mono font-bold ${diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                                  {diff === 0 || mon.val2025 === 0 || mon.val2026 === 0 ? "-" : (diff >= 0 ? "+" : "") + pct + "%"}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}

                                  {/* RENDER DISTRIBUCION MENSUAL SUCURSALES */}
                                  {item.id === "monthly_suc" && (
                                    <div className="overflow-x-auto rounded border border-slate-200">
                                      <table className="w-full text-left text-[8px] border-collapse bg-white">
                                        <thead>
                                          <tr className="border-b border-slate-200 bg-zinc-50 text-slate-500 font-bold">
                                            <th className="p-1 px-1.5">SUCURSAL</th>
                                            {MESES_ABR.slice(0, activeMonthIndex + 2).map(m => <th key={m} className="p-1 text-center">{m}</th>)}
                                            <th className="p-1 text-right pr-1.5">YTD</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                          {resolvedSucursalListData.map(sucVal => {
                                            const total = MESES_ABR.slice(0, activeMonthIndex + 2).reduce((sum, m) => sum + (sucVal.meses[m] || 0), 0);
                                            return (
                                              <tr key={sucVal.sucursal} className="hover:bg-zinc-50">
                                                <td className="p-1 px-1.5 font-bold uppercase text-[8px] text-slate-800">{sucVal.sucursal}</td>
                                                {MESES_ABR.slice(0, activeMonthIndex + 2).map(m => (
                                                  <td key={m} className="p-1 text-center font-mono text-slate-500">{(sucVal.meses[m] === 0 || !sucVal.meses[m]) ? "" : sucVal.meses[m]}</td>
                                                ))}
                                                <td className="p-1 text-right font-mono font-black text-amber-650 pr-1.5">{total === 0 ? "" : total}</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}

                                  {/* RENDER ANÁLISIS DE DATOS IA (WYSIWYG TEXT BOX) */}
                                  {item.id === "analysis" && (
                                    <div className="w-full flex flex-col gap-1">
                                      <textarea
                                        value={analysisContent}
                                        onChange={(e) => setAnalysisContent(e.target.value)}
                                        className="w-full bg-zinc-50 hover:bg-zinc-50/50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 rounded-lg p-2 text-[9px] text-slate-700 leading-relaxed font-sans focus:outline-none transition-all resize-y min-h-[110px] focus:bg-white focus:shadow-sm font-bold"
                                        placeholder="Modifique el análisis operativo directamente aquí..."
                                        title="Usted puede escribir libremente en esta caja para persistir sus comentarios en el PDF"
                                      />
                                    </div>
                                  )}

                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-5 border border-dashed border-slate-200 bg-zinc-50 rounded-xl select-none">
                                  <EyeOff className="h-4.5 w-4.5 text-slate-400 mb-1" />
                                  <span className="text-[9px] text-slate-400 font-bold uppercase">Sección inactiva en impresión PDF</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSectionVisible(idx)}
                                    className="mt-1 text-[8px] text-amber-600 font-extrabold hover:underline uppercase"
                                  >
                                    Mostrar Componente
                                  </button>
                                </div>
                              )}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Pie de Página de la Hoja Simulada */}
                    <div className="border-t border-slate-200 pt-3 mt-7 flex justify-between items-center text-[8.5px] font-mono text-slate-450 uppercase font-black">
                      <div className="flex items-center gap-1">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-amber-500" />
                        <span>REPORTE EJECUTIVO DE ASISTENCIAS VIALES</span>
                      </div>
                      <span className="font-bold">IMPRESO YTD · HOJA PROTOTIPO</span>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* Fila inferior de Botones de la Ventana */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4 mt-5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPdfSections([
                    { id: "kpis", name: "Fila de KPIs Consolidada", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false },
                    { id: "kpi_ytd", name: "KPI: Asistencias Acumuladas YTD", visible: false, width: "25%", scale: 1.0, isPageBreakBefore: false },
                    { id: "kpi_leader", name: "KPI: Canal o Medio Líder YTD", visible: false, width: "25%", scale: 1.0, isPageBreakBefore: false },
                    { id: "kpi_change", name: "KPI: Variación versus Mes Anterior", visible: false, width: "25%", scale: 1.0, isPageBreakBefore: false },
                    { id: "kpi_yoy", name: "KPI: Variación Acumulado YoY", visible: false, width: "25%", scale: 1.0, isPageBreakBefore: false },
                    { id: "bar_trend", name: "Gráfico de Barras Mensuales (2025 vs 2026)", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false },
                    { id: "line_trend", name: "Curvas de Evolución Anual Comparada (2025 vs 2026)", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false },
                    { id: "branch_part", name: "Gráfico de Participación por Sucursales YTD", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false },
                    { id: "compare_tab", name: "Tabla de Comparativa Transversal Anual", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false },
                    { id: "monthly_suc", name: "Tabla de Distribución Mensual por Sucursal", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false },
                    { id: "analysis", name: "Texto de Análisis IA & Diagnóstico", visible: true, width: "100%", scale: 1.0, isPageBreakBefore: false }
                  ]);
                  setSectionTitles({
                    kpis: "RESUMEN DE INDICADORES OPERATIVOS (YTD)",
                    kpi_ytd: "Asistencias YTD",
                    kpi_leader: "Canal Líder",
                    kpi_change: "Cambio Mensual",
                    kpi_yoy: "Acumulado YoY",
                    bar_trend: "EVOLUCIÓN MENSUAL COMPARADA (2025 VS 2026 YTD)",
                    line_trend: "CURVAS DE EVOLUCIÓN ANUAL COMPARADA (2025 VS 2026)",
                    branch_part: "PARTICIPACIÓN DE SUCURSALES (CONSOLIDADO YTD)",
                    compare_tab: "COMPARATIVA TRANSVERSAL ANUAL (2025 VS 2026)",
                    monthly_suc: "DISTRIBUCIÓN MENSUAL POR SUCURSAL",
                    analysis: "ANÁLISIS OPERATIVO & DIAGNÓSTICO PREDICTIVO IA"
                  });
                  setPrintScale("100");
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-slate-300 bg-zinc-850 hover:bg-zinc-800 border border-white/5 rounded-xl cursor-pointer transition shadow-xl"
              >
                <RotateCcw className="h-4 w-4" />
                Restablecer Maqueta
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsPdfDesignerOpen(false)}
                  className="px-5 py-2.5 text-xs font-black text-slate-300 bg-zinc-850 hover:bg-zinc-850 border border-white/5 rounded-xl cursor-pointer transition"
                >
                  Confirmar Maqueta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPdfDesignerOpen(false);
                    handleDownloadPDF();
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-black rounded-xl text-xs cursor-pointer transition shadow-xl border border-amber-600 hover:scale-[1.02]"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      ); })()}

      {/* Información del Período Calculado Automáticamente */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-5 border border-white/10 shadow-2xl text-white hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:border-amber-500/40 hover:bg-zinc-900/50 transition-all duration-300 cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 shadow-md shrink-0">
            <Calendar className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Período de Análisis Automático</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-black text-amber-400 uppercase tracking-wider font-mono">
                {monthlyData[activeMonthIndex].mes} {activeYear} (Comparación de {activeYear - 1} vs {activeYear})
              </span>
              <span className="text-[1px] font-extrabold text-amber-400 bg-amber-500/70 border border-amber-500 px-1 py-1 rounded-lg uppercase tracking-tighter animate-pulse font-sans">
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-[10px] text-slate-450 font-mono font-bold max-w-xs text-right leading-relaxed select-none hidden sm:block">
        </div>
      </div>

      {/* COMPACT & HIGHLY VISIBLE KPI CARDS (LIGHT SHIELD FOR MAX CONTRAST) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: TOTAL ASISTENCIAS (YTD) */}
        <div className="glass-panel text-white p-5 rounded-2xl flex items-center justify-between shadow-2xl relative overflow-hidden group border border-white/10 hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(251,191,36,0.25)] transition-all duration-300 cursor-pointer">
          <div className="space-y-1 z-10">
            <span className="text-3xl font-mono font-black tracking-tight text-white block">{total2026YTD}</span>
            <span className="text-[10px] font-bold text-slate-300 block uppercase tracking-wider">TOTAL ASISTENCIAS YTD</span>
            <span className="text-[9px] font-black text-amber-400 block uppercase tracking-wide">A {monthlyData[activeMonthIndex].mes} {activeYear}</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-300 border border-amber-500/20 z-10 group-hover:scale-110 group-hover:text-amber-200 transition-all duration-300">
            <FileSpreadsheet className="h-5.5 w-5.5" />
          </div>
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
        </div>

        {/* KPI 2: MEDIO PRINCIPAL */}
        <div className="glass-panel text-white p-5 rounded-2xl flex items-center justify-between shadow-2xl relative overflow-hidden group border border-white/10 hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(251,191,36,0.25)] transition-all duration-300 cursor-pointer">
          <div className="space-y-1 z-10">
            <span className="text-3xl font-mono font-black tracking-tight text-emerald-400 block">{topMediaPercentage.toFixed(1)}%</span>
            <span className="text-[10px] font-bold text-slate-300 block uppercase tracking-wider">MEDIO LÍDER: {topMediaName}</span>
            <span className="text-[9px] font-bold text-slate-400 block">
              {topMediaCount} de {mediaConsolidadoTotal} asistencias
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-300 border border-amber-500/20 z-10 group-hover:scale-110 group-hover:text-amber-200 transition-all duration-300">
            <Layers className="h-5.5 w-5.5" />
          </div>
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
        </div>

        {/* KPI 3: VARIACIÓN VS MES ANTERIOR */}
        <div className="glass-panel text-white p-5 rounded-2xl flex items-center justify-between shadow-2xl relative overflow-hidden group border border-white/10 hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(251,191,36,0.25)] transition-all duration-300 cursor-pointer">
          <div className="space-y-1 z-10">
            <span className={`text-3xl font-mono font-black tracking-tight block ${diffVsPrevMonthPct >= 0 ? "text-emerald-400 font-black" : "text-rose-400 font-black"}`}>
              {diffVsPrevMonthPct >= 0 ? "+" : ""}{diffVsPrevMonthPct.toFixed(1)}%
            </span>
            <span className="text-[10px] font-bold text-slate-300 block uppercase tracking-wider font-sans">VS MES ANTERIOR</span>
            <span className="text-[9px] font-bold text-slate-450 block">
              {valPrevMonth2026PctStr}% cambio en mes previo
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-300 border border-amber-500/20 z-10 group-hover:scale-110 group-hover:text-amber-200 transition-all duration-300">
            {diffVsPrevMonthPct >= 0 ? <TrendingUp className="h-5.5 w-5.5" /> : <TrendingDown className="h-5.5 w-5.5" />}
          </div>
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
        </div>

        {/* KPI 4: VARIACIÓN COMPARADO AL HISTÓRICO YTD */}
        <div className="glass-panel text-white p-5 rounded-2xl flex items-center justify-between shadow-2xl relative overflow-hidden group border border-white/10 hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(251,191,36,0.25)] transition-all duration-300 cursor-pointer">
          <div className="space-y-1 z-10">
            <span className={`text-3xl font-mono font-black tracking-tight block ${variationVsPriorYearPct >= 0 ? "text-emerald-400 font-extrabold" : "text-rose-400 font-extrabold"}`}>
              {variationVsPriorYearPct >= 0 ? "+" : ""}{variationVsPriorYearPct.toFixed(1)}%
            </span>
            <span className="text-[10px] font-bold text-slate-300 block uppercase tracking-wider">VARIACIÓN VS 2025 YTD</span>
            <span className="text-[9px] font-black text-amber-400 block uppercase tracking-wide">CONSOLIDADO GENERAL</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-300 border border-amber-500/20 z-10 group-hover:scale-110 group-hover:text-amber-200 transition-all duration-300">
            {variationVsPriorYearPct >= 0 ? <TrendingUp className="h-5.5 w-5.5" /> : <TrendingDown className="h-5.5 w-5.5" />}
          </div>
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
        </div>

      </div>

      {/* RE-DISEÑO INFORME PRINCIPAL (SLATE CLARO PREMIUM CON CONTRASTE ELEVADO PARA DATOS LEGIBLES) */}
      <div className="border border-white/10 relative isolate rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* ENCABEZADOS DE LA MATRIZ */}
        <div className="bg-zinc-900/60 px-6 py-5 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl font-extrabold shadow-md flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-base font-display font-black uppercase text-white tracking-wider flex items-center gap-2">
                <span>REPORTE EJECUTIVO DE ASISTENCIAS VIALES</span>
              </h1>
              <p className="text-[10px] text-slate-350 font-extrabold uppercase tracking-widest mt-0.5">Control de Eficiencia Operativa Integral e Interanual</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-zinc-950/80 border border-white/10 text-amber-300 px-3.5 py-1.8 rounded-xl text-xs font-black font-mono tracking-wider">
              PERÍODO: {monthlyData[activeMonthIndex].mes} {activeYear}
            </span>
          </div>
        </div>

        {/* CONTENEDOR DE LA CARPETA CON EXCELENTE VISIBILIDAD (Fondo de color gris slate/zinc cambiado a ámbar cálido) */}
        <div className="p-6 md:p-8 space-y-10">
          
          {/* SECCIÓN 1: GRÁFICO INTEGRADOR EN EL CONTEXTO DEL REPORTE */}
          <div className="backdrop-blur-md bg-zinc-900/50 border border-amber-500/30 p-5 rounded-2xl shadow-md text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-white/10 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4.5 bg-amber-400 rounded-full"></div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Evolución Mensual Comparada ({activeYear - 1} vs {activeYear} YTD)
                  </h3>
                  <p className="text-[10px] text-slate-300 font-bold mt-0.5 font-sans">
                    Variación Acumulada YTD:{" "}
                    <span className={`font-mono font-black ${variationVsPriorYearPct >= 0 ? "text-green-300" : "text-red-300"}`}>
                      {variationVsPriorYearPct >= 0 ? "+" : ""}{variationVsPriorYearPct.toFixed(1)}% vs {activeYear - 1}
                    </span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-350 tracking-wider font-bold uppercase shrink-0 font-sans">Asistencias por mes</span>
            </div>
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid horizontal={false} vertical={true} strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: '700' }} 
                    stroke="#cbd5e1" 
                  />
                  <YAxis 
                    tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: '600' }} 
                    stroke="#cbd5e1" 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(245, 158, 11, 0.15)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const val2025 = payload[0].value as number;
                        const val2026 = payload[1]?.value as number || 0;
                        const diff = val2025 > 0 ? ((val2026 - val2025) / val2025) * 100 : 0;
                        const isIncrease = diff >= 0;
                        return (
                          <div className="bg-zinc-950/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg text-xs font-sans text-slate-200">
                            <p className="font-extrabold text-amber-400 uppercase mb-2 tracking-wider">{label}</p>
                            <p className="font-bold text-slate-400 flex justify-between gap-4">
                              <span>Año {activeYear - 1}:</span>
                              <span className="font-mono font-black text-white">{val2025}</span>
                            </p>
                            <p className="font-bold text-slate-400 flex justify-between gap-4">
                              <span>Año {activeYear}:</span>
                              <span className="font-mono font-black text-white">{val2026}</span>
                            </p>
                            <p className="border-t border-white/15 pt-2 mt-2 font-bold flex justify-between gap-10">
                              <span>Variación vs {activeYear - 1}:</span>
                              <span className={`font-mono font-black ${isIncrease ? 'text-green-400' : 'text-red-400'}`}>
                                {isIncrease ? '+' : ''}{diff.toFixed(1)}%
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#ffffff' }} 
                  />
                  <Bar dataKey={`Año ${activeYear - 1} (Histórico)`} fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={14} name={`Año ${activeYear - 1} (Histórico)`} />
                  <Bar dataKey={`Año ${activeYear} (Actual)`} fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={14} name={`Año ${activeYear} (YTD Real)`}>
                    <LabelList dataKey="variationPercent" position="top" style={{ fill: '#fcd34d', fontSize: '9px', fontWeight: '950', fontFamily: 'monospace' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLA BLOCK 1: SISTEMA DE TARJETAS EXECUTIVAS PARA MEDIOS (REEMPLAZA SCROLL HORIZONTAL POR GRID) */}
          <div className="space-y-4">
            <span className="text-[11px] uppercase font-black tracking-widest text-slate-205 flex items-center gap-2 bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl w-fit">
              <Layers2 className="h-4.5 w-4.5 text-amber-400" />
              DISTRIBUCIÓN DE MEDIOS DE INGRESO (CONSOLIDADO VS SUCURSALES)
            </span>
 
            {/* NOVEDAD: BLOQUE DE ANÁLISIS SUPERIOR (MEDIO CONSOLIDADO + GRÁFICO DE SUCURSALES AL LADO) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* MEDIO CONSOLIDADO MINI COMPONENT (Dorado premium accent border) */}
              <div className="lg:col-span-4 border border-amber-500/40 bg-zinc-900/40 rounded-2xl overflow-hidden flex flex-col shadow-xl backdrop-blur-md">
                <div className="bg-zinc-900/40 px-4 py-3 border-b border-amber-500/20">
                  <span className="text-[11px] font-extrabold text-amber-300 block text-center tracking-widest uppercase">MEDIO CONSOLIDADO</span>
                </div>
                <div className="p-4 flex-grow">
                  <table className="w-full text-[11px]">
                    <thead className="border-b border-white/10 text-[10px] uppercase text-white font-black font-sans">
                      <tr>
                        <th className="pb-2 text-left">MEDIO</th>
                        <th className="pb-2 text-right">ASIST.</th>
                        <th className="pb-2 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white font-extrabold font-mono font-black">
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 text-left text-white font-semibold font-sans">FLOTA</td>
                        <td className="py-2.5 text-right text-white">{mediaConsolidadoValues.flota === 0 ? "" : mediaConsolidadoValues.flota}</td>
                        <td className="py-2.5 text-right text-white">
                          {mediaConsolidadoValues.flota === 0 ? "" : mediaConsolidadoTotal > 0 ? `${((mediaConsolidadoValues.flota / mediaConsolidadoTotal) * 105).toFixed(0)}%` : ""}
                        </td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 text-left text-white font-semibold font-sans">OMITIDOS</td>
                        <td className="py-2.5 text-right text-white">{mediaConsolidadoValues.omitidos === 0 ? "" : mediaConsolidadoValues.omitidos}</td>
                        <td className="py-2.5 text-right text-white">
                          {mediaConsolidadoValues.omitidos === 0 ? "" : mediaConsolidadoTotal > 0 ? `${((mediaConsolidadoValues.omitidos / mediaConsolidadoTotal) * 105).toFixed(0)}%` : ""}
                        </td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 text-left text-white font-semibold font-sans">CALL CENTER</td>
                        <td className="py-2.5 text-right text-white">{mediaConsolidadoValues.callCenter === 0 ? "" : mediaConsolidadoValues.callCenter}</td>
                        <td className="py-2.5 text-right text-white">
                          {mediaConsolidadoValues.callCenter === 0 ? "" : mediaConsolidadoTotal > 0 ? `${((mediaConsolidadoValues.callCenter / mediaConsolidadoTotal) * 105).toFixed(0)}%` : ""}
                        </td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 text-left text-white font-semibold font-sans">SUCURSAL</td>
                        <td className="py-2.5 text-right text-white">{mediaConsolidadoValues.sucursal === 0 ? "" : mediaConsolidadoValues.sucursal}</td>
                        <td className="py-2.5 text-right text-white">
                          {mediaConsolidadoValues.sucursal === 0 ? "" : mediaConsolidadoTotal > 0 ? `${((mediaConsolidadoValues.sucursal / mediaConsolidadoTotal) * 105).toFixed(0)}%` : ""}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-zinc-950/60 px-4 py-2.5 border-t border-white/10 flex justify-between items-center text-[11px] font-black">
                  <span className="text-white font-sans">TOTAL CONSOLIDADO</span>
                  <span className="font-mono text-white">{mediaConsolidadoTotal === 0 ? "" : mediaConsolidadoTotal}</span>
                </div>
              </div>

              {/* GRÁFICO COMPARATIVO DE MEDIOS POR SUCURSAL */}
              <div className="lg:col-span-8 border border-white/10 bg-zinc-900/40 rounded-2xl p-5 flex flex-col shadow-xl backdrop-blur-md text-white">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                  <div className="w-1.5 h-4.5 bg-amber-400 rounded-full"></div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      Análisis Comparativo de Asistencias por Sucursal ({monthlyData[activeMonthIndex].mes})
                    </h3>
                    <p className="text-[10px] text-slate-450 font-bold mt-0.5 font-sans">
                      Distribución de canales de ingreso por cada punto de atención
                    </p>
                  </div>
                </div>
                <div className="w-full h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={SUCURSALES_LIST.map(sucName => {
                        const asisFlota = getMediaForSucursal(sucName, "flota");
                        const asisOmitidos = getMediaForSucursal(sucName, "omitidos");
                        const asisCall = getMediaForSucursal(sucName, "callCenter");
                        const asisSuc = getMediaForSucursal(sucName, "sucursal");
                        return {
                          name: sucName,
                          "FLOTA": asisFlota,
                          "OMITIDOS": asisOmitidos,
                          "CALL CENTER": asisCall,
                          "SUCURSAL": asisSuc,
                        };
                      })}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid horizontal={false} vertical={true} strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: '700' }} 
                        stroke="#cbd5e1" 
                      />
                      <YAxis 
                        tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: '600' }} 
                        stroke="#cbd5e1" 
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const tot = payload.reduce((sum, entry) => sum + (entry.value as number), 0);
                            return (
                              <div className="bg-zinc-950/95 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl text-[11px] font-sans text-slate-200">
                                <p className="font-extrabold text-amber-400 uppercase mb-2 tracking-wider">{label}</p>
                                <div className="space-y-1">
                                  {payload.map((entry, index) => (
                                    <div key={index} className="flex justify-between gap-6">
                                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                        {entry.name}:
                                      </span>
                                      <span className="font-mono font-black text-white">{entry.value || 0}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t border-white/15 pt-1.5 mt-1.5 font-black flex justify-between gap-10">
                                  <span className="text-slate-400">Total Sucursal:</span>
                                  <span className="font-mono text-amber-300">{tot}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={32} 
                        iconType="circle" 
                        wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', color: '#ffffff' }} 
                      />
                      <Bar dataKey="FLOTA" stackId="a" fill="#38bdf8" name="Flota" />
                      <Bar dataKey="OMITIDOS" stackId="a" fill="#f43f5e" name="Omitidos" />
                      <Bar dataKey="CALL CENTER" stackId="a" fill="#10b981" name="Call Center" />
                      <Bar dataKey="SUCURSAL" stackId="a" fill="#f59e0b" name="Sucursal" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* DETALLES DE SUCURSAL INVIDIDUAL */}
            <div className="space-y-1 pt-0">
              <span className="glass-panel text-[11px] uppercase font-zinc tracking-widest text-slate-205 flex items-center gap-2 bg-zinc-900/99 border border-white/10 px-0 py-0 rounded-xl w-fit">
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {SUCURSALES_LIST.map(sucName => {
                  const asisFlota = getMediaForSucursal(sucName, "flota");
                  const asisOmitidos = getMediaForSucursal(sucName, "omitidos");
                  const asisCall = getMediaForSucursal(sucName, "callCenter");
                  const asisSuc = getMediaForSucursal(sucName, "sucursal");
                  const sTotal = asisFlota + asisOmitidos + asisCall + asisSuc;

                  return (
                    <div key={sucName} className="border border-white/10 bg-zinc-900/40 rounded-2xl overflow-hidden flex flex-col shadow-xl backdrop-blur-md hover:border-white/20 transition-all duration-300">
                      <div className="bg-zinc-950/40 px-4 py-2.5 border-b border-white/10">
                        <span className="text-[11px] font-extrabold text-white block text-center tracking-wider truncate uppercase">{sucName}</span>
                      </div>
                      <div className="p-3 flex-grow">
                        <table className="w-full text-[10px]">
                          <thead className="border-b border-white/5 text-[9px] uppercase text-white font-semibold">
                            <tr>
                              <th className="pb-1 text-left">MEDIO</th>
                              <th className="pb-1 text-right">CONT.</th>
                              <th className="pb-1 text-right">%</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-white font-bold font-mono">
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="py-1.5 text-left text-white font-medium font-sans">FLOTA</td>
                              <td className="py-1.5 text-right text-white">{asisFlota === 0 ? "" : asisFlota}</td>
                              <td className="py-1.5 text-right text-white font-extrabold">
                                {asisFlota === 0 ? "" : sTotal > 0 ? `${((asisFlota / sTotal) * 100).toFixed(0)}%` : ""}
                              </td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="py-1.5 text-left text-white font-medium font-sans">OMITIDOS</td>
                              <td className="py-1.5 text-right text-white">{asisOmitidos === 0 ? "" : asisOmitidos}</td>
                              <td className="py-1.5 text-right text-white font-extrabold">
                                {asisOmitidos === 0 ? "" : sTotal > 0 ? `${((asisOmitidos / sTotal) * 100).toFixed(0)}%` : ""}
                              </td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="py-1.5 text-left text-white font-medium font-sans">CALL</td>
                              <td className="py-1.5 text-right text-white">{asisCall === 0 ? "" : asisCall}</td>
                              <td className="py-1.5 text-right text-white font-extrabold">
                                {asisCall === 0 ? "" : sTotal > 0 ? `${((asisCall / sTotal) * 100).toFixed(0)}%` : ""}
                              </td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="py-1.5 text-left text-white font-medium font-sans">SUC</td>
                              <td className="py-1.5 text-right text-white">{asisSuc === 0 ? "" : asisSuc}</td>
                              <td className="py-1.5 text-right text-white font-extrabold">
                                {asisSuc === 0 ? "" : sTotal > 0 ? `${((asisSuc / sTotal) * 100).toFixed(0)}%` : ""}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-zinc-950/65 px-4 py-2 border-t border-white/10 flex justify-between items-center text-[10px] font-bold">
                        <span className="text-white">TOTAL</span>
                        <span className="font-mono text-white font-black">{sTotal === 0 ? "" : sTotal}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
 
          {/* TABLA BLOCK 2: MATRIZ DE ASISTENCIAS VIALES POR SUCURSAL — ESPACIADO LEGIBLE SIN APARTADO DE DESPLAZAMIENTO */}
          <div className="space-y-4 pt-4">
            <span className="text-[11px] uppercase font-black tracking-widest text-white flex items-center gap-2 bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl w-fit">
              <MapPin className="h-4.5 w-4.5 text-amber-300" />
              MATRIZ DE ASISTENCIAS MENSUALES POR SUCURSAL
            </span>
            
            <div className="bg-zinc-900/15 rounded-2xl overflow-hidden shadow-2xl p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs table-fixed min-w-[1000px]">
                  {/* Definición de anchos de columnas fijos para que no se aprieten */}
                  <colgroup>
                    <col className="w-[16%]" /> {/* SUCURSAL column gets more space */}
                    {MESES_ABR.map((_, idx) => (
                      <col key={idx} className="w-[5.75%]" />
                    ))}
                    <col className="w-[7.5%]" />
                    <col className="w-[7.5%]" />
                  </colgroup>

                  <thead className="bg-zinc-950 text-slate-300 font-extrabold text-[10px] tracking-wider uppercase border-b border-white/10 h-11">
                    <tr>
                      <th className="p-3 pl-4 text-left">SUCURSAL</th>
                      {MESES_ABR.map((m, idx) => (
                        <th 
                          key={m} 
                          className={`p-2 text-center transition-colors font-mono ${idx === activeMonthIndex ? "bg-amber-500/20 text-amber-350 font-black" : ""}`}
                        >
                          {m}
                        </th>
                      ))}
                      <th className="p-3 text-right">TOTAL</th>
                      <th className="p-3 text-right">PROM/MES</th>
                    </tr>
                  </thead>
                  
                  <tbody className="backdrop-blur-sm divide-y divide-white/10 text-slate-205 font-extrabold bg-zinc-900/40">
                    {resolvedSucursalListData.map((sucItem, sIdx) => {
                      const valuesArray = MESES_ABR.map(m => sucItem.meses[m] || 0);
                      const totalRowSum = valuesArray.reduce((sum, v) => sum + v, 0);
                      const nonZeroMonthsCount = valuesArray.filter(v => v > 0).length || 1;
                      const averagePerMonth = totalRowSum / nonZeroMonthsCount;

                      return (
                        <tr key={sucItem.sucursal} className="hover:bg-white/5 transition-colors h-11">
                          <td className="p-3 pl-4 text-white text-[11px] font-black uppercase tracking-wide truncate">{sucItem.sucursal}</td>
                          
                          {MESES_ABR.map((m, mIdx) => {
                            const val = sucItem.meses[m] || 0;
                            const isEditableFieldOpen = isEditing && (mIdx > activeMonthIndex || isSuperAdminActive);

                            return (
                              <td 
                                key={m} 
                                className={`p-1.5 text-center font-mono text-xs transition-all duration-300 ${mIdx === activeMonthIndex ? "bg-amber-500/15 text-amber-305 font-extrabold border-x border-white/5" : "text-white"} ${isEditableFieldOpen ? "bg-emerald-950/20 text-emerald-300 border border-emerald-500/10" : ""}`}
                              >
                                {isEditableFieldOpen ? (
                                  <input
                                    type="number"
                                    value={val === 0 ? "" : val}
                                    onChange={(e) => handleSucursalChange(sIdx, m, e.target.value)}
                                    className="w-12 bg-emerald-950/40 text-emerald-350 border border-emerald-500/40 hover:border-emerald-300 rounded font-black font-mono text-center text-[11px] focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 py-0.5"
                                  />
                                ) : (
                                  val === 0 ? "" : val
                                )}
                              </td>
                            );
                          })}

                          <td className="p-3 text-right font-mono text-amber-350 font-black bg-zinc-950/80 border-l border-white/10">
                            {totalRowSum === 0 ? "" : totalRowSum}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-300">
                            {totalRowSum === 0 ? "" : averagePerMonth.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Fila del TOTAL de Sucursal */}
                    <tr className="bg-zinc-950 text-white font-black border-t border-white/10 h-12">
                      <td className="p-3 pl-4 font-extrabold uppercase tracking-widest text-[10px] text-slate-300">TOTAL SUCURSALES</td>
                      {MESES_ABR.map((m, mIdx) => {
                        const colSum = resolvedSucursalListData.reduce((sum, item) => sum + (item.meses[m] || 0), 0);
                        return (
                          <td 
                            key={m} 
                            className={`p-2 text-center font-mono font-black text-xs ${mIdx === activeMonthIndex ? "bg-amber-500/20 text-amber-305 font-bold border-x border-white/5 font-black" : ""}`}
                          >
                            {colSum === 0 ? "" : colSum}
                          </td>
                        );
                      })}
                      <td className="p-3 text-right font-mono text-amber-350 font-black bg-zinc-950 border-l border-white/10">
                        {(() => {
                          const val = resolvedSucursalListData.reduce((sum, item) => {
                            const rowSum = MESES_ABR.reduce((rSum, m) => rSum + (item.meses[m] || 0), 0);
                            return sum + rowSum;
                          }, 0);
                          return val === 0 ? "" : val;
                        })()}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-300">
                        {(() => {
                          const totalSucs = resolvedSucursalListData.reduce((sum, item) => {
                            const rowSum = MESES_ABR.reduce((rSum, m) => rSum + (item.meses[m] || 0), 0);
                            return sum + rowSum;
                          }, 0);
                          return totalSucs === 0 ? "" : (totalSucs / (SUCURSALES_LIST.length || 1)).toFixed(1);
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TABLA BLOCK 3: COMPARATIVA DE EVOLUCIÓN HISTÓRICA COMPLETA */}
          <div className="space-y-4 pt-4 text-slate-200">
            <span className="text-[11px] uppercase font-black tracking-widest text-slate-200 flex items-center gap-2 bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl w-fit">
              <Layers className="h-4.5 w-4.5 text-indigo-400" />
              COMPARATIVA ANUAL TRANSVERSAL FISCAL ({activeYear - 1} VS {activeYear})
            </span>

            {/* adicional COMPARATIVA ANUAL TRANSVERSAL FISCAL (2025 VS 2026) agregale grafico curvas */}
                        <div className="backdrop-blur-sm bg-zinc-900/40 border border-white/10 p-5 rounded-2xl shadow-xl max-w-full lg:max-w-6xl text-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4.5 bg-indigo-500 rounded-full"></div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white select-none">
                    Curvas de Evolución Anual Comparada ({activeYear - 1} vs {activeYear})
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 tracking-wider font-bold uppercase select-none">Tendencia Interanual</span>
              </div>
              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid horizontal={false} vertical={true} strokeDasharray="3 3" stroke="#475569" opacity={0.4} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700' }} 
                      stroke="#475569" 
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '600' }} 
                      stroke="#475569" 
                    />
                    <Tooltip 
                      cursor={{ stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const val2025 = payload[0].value as number;
                          const val2026 = payload[1]?.value as number || 0;
                          const diff = val2026 - val2025;
                          const diffPct = val2025 > 0 ? (diff / val2025) * 100 : 0;
                          return (
                            <div className="bg-zinc-950/95 border border-white/10 p-4 rounded-xl shadow-lg text-xs font-sans text-slate-200">
                              <p className="font-extrabold text-amber-400 uppercase mb-2 tracking-wider">{label}</p>
                              <p className="font-bold text-slate-400 flex justify-between gap-4">
                                <span>Año {activeYear - 1}:</span>
                                <span className="font-mono font-black text-white">{val2025}</span>
                              </p>
                              <p className="font-bold text-slate-400 flex justify-between gap-4">
                                <span>Año {activeYear}:</span>
                                <span className="font-mono font-black text-amber-400">{val2026}</span>
                              </p>
                              <p className="border-t border-white/10 pt-2 mt-2 font-bold flex justify-between gap-8">
                                <span>Diferencia YoY:</span>
                                <span className={`font-mono font-black ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {diff >= 0 ? '+' : ''}{diff} ({diffPct >= 0 ? '+' : ''}{diffPct.toFixed(1)}%)
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={32} 
                      wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8' }} 
                    />
                    <Line type="monotone" dataKey={`Año ${activeYear - 1} (Histórico)`} stroke="#64748b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name={`Año ${activeYear - 1}`} />
                    <Line type="monotone" dataKey={`Año ${activeYear} (Actual)`} stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name={`Año ${activeYear}`}>
                      <LabelList 
                        dataKey="variationPercent" 
                        position="top" 
                        fill="#fbbf24" 
                        fontSize={10} 
                        fontWeight="900" 
                        offset={10} 
                      />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Contenedor de la tabla scrollable - Completamente separado y distinguido en su propio panel */}
            <div className="backdrop-blur-sm bg-zinc-900/40 border border-white/10 p-5 rounded-2xl shadow-xl max-w-full lg:max-w-6xl text-slate-200 mt-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4.5 bg-sky-500 rounded-full"></div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white select-none">
                    Matriz de Métricas Comparativas YoY ({activeYear - 1} vs {activeYear})
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 tracking-wider font-bold uppercase select-none">Consolidado Mensual</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse text-[11.5px] min-w-[700px]">
                  <thead className="bg-zinc-950 text-slate-300 font-extrabold text-[9px] tracking-wider uppercase border-b border-white/10 h-8">
                    <tr>
                      <th className="py-1 px-3 pl-4">MES</th>
                      <th className="py-1 px-3 text-center font-mono">AÑO 2025</th>
                      <th className="py-1 px-3 text-center font-mono">AÑO 2026</th>
                      <th className="py-1 px-3 text-center font-mono">DIFERENCIA</th>
                      <th className="py-1 px-3 text-center font-mono">% CAMBIO YOY</th>
                      <th className="py-1 px-3 text-center font-mono whitespace-nowrap">vs MES ANTERIOR (26)</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-white/10 text-white font-extrabold">
                    {resolvedMonthlyList.map((item, idx) => {
                      const isCurrentSelected = idx === activeMonthIndex;
                      const prevVal = idx > 0 ? (resolvedMonthlyList[idx - 1]?.val2026 || 0) : 0;
                      
                      const diffVal = item.val2026 - item.val2025;
                      
                      const pctChangeYear = item.val2025 > 0 
                        ? (diffVal / item.val2025) * 100 
                        : 0;

                      const pctChangeMonth = prevVal > 0 
                        ? ((item.val2026 - prevVal) / prevVal) * 100 
                        : 0;

                      let diffColor = "text-slate-400";
                      let diffBg = "";
                      if (diffVal > 0) {
                        diffColor = "text-emerald-400 font-bold";
                        diffBg = "bg-emerald-950/20";
                      } else if (diffVal < 0) {
                        diffColor = "text-rose-400 font-bold";
                        diffBg = "bg-rose-950/20";
                      }

                      let pctColor = "text-slate-400";
                      if (pctChangeYear > 0) pctColor = "text-emerald-400 font-extrabold bg-emerald-950 px-2.5 py-0.5 rounded-lg border border-emerald-900";
                      else if (pctChangeYear < 0) pctColor = "text-rose-400 font-extrabold bg-rose-950 px-2.5 py-0.5 rounded-lg border border-rose-900";

                      let pctMonthColor = "text-slate-400";
                      if (pctChangeMonth > 0) pctMonthColor = "text-emerald-400 font-semibold";
                      else if (pctChangeMonth < 0) pctMonthColor = "text-rose-400 font-semibold";

                      const isEditable2025 = isEditing;
                      const isEditable2026 = isEditing && (idx > activeMonthIndex || isSuperAdminActive);

                      return (
                        <tr key={item.mes} className={`hover:bg-white/5 transition h-8 ${isCurrentSelected ? "bg-amber-500/10 text-amber-300" : "text-white"}`}>
                          <td className="py-1 px-3 pl-4">
                             <span className={`text-[11px] uppercase font-extrabold ${isCurrentSelected ? "text-amber-400 font-black" : "text-white"}`}>{item.mes}</span>
                          </td>
                
                          {/* Celda del Año 2025 */}
                          <td className={`py-1 px-3 text-center font-mono font-bold text-white transition-all duration-300 ${isEditable2025 ? "bg-emerald-950/20 text-emerald-300 border border-emerald-500/10" : ""}`}>
                            {isEditable2025 ? (
                              <input
                                type="number"
                                value={item.val2025 === 0 ? "" : item.val2025}
                                onChange={(e) => handleMonthlyChange(idx, "val2025", e.target.value)}
                                className="w-14 bg-emerald-950/40 text-emerald-350 border border-emerald-500/40 hover:border-emerald-300 rounded font-black font-mono text-center text-[10.5px] focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 py-0"
                              />
                            ) : (
                              item.val2025 === 0 ? "" : item.val2025
                            )}
                          </td>
  
                          {/* Celda del Año 2026 */}
                          <td className={`py-1 px-3 text-center font-mono font-bold transition-all duration-300 ${isCurrentSelected ? "text-amber-400 font-black" : "text-white"} ${isEditable2026 ? "bg-emerald-950/20 text-emerald-300 border border-emerald-500/10" : ""}`}>
                            {isEditable2026 ? (
                              <input
                                type="number"
                                value={item.val2026 === 0 ? "" : item.val2026}
                                onChange={(e) => handleMonthlyChange(idx, "val2026", e.target.value)}
                                className="w-14 bg-emerald-950/40 text-emerald-350 border border-emerald-500/40 hover:border-emerald-300 rounded font-black font-mono text-center text-[10.5px] focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 py-0"
                              />
                            ) : (
                              item.val2026 === 0 ? "" : item.val2026
                            )}
                          </td>

                          <td className={`py-1 px-3 text-center font-mono font-black ${diffBg} ${diffColor}`}>
                            {diffVal === 0 ? "" : (diffVal > 0 ? `+${diffVal}` : diffVal)}
                          </td>

                          <td className="py-1 px-3 text-center font-mono">
                            {item.val2025 === 0 || item.val2026 === 0 ? (
                              <span className="text-slate-550 font-normal">-</span>
                            ) : (
                              <span className={pctColor}>{pctChangeYear >= 0 ? "+" : ""}{pctChangeYear.toFixed(1)}%</span>
                            )}
                          </td>

                          <td className={`py-1 px-3 text-center font-mono ${pctMonthColor}`}>
                            {idx === 0 || prevVal === 0 || item.val2026 === 0 ? "-" : `${pctChangeMonth >= 0 ? "+" : ""}${pctChangeMonth.toFixed(1)}%`}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Fila del TOTAL del Comparativo */}
                    <tr className="bg-zinc-950 border-t border-white/10 text-slate-200 font-extrabold h-8">
                      <td className="py-1 px-3 pl-4 font-bold uppercase text-[9.5px] tracking-widest text-slate-400 font-sans">TOTAL GENERAL</td>
                      
                      <td className="py-1 px-3 text-center font-mono text-slate-100 font-black text-[11px]">
                        {(() => {
                          const s25 = resolvedMonthlyList.reduce((sum, i) => sum + i.val2025, 0);
                          return s25 === 0 ? "" : s25;
                        })()}
                      </td>

                      <td className="py-1 px-3 text-center font-mono text-amber-400 font-black text-[11px]">
                        {(() => {
                          const s26 = resolvedMonthlyList.reduce((sum, i) => sum + i.val2026, 0);
                          return s26 === 0 ? "" : s26;
                        })()}
                      </td>

                      {/* Diferencia consolidada */}
                      {(() => {
                        const sum2025 = resolvedMonthlyList.reduce((sum, i) => sum + i.val2025, 0);
                        const sum2026 = resolvedMonthlyList.reduce((sum, i) => sum + i.val2026, 0);
                        const tDiff = sum2026 - sum2025;
                        const tPct = sum2025 > 0 ? (tDiff / sum2025) * 100 : 0;
                        
                        return (
                          <>
                            <td className={`py-1 px-3 text-center font-mono font-black text-[11px] ${tDiff >= 0 ? "text-emerald-400 bg-emerald-950/20" : "text-rose-400 bg-rose-950/20"}`}>
                              {tDiff === 0 ? "" : (tDiff > 0 ? `+${tDiff}` : tDiff)}
                            </td>
                            <td className="py-1 px-3 text-center font-mono">
                              {sum2025 === 0 || sum2026 === 0 ? (
                                <span className="text-slate-550 font-normal">-</span>
                              ) : (
                                <span className={`font-black text-[10px] ${tPct >= 0 ? "bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900" : "bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded border border-rose-900"}`}>
                                  {tPct >= 0 ? "+" : ""}{tPct.toFixed(1)}%
                                </span>
                              )}
                            </td>
                          </>
                        );
                      })()}

                      <td className="py-1 px-3 text-center font-mono text-slate-500 font-semibold">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* SECCIÓN 3: INFORME DE ANÁLISIS DE DATOS IA EN VIVO (INTEGRADO EN PDF) */}
          <div className="glass-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:border-amber-500/40 hover:bg-zinc-900/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-zinc-900 border border-white/15 rounded-lg text-amber-300">
                  <Brain className="h-5 w-5 text-amber-400 shrink-0" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Análisis de Datos Operativo & Predictivo
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold font-mono">
                    {hasBeenAnalyzed 
                      ? `Generado de forma dinámica con IA para ${monthlyData[activeMonthIndex].mes} 2026`
                      : `${monthlyData[activeMonthIndex].mes} 2026`
                    }
                  </p>
                </div>
              </div>
              {hasBeenAnalyzed && !isSharedView && (
                <button
                  type="button"
                  onClick={generateAnalysis}
                  disabled={isGeneratingAnalysis}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-amber-300 font-black rounded-xl text-[10px] cursor-pointer transition border border-white/10 disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                  {isGeneratingAnalysis ? "Analizando..." : "Regenerar Análisis"}
                </button>
              )}
            </div>
            
            {!hasBeenAnalyzed ? (
              isSharedView ? (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-950/40 rounded-xl border border-dashed border-white/5 space-y-2">
                  <Brain className="h-5 w-5 text-slate-500 animate-pulse" />
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                    No se ha generado un análisis para este período.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-950/65 rounded-xl border border-dashed border-amber-500/25 space-y-4">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-350 relative">
                    <Brain className="h-8 w-8 text-amber-450 animate-pulse" />
                    <Sparkles className="h-4 w-4 text-amber-350 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-450">Análisis Predictivo Listo</h4>
                    <p className="text-[11px] text-slate-350 leading-relaxed font-bold">
                      Las métricas comparativo-históricas interanuales de <span className="text-white font-extrabold">{monthlyData[activeMonthIndex].mes} 2026</span> han sido precargadas correctamente. Presione el botón a continuación para ejecutar el análisis operativo con IA.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={generateAnalysis}
                    disabled={isGeneratingAnalysis}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 text-zinc-950 font-black uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-amber-400 disabled:opacity-50"
                  >
                    {isGeneratingAnalysis ? (
                      <>
                        <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        <span>Procesando Datos...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 text-zinc-950" />
                        <span>Analizar Datos con IA</span>
                      </>
                    )}
                  </button>
                </div>
              )
            ) : (
              <div className="text-xs text-slate-205 leading-relaxed font-sans space-y-4 whitespace-pre-line bg-zinc-950/40 p-4.5 rounded-xl border border-white/5 font-bold">
                {analysisContent}
              </div>
            )}
          </div>

        </div>

        {/* PIE DE PLANILLA */}
        <div className="bg-zinc-950 px-6 py-4.5 border-t border-white/10 text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono leading-relaxed">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-slate-300 font-semibold">REPORTE EJECUTIVO DE ASISTENCIAS VIALES</span>
          </div>
          <div className="text-slate-300 mt-1.5 sm:mt-0 font-extrabold">
            REPORTE DIGITAL • {new Date().toISOString().split("T")[0]}
          </div>
        </div>

      </div>

      {/* Botones y controles de edición manual */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 glass-panel p-5 md:p-6 rounded-2xl border border-white/10 shadow-2xl text-white mt-10 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:border-amber-500/40 hover:bg-zinc-900/50 transition-all duration-300 cursor-pointer">
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">Historial de Asistencias Manuales</h4>
          <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-wide">Consolide y edite los valores de asistencias del histórico comparativo</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-2.5 w-full lg:w-auto justify-stretch md:justify-end">
          {isSharedView ? (
            <>
              <div className="flex items-center justify-center gap-2 bg-blue-950/40 text-blue-300 border border-blue-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider select-none w-full sm:w-auto">
                <Eye className="h-4 w-4 text-blue-400" />
                Solo Visualización
              </div>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 h-10 px-4 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer border bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-500 w-full sm:w-auto"
                title="Descargar el reporte en formato PDF"
              >
                <Download className="h-4 w-4" />
                Descargar Reporte PDF
              </button>
            </>
          ) : isEditing ? (
            <>
              {isSuperAdminActive ? (
                <div 
                  onClick={() => setIsSuperAdminActive(false)}
                  title="Haga clic para salir del modo Súper Admin"
                  className="flex items-center justify-center gap-1.5 h-10 px-3 border border-emerald-500/30 bg-emerald-950/80 text-emerald-350 text-[10px] uppercase font-black tracking-wider rounded-xl cursor-pointer hover:bg-emerald-900 transition-all duration-300 shadow-md animate-pulse w-full sm:w-auto"
                >
                  <Unlock className="h-4 w-4 text-emerald-400" />
                  Súper Admin Activo
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSuperAdminModal(true)}
                  className="flex items-center justify-center gap-2 h-10 px-4 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer border bg-zinc-950/60 hover:bg-zinc-900 border-red-500/20 hover:border-red-500/60 text-red-300 w-full sm:w-auto"
                  title="Desbloquear edición de meses cerrados (Clave Programador)"
                >
                  <Lock className="h-4 w-4 text-red-400" />
                  Liberar Historial
                </button>
              )}
              <button
                type="button"
                onClick={saveEditedValues}
                className="flex items-center justify-center gap-2 h-10 px-4 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer border bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 w-full sm:w-auto"
              >
                <Save className="h-4 w-4" />
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="flex items-center justify-center gap-2 h-10 px-4 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer border bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-white/10 hover:text-white w-full sm:w-auto"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className={`flex items-center justify-center gap-2 h-10 px-3.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer border w-full md:w-auto ${copiedFeedback ? "bg-emerald-600 text-white border-emerald-500" : "bg-gradient-to-r from-[#1E2022] to-zinc-850 hover:bg-zinc-800 text-amber-400 border-amber-500/30 hover:border-amber-500"}`}
                title="Copiar enlace de visualización pública para este reporte"
              >
                {copiedFeedback ? <Check className="h-4 w-4 text-white" /> : <Share2 className="h-4 w-4" />}
                {copiedFeedback ? "¡Enlace Copiado!" : "Compartir Reporte"}
              </button>
              <button
                type="button"
                onClick={startEditMode}
                className="flex items-center justify-center gap-2 h-10 px-3.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer border bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-500 w-full md:w-auto"
              >
                <Edit3 className="h-4 w-4" />
                Editar Historial Manual
              </button>
              <button
                type="button"
                onClick={resetToImageDefaults}
                className="flex items-center justify-center gap-2 h-10 px-3.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer border bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-white/10 hover:text-white w-full md:w-auto"
                title="Regresa a los números exactos de la foto"
              >
                <RotateCcw className="h-4 w-4" />
                Sincronizar Captura
              </button>
              
              {/* Botón para abrir el diseñador de formas y maqueta PDF */}
              <button
                type="button"
                onClick={() => setIsPdfDesignerOpen(true)}
                className="flex items-center justify-center gap-2 h-10 px-3.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer border bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-white/10 hover:text-white w-full md:w-auto"
                title="Diseñador visual avanzado de formas PDF"
              >
                <Sliders className="h-4 w-4" />
                Diseñador de PDF (Visual)
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 h-10 px-4 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer border bg-amber-500 hover:bg-amber-350 text-zinc-950 border-amber-500 w-full md:w-auto"
                title="Descargar el reporte en formato PDF"
              >
                <Download className="h-4 w-4" />
                Descargar Reporte PDF
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
