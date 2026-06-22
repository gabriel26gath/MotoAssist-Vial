import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Camera, 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Plus, 
  FileDown, 
  Edit3, 
  Check, 
  X, 
  Loader2, 
  User, 
  LogOut, 
  LogIn, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  Receipt,
  HelpCircle,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
  Users,
  BarChart3,
  Filter,
  Search,
  ChevronRight,
  TrendingUp,
  MapPin,
  FileCheck,
  Percent,
  RefreshCw,
  FolderOpen,
  Settings,
  Smartphone,
  Database,
  CheckCircle2
} from "lucide-react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  updateDoc,
  onSnapshot,
  setDoc
} from "firebase/firestore";

import { db, auth, isFirebaseConfigured, handleFirestoreError } from "./firebase";
import { Invoice, InvoiceItem, Motorizado, OperationType, VehicleIncident } from "./types";
import { compressImage } from "./utils/imageCompressor";
import { exportInvoicesToCSV } from "./utils/csvExport";
// @ts-ignore
import tireTracksBg from "./assets/images/tire_tracks_1781557483749.jpg";

// Importar sub-componentes modulares
import DashboardView from "./components/DashboardView";
import MotorizadosView from "./components/MotorizadosView";
import ReportsView from "./components/ReportsView";
import ExecutiveReportView from "./components/ExecutiveReportView";
import TicketDetailView from "./components/TicketDetailView";
import TicketEditForm from "./components/TicketEditForm";
import CameraCapture from "./components/CameraCapture";
import ImagePreprocessor from "./components/ImagePreprocessor";

// Demo Image and Mock
const DEMO_IMAGE_BASE64 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'><rect width='300' height='400' fill='%23fafafa'/><path d='M10 20 h280 M10 30 h280' stroke='%23ccc'/><text x='150' y='60' font-family='monospace' font-size='18' text-anchor='middle'>TALLER VIAL S.A.</text><text x='150' y='80' font-family='monospace' font-size='11' text-anchor='middle'>Brisas del Golf, San Miguelito</text><text x='150' y='110' font-family='monospace' font-size='12' text-anchor='middle'>FACTURA: 8-NT-9201-192</text><text x='20' y='150' font-family='monospace' font-size='12'>3x LUBRICANTE SINTETICO</text><text x='280' y='150' font-family='monospace' font-size='12' text-anchor='end'>24.00</text><text x='20' y='170' font-family='monospace' font-size='12'>1x FILTRO DE ACEITE PREMIUM</text><text x='280' y='170' font-family='monospace' font-size='12' text-anchor='end'>8.50</text><text x='20' y='190' font-family='monospace' font-size='12'>1x MANO DE OBRA REEMPLAZO</text><text x='280' y='190' font-family='monospace' font-size='12' text-anchor='end'>15.00</text><path d='M20 230 h260' stroke='%23aaa' stroke-dasharray='4'/><text x='20' y='260' font-family='monospace' font-size='14' font-weight='bold'>TOTAL USD</text><text x='280' y='260' font-family='monospace' font-size='14' font-weight='bold' text-anchor='end'>51.25</text><text x='20' y='280' font-family='monospace' font-size='11'>TAX ITBMS (7%): 3.75</text><text x='25' y='325' font-family='monospace' font-size='10'>VICTOR CRUZ - CAJA 01</text><text x='150' y='360' font-family='monospace' font-size='10' text-anchor='middle'>GRACIAS SERVICIO</text></svg>";

const DEMO_EXTRACTION_MOCK: Invoice = {
  issuer: "TALLER VIAL, S.A.",
  date: new Date().toISOString().split("T")[0],
  invoiceNumber: "AC-2026-90412",
  total: 51.25,
  tax: 3.75,
  paymentMethod: "Tarjeta de Crédito",
  items: [
    { name: "LUBRICANTE SINTETICO MULTIGRADO", quantity: 3, price: 8.00, total: 24.00 },
    { name: "FILTRO DE ACEITE PREMIUM S.A.", quantity: 1, price: 8.50, total: 8.50 },
    { name: "MANO DE OBRA REEMPLAZO TALLER", quantity: 1, price: 15.00, total: 15.00 }
  ],
  imageUrl: DEMO_IMAGE_BASE64,
  userId: "demo",
  createdAt: new Date().toISOString(),
  issuerRuc: "603-203-124985 DV 01",
  issuerAddress: "Panama Brisas del golf, Av Principal, Local 4",
  invoiceType: "Comprobante Auxiliar de Factura Electrónica",
  serial: "FEP-0010920421",
  sucursal: "0010 (Brisas)",
  ptoFact: "001",
  receiverName: "DORA GUERRA",
  receiverRuc: "8-306-599 DV",
  receiverType: "Consumidor final",
  subtotal: 47.50,
  itbms: 3.75,
  desgloseItbms: [
    { base: 47.50, rate: "7%", tax: 3.75 }
  ],
  qrUrl: "https://dgi-fep.mef.gob.pa/Consultas/FacturaElectronica",
  accessKey: "20261156550294101FEP",
  seller: "VICTOR CRUZ",
  comments: "DOMICILIO BRISAS DEL GOLF, calle primera",
  motorizadoId: ""
};

const LogoSVG = ({ className = "h-8 w-8 text-white" }: { className?: string }) => (
  <svg 
    viewBox="0 0 512 512" 
    className={className} 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <mask id="logo-mask">
        <rect width="512" height="512" fill="white" />
        {/* Visor cutout in helmet */}
        <path d="M 275 102 L 314 114 L 308 138 L 270 124 Z" fill="black" stroke="black" strokeWidth="3" strokeLinejoin="round" />
        {/* Lightning cutout in battery box */}
        <polygon points="126,234 94,272 116,272 104,310 138,264 116,264" fill="black" />
      </mask>
    </defs>
    
    <g mask="url(#logo-mask)">
      {/* Battery (Bornes + Tapa + Cuerpo) */}
      <rect x="35" y="218" width="162" height="106" rx="4" />
      <rect x="28" y="198" width="176" height="20" rx="3" />
      <rect x="46" y="188" width="22" height="10" rx="1.5" />
      <rect x="51" y="180" width="12" height="8" rx="1" />
      <rect x="164" y="188" width="22" height="10" rx="1.5" />
      <rect x="169" y="180" width="12" height="8" rx="1" />
      
      {/* Soporte Parrilla */}
      <rect x="15" y="324" width="195" height="10" rx="2" />
      
      {/* Tubo de Escape */}
      <path d="M 12 344 L 54 344" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
      
      {/* Asiento y Cuerpo de la Moto */}
      <path d="M 210 324 L 285 324 C 295 324, 300 332, 298 342 L 292 384 L 210 384 Z" />
      
      {/* Conductor (Cuerpo, Cabeza, Brazos, Piernas, Pies) */}
      <circle cx="275" cy="115" r="48" />
      <path d="M 252 161 Q 256 135, 270 144" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
      <path d="M 248 160 C 220 180, 210 240, 215 310 L 290 310 C 285 270, 280 240, 255 160 Z" />
      <path d="M 248 175 C 285 195, 305 210, 365 228" fill="none" stroke="currentColor" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 225 305 Q 340 312, 340 385" fill="none" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 330 384 L 375 384" stroke="currentColor" strokeWidth="22" strokeLinecap="round" />
      
      {/* Plataforma de Pies y Guardabarros / Frontal */}
      <path d="M 215 396 L 360 396" stroke="currentColor" strokeWidth="24" strokeLinecap="round" />
      <path d="M 355 396 L 415 285" stroke="currentColor" strokeWidth="24" strokeLinecap="round" />
      <path d="M 412 285 L 388 235" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
      <path d="M 354 246 C 360 240, 392 232, 388 235 L 392 258" stroke="currentColor" strokeWidth="18" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Ruedas */}
      <circle cx="150" cy="410" r="36" stroke="currentColor" strokeWidth="24" fill="none" />
      <circle cx="440" cy="410" r="36" stroke="currentColor" strokeWidth="24" fill="none" />
    </g>
  </svg>
);

const EXPORT_COLUMNS = [
  "ID Interno",
  "Establecimiento",
  "RUC Emisor",
  "Dirección Emisor",
  "Tipo Factura",
  "Nº Ticket/Factura",
  "Serie / Sucursal",
  "Cliente Receptor",
  "RUC Cliente",
  "Vendedor",
  "Asignado a (Motorizado)",
  "Método Pago",
  "Producto/Servicio",
  "Cantidad",
  "Precio Unitario",
  "Total Producto",
  "Impuestos (ITBMS / IVA)",
  "Subtotal Ticket",
  "Total Ticket",
  "Clave de Acceso / CUFE",
  "Comentarios / Dirección Brisas",
  "Fecha Emisión",
  "Fecha Registro"
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [motorizados, setMotorizados] = useState<Motorizado[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // Detectar visualización compartida pública
  const isExecutivePublicShared = useMemo(() => {
    if (typeof window === "undefined") return false;
    const search = window.location.search;
    return search.includes("view=executive-public") || 
           search.includes("share=executive") || 
           search.includes("view=executive-readonly") ||
           search.includes("shared=executive");
  }, []);

  const [activeTab, setActiveTab ] = useState<"dashboard" | "tickets" | "fleet" | "reports" | "executive">(
    isExecutivePublicShared ? "executive" : "tickets"
  );
  const [mobileOptimized, setMobileOptimized] = useState<boolean>(false);

  // Forzar tab de reporte en modo público
  useEffect(() => {
    if (isExecutivePublicShared) {
      setActiveTab("executive");
    }
  }, [isExecutivePublicShared]);
  
  // Custom columns configuration for main Tickets list export
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>(EXPORT_COLUMNS);
  const [showExportFieldsConfig, setShowExportFieldsConfig] = useState(false);

  // Estados del escáner / editor
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [pendingPreprocessingImage, setPendingPreprocessingImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [originalImageInModal, setOriginalImageInModal] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formulario Editable
  const [formValues, setFormValues] = useState<Invoice>({
    issuer: "",
    date: "",
    invoiceNumber: "",
    total: 0,
    tax: 0,
    paymentMethod: "",
    items: [],
    imageUrl: "",
    userId: "",
    createdAt: ""
  });

  // Estado para el listado global de incidentes de motorizados
  const [incidents, setIncidents] = useState<VehicleIncident[]>([]);

  const saveIncidents = async (list: VehicleIncident[]) => {
    setIncidents(list);

    if (!isFirebaseConfigured || !db) {
      console.warn("Base de datos Firebase ausente o desconectada. No se pudo registrar la incidencia en la nube.");
      return; 
    }
    
    // Delta Sync to Firestore
    const currentMap = new Map<string, VehicleIncident>(incidents.map(i => [i.id, i]));
    const targetMap = new Map<string, VehicleIncident>(list.map(i => [i.id, i]));
    
    // Identify Deletions
    for (const [id] of currentMap.entries()) {
      if (!targetMap.has(id)) {
        try {
          await deleteDoc(doc(db, "incidents", id));
        } catch (e) {
          console.error("Error deleting incident from Firestore:", e);
        }
      }
    }
    
    // Identify Additions & Updates
    for (const [id, targetInc] of targetMap.entries()) {
      const currentInc = currentMap.get(id);
      if (!currentInc) {
        // Create in Firestore
        try {
          await setDoc(doc(db, "incidents", id), {
            id: targetInc.id,
            motorizadoId: targetInc.motorizadoId,
            date: targetInc.date,
            description: targetInc.description,
            severity: targetInc.severity,
            status: targetInc.status
          });
        } catch (e) {
          console.error("Error adding incident to Firestore:", e);
        }
      } else if (
        currentInc.status !== targetInc.status || 
        currentInc.description !== targetInc.description || 
        currentInc.severity !== targetInc.severity ||
        currentInc.date !== targetInc.date
      ) {
        // Update in Firestore
        try {
          await updateDoc(doc(db, "incidents", id), {
            status: targetInc.status,
            description: targetInc.description,
            severity: targetInc.severity,
            date: targetInc.date
          });
        } catch (e) {
          console.error("Error updating incident in Firestore:", e);
        }
      }
    }
  };

  // State para modal de confirmación customizado
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning";
  } | null>(null);

  const [firebaseNotification, setFirebaseNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showFirebaseToast = (title: string, message: string, type: "success" | "error" | "info" = "success") => {
    setFirebaseNotification({
      show: true,
      title,
      message,
      type
    });
    setTimeout(() => {
      setFirebaseNotification(prev => prev && prev.title === title ? null : prev);
    }, 5000);
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, variant: "danger" | "warning" = "danger") => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(null);
      },
      variant
    });
  };

  // Local Storage Helpers
  const getLocalInvoices = (): Invoice[] => {
    const data = localStorage.getItem("thermal_invoices_local_v2");
    return data ? JSON.parse(data) : [];
  };

  const saveLocalInvoices = (list: Invoice[]) => {
    localStorage.setItem("thermal_invoices_local_v2", JSON.stringify(list));
    setInvoices(list);
  };

  const getLocalMotorizados = (): Motorizado[] => {
    const data = localStorage.getItem("thermal_motorizados_local_v2");
    return data ? JSON.parse(data) : [];
  };

  const saveLocalMotorizados = (list: Motorizado[]) => {
    localStorage.setItem("thermal_motorizados_local_v2", JSON.stringify(list));
    setMotorizados(list);
  };

  // Real-time synchronization
  useEffect(() => {
    let unsubscribeInvoices = () => {};
    let unsubscribeMotorizados = () => {};
    let unsubscribeIncidents = () => {};

    if (isFirebaseConfigured && (currentUser || isExecutivePublicShared)) {
      setLoadingList(true);
      
      // Invoices Snapshot (unrestricted - shared database)
      const qInv = collection(db, "invoices");
      unsubscribeInvoices = onSnapshot(
        qInv,
        (snapshot) => {
          const list: Invoice[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Invoice);
          });
          // Sort client-side to ensure index is not required
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setInvoices(list);
          setLoadingList(false);
        },
        (error) => {
          console.error("Error en real-time listening invoices:", error);
          setLoadingList(false);
          try {
            handleFirestoreError(error, OperationType.LIST, "invoices");
          } catch (err) {
            console.error("Error estructurado de reglas detectado:", err);
          }
        }
      );

      // Motorizados Snapshot (unrestricted - shared database)
      const qMot = collection(db, "motorizados");
      unsubscribeMotorizados = onSnapshot(
        qMot,
        (snapshot) => {
          const list: Motorizado[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Motorizado);
          });
          // Sort client-side to ensure index is not required
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setMotorizados(list);
        },
        (error) => {
          console.error("Error en real-time listening motorizados:", error);
          try {
            handleFirestoreError(error, OperationType.LIST, "motorizados");
          } catch (err) {
            console.error("Error estructurado de reglas detectado:", err);
          }
        }
      );

      // Incidents Snapshot (unrestricted - shared database)
      const qInc = collection(db, "incidents");
      unsubscribeIncidents = onSnapshot(
        qInc,
        (snapshot) => {
          const list: VehicleIncident[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as VehicleIncident);
          });
          setIncidents(list);
        },
        (error) => {
          console.error("Error en real-time listening incidents:", error);
          try {
            handleFirestoreError(error, OperationType.LIST, "incidents");
          } catch (err) {
            console.error("Error estructurado de reglas detectado:", err);
          }
        }
      );

      return () => {
        unsubscribeInvoices();
        unsubscribeMotorizados();
        unsubscribeIncidents();
      };
    } else {
      console.warn("Base de datos de Firebase ausente, no configurada o el usuario no ha iniciado sesión.");
      setInvoices([]);
      setMotorizados([]);
      setIncidents([]);
    }
  }, [currentUser, isExecutivePublicShared]);

  // Login / Logout Flow
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const handleEmailPasswordLogIn = async (emailInput: string, passwordInput: string) => {
    setAuthLoading(true);
    setAuthError(null);

    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;

    if (!email || !password) {
      setAuthError("Por favor, ingrese un correo electrónico y contraseña válidos.");
      setAuthLoading(false);
      return;
    }

    if (email !== "admin@acsa.com" && email !== "moto@acsa.com") {
      setAuthError("Acceso Rechazado: Este correo electrónico no está autorizado en este sistema.");
      setAuthLoading(false);
      return;
    }

    // Determine role: admin if exact email "admin@acsa.com", else "viewer".
    const determinedRole = email === "admin@acsa.com" ? "admin" : "viewer";
    const resolvedDisplayName = determinedRole === "admin" ? "Control Central ACSA" : "Auxiliar Moto ACSA";

    if (!isFirebaseConfigured || !auth) {
      setAuthError("El servicio de Firebase no está configurado o conectado. Por favor, configure sus credenciales y variables de entorno en Vercel.");
      setAuthLoading(false);
      return;
    }

    try {
      let userCredential;
      try {
        // Intentar registrar e iniciar sesión
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInErr: any) {
        // Si el usuario no existe, lo creamos automáticamente
        if (
          signInErr.code === "auth/user-not-found" || 
          signInErr.code === "auth/invalid-credential" || 
          signInErr.code === "auth/invalid-email" || 
          signInErr.message?.includes("credential") || 
          signInErr.message?.includes("user-not-found")
        ) {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
          } catch (signUpErr: any) {
            console.error("Fallo al registrar cuenta nueva en Firebase:", signUpErr);
            throw signInErr; // Lanzar el error inicial si el registro también falla
          }
        } else {
          throw signInErr;
        }
      }

      const user = userCredential.user;
      setCurrentUser({
        uid: user.uid,
        email: user.email,
        displayName: resolvedDisplayName,
        role: determinedRole
      });

      showFirebaseToast(
        "Acceso Autorizado",
        `Has iniciado sesión como ${determinedRole === "admin" ? "ADMINISTRADOR (Acceso Total)" : "VISOR (Restricción de Borrado)"}.`,
        "success"
      );
    } catch (err: any) {
      console.error("Fallo real de Firebase Auth:", err);
      
      let helperErr = "Contraseña incorrecta o error de conexión con Firebase Auth.";
      if (err.code === "auth/wrong-password" || err.message?.includes("password")) {
        helperErr = "La contraseña ingresada no coincide para esta cuenta existente.";
      } else if (err.code === "auth/unauthorized-domain" || err.message?.toLowerCase().includes("domain") || err.message?.toLowerCase().includes("unauthorized")) {
        helperErr = "Dominio no autorizado en Firebase. Si estás desplegando en Vercel, agrega tu URL/dominio de Vercel en la consola de Firebase (Autenticación -> Configuración -> Dominios autorizados).";
      } else {
        helperErr = `Error (${err.code || "auth/error"}): ${err.message || "Fallo de conexión."}`;
      }
      
      setAuthError(helperErr);
      showFirebaseToast(
        "Error de Autenticación",
        helperErr,
        "error"
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogOut = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Error al revocar sesión en Firebase Auth:", err);
      }
    }
    setCurrentUser(null);
    setInvoices([]);
    setMotorizados([]);
    setIncidents([]);
  };

  // Interceptor del cargado de imagen - Redirige al Laboratorio de Filtros primero
  const processImageInput = (imageUrl: string) => {
    setPendingPreprocessingImage(imageUrl);
  };

  // Ejecutor real del llamado a la inteligencia artificial con la imagen ya calibrada
  const executeImageExtraction = async (imageUrl: string) => {
    try {
      setIsScanning(true);
      setScanError(null);
      setIsEditing(true);
      setSelectedInvoiceForView(null);

      // Comprimir con calidad óptima
      const compressed = await compressImage(imageUrl, 850, 1100, 0.7);
      setActiveImage(compressed);

      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressed }),
      });

      if (!response.ok) {
        throw new Error("Problemas al invocar la API AI extractor.");
      }

      const parsedData = await response.json();
      setFormValues({
        issuer: parsedData.issuer || "",
        date: parsedData.date || new Date().toISOString().split("T")[0],
        invoiceNumber: parsedData.invoiceNumber || "",
        total: Number(parsedData.total) || 0,
        tax: Number(parsedData.tax) || 0,
        paymentMethod: parsedData.paymentMethod || "",
        items: Array.isArray(parsedData.items) ? parsedData.items : [],
        imageUrl: compressed,
        userId: "shared_admin",
        createdAt: new Date().toISOString(),

        // Campos Adicionales
        issuerRuc: parsedData.issuerRuc || "",
        issuerAddress: parsedData.issuerAddress || "",
        invoiceType: parsedData.invoiceType || "",
        serial: parsedData.serial || "",
        sucursal: parsedData.sucursal || "",
        ptoFact: parsedData.ptoFact || "",
        receiverName: parsedData.receiverName || "",
        receiverRuc: parsedData.receiverRuc || "",
        receiverType: parsedData.receiverType || "",
        subtotal: parsedData.subtotal || 0,
        itbms: parsedData.itbms || parsedData.tax || 0,
        accessKey: parsedData.accessKey || "",
        qrUrl: parsedData.qrUrl || "",
        seller: parsedData.seller || "",
        comments: parsedData.comments || "",
        motorizadoId: ""
      });

    } catch (err: any) {
      console.error("AI Reader error:", err);
      // Fallback a vaciar/mantener la imagen para poder ser editado
      setScanError("No pudimos extraer todos los datos del ticket de forma automática. El sistema guardó la imagen para que puedas rellenar o ajustar los datos requeridos manualmente.");
      setFormValues({
        issuer: "",
        date: new Date().toISOString().split("T")[0],
        invoiceNumber: "",
        total: 0,
        tax: 0,
        paymentMethod: "Efectivo",
        items: [],
        imageUrl: imageUrl,
        userId: "shared_admin",
        createdAt: new Date().toISOString()
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Drag and Drop Controllers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          processImageInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          processImageInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadDemoManual = () => {
    setActiveImage(DEMO_IMAGE_BASE64);
    setIsEditing(true);
    setSelectedInvoiceForView(null);
    setFormValues({ ...DEMO_EXTRACTION_MOCK });
  };

  // CRUD Invoices
  const handleSaveInvoice = async () => {
    if (!formValues.issuer.trim()) {
      triggerConfirm("Campo Requerido", "El nombre del establecimiento / emisor es obligatorio.", () => {}, "warning");
      return;
    }
    if (!formValues.invoiceType || formValues.invoiceType.trim() === "") {
      triggerConfirm(
        "Tipo de Factura Obligatoria", 
        "Por favor elija el tipo de factura correspondiente: CALL CENTER, SUCURSAL, FLOTA, GERENTE DE LINEA, u OMITIDO.", 
        () => {}, 
        "warning"
      );
      return;
    }
    if (!formValues.motorizadoId || formValues.motorizadoId.trim() === "") {
      triggerConfirm(
        "Motorizado Requerido", 
        "Debe asociar la factura de flete a un chofer o motorizado de la flota.", 
        () => {}, 
        "warning"
      );
      return;
    }

    const payload: Invoice = {
      ...formValues,
      userId: "shared_admin",
      createdAt: formValues.id ? invoices.find(i => i.id === formValues.id)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    setLoadingList(true);
    try {
      if (!isFirebaseConfigured || !db) {
        throw new Error("El servicio de base de datos Firebase no está disponible.");
      }

      if (formValues.id && !formValues.id.startsWith("loc_")) {
        const docRef = doc(db, "invoices", formValues.id);
        const { id, ...cleanData } = payload;
        await updateDoc(docRef, cleanData);
        showFirebaseToast(
          "¡Guardado en Firebase!",
          `La factura #${payload.invoiceNumber || ""} fue actualizada exitosamente en Firebase Cloud Firestore.`,
          "success"
        );
      } else {
        const { id, ...cleanData } = payload;
        await addDoc(collection(db, "invoices"), cleanData);
        showFirebaseToast(
          "¡Guardado en Firebase!",
          `El nuevo ticket #${payload.invoiceNumber || ""} fue transmitido y guardado exitosamente en la base de datos de Firebase.`,
          "success"
        );
      }
      setIsEditing(false);
      setActiveImage(null);
    } catch (err: any) {
      console.error("Error al guardar ticket:", err);
      try {
        handleFirestoreError(err, formValues.id ? OperationType.UPDATE : OperationType.CREATE, `invoices/${formValues.id || 'new'}`);
      } catch (structuredErr: any) {
        console.error("Firestore Structured Error:", structuredErr);
      }
      alert("Error al guardar ticket: " + err.message);
    } finally {
      setLoadingList(false);
    }
  };

  const handleDeleteInvoice = (id: string) => {
    if (currentUser?.role !== "admin") {
      triggerConfirm(
        "Acción Denegada",
        "Los usuarios con rol de Visor no pueden realizar operaciones de eliminación en la base de datos.",
        () => {},
        "warning"
      );
      return;
    }
    triggerConfirm(
      "¿Eliminar copia de flete?",
      "Esta operación borrará permanentemente este registro del historial. Esta acción es irreversible.",
      async () => {
        try {
          if (!isFirebaseConfigured || !db) {
            throw new Error("El servicio de base de datos Firebase no está disponible.");
          }

          await deleteDoc(doc(db, "invoices", id));
          showFirebaseToast(
            "Eliminado de Firebase",
            "La factura de flete fue eliminada permanentemente del servidor Firebase Cloud Firestore.",
            "success"
          );
          setSelectedInvoiceForView(null);
        } catch (err: any) {
          console.error("Error al eliminar ticket:", err);
          try {
            handleFirestoreError(err, OperationType.DELETE, `invoices/${id}`);
          } catch (structuredErr) {
            console.error("Firestore Structured Error:", structuredErr);
          }
        }
      }
    );
  };

  // CRUD Motorizados
  const handleSaveMotorizado = async (motData: Omit<Motorizado, "userId" | "createdAt">, editId?: string) => {
    const payload: Motorizado = {
      ...motData,
      userId: "shared_admin",
      createdAt: new Date().toISOString()
    };

    try {
      if (!isFirebaseConfigured || !db) {
        throw new Error("El servicio de base de datos Firebase no está disponible.");
      }

      if (editId && !editId.startsWith("mot_")) {
        const docRef = doc(db, "motorizados", editId);
        await updateDoc(docRef, { ...motData });
        showFirebaseToast(
          "Conductor Guardado",
          `Los datos de ${motData.name} se han actualizado correctamente en Firebase Cloud Firestore.`,
          "success"
        );
      } else {
        await addDoc(collection(db, "motorizados"), payload);
        showFirebaseToast(
          "Conductor Registrado",
          `El perfil del motorizado ${payload.name} ha sido sincronizado en Firebase Cloud Firestore.`,
          "success"
        );
      }
    } catch (err: any) {
      console.error("Error al guardar motorizado:", err);
      try {
        handleFirestoreError(err, editId ? OperationType.UPDATE : OperationType.CREATE, `motorizados/${editId || 'new'}`);
      } catch (structuredErr) {
        console.error("Firestore Structured Error:", structuredErr);
      }
    }
  };

  const handleDeleteMotorizado = async (id: string) => {
    if (currentUser?.role !== "admin") {
      triggerConfirm(
        "Acción Denegada",
        "Los usuarios con rol de Visor no pueden realizar operaciones de eliminación en la base de datos.",
        () => {},
        "warning"
      );
      return;
    }

    if (invoices.some(i => i.motorizadoId === id)) {
      triggerConfirm(
        "No es posible eliminar",
        "Este motorizado tiene facturas de flete asociadas en el sistema. Desvincúlelo primero de cada factura antes de eliminarlo.",
        () => {},
        "warning"
      );
      return;
    }

    triggerConfirm(
      "¿Desvincular conductor?",
      "¿Está seguro de que desea eliminar permanentemente este registro de motorizado? No se podrán recuperar sus datos de contacto.",
      async () => {
        try {
          if (!isFirebaseConfigured || !db) {
            throw new Error("El servicio de base de datos Firebase no está disponible.");
          }

          await deleteDoc(doc(db, "motorizados", id));
          showFirebaseToast(
            "Conductor Eliminado",
            "El conductor ha sido eliminado permanentemente de Firebase Cloud Firestore.",
            "success"
          );
        } catch (err: any) {
          console.error(err);
        }
      }
    );
  };

  if (!currentUser && !isExecutivePublicShared) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" 
        style={{ backgroundColor: "#5e5e5e" }}
      >
        {/* Pisada de neumatico translucida de fondo (imagen del usuario) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-[0.22] mix-blend-multiply">
          <img 
            src={tireTracksBg} 
            alt="Huellas de neumáticos de fondo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Card Contenedor Principal con Sombra de Tránsito */}
        <div className="w-full max-w-sm bg-zinc-900/95 border border-white/10 rounded-3xl p-6 sm:p-8 relative z-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md animate-fade-in">
          {/* Logo y Encabezado */}
          <div className="text-center space-y-4 mb-6">
            <div className="inline-flex p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner">
              <LogoSVG className="h-12 w-12 text-[#FF9100] drop-shadow-[0_4px_12px_rgba(255,145,0,0.6)]" />
            </div>
            <div>
              <h1 className="text-xl font-display font-black tracking-tight text-white uppercase">MotoAssist Vial</h1>
            </div>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailPasswordLogIn(loginEmail, loginPassword);
            }}
            className="space-y-4"
          >
            {/* Input: Correo Electrónico */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-amber-400 uppercase tracking-wider block pl-1">
                Correo Electrónico Autorizado
              </label>
              <input
                type="email"
                required
                placeholder="usuario@acsa.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-zinc-950/60 text-white rounded-xl px-4 py-2.5 text-xs font-semibold border border-white/10 hover:border-amber-500/70 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-300 outline-none hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] focus:shadow-[0_0_18px_rgba(245,158,11,0.4)] placeholder-slate-500 cursor-text"
              />
            </div>

            {/* Input: Contraseña */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-amber-400 uppercase tracking-wider block pl-1">
                Contraseña de Seguridad
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-zinc-950/60 text-white rounded-xl px-4 py-2.5 text-xs font-semibold border border-white/10 hover:border-amber-500/70 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-300 outline-none hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] focus:shadow-[0_0_18px_rgba(245,158,11,0.4)] placeholder-slate-500 cursor-text"
              />
            </div>

            {/* Error de Autenticación */}
            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-350 rounded-xl text-[10px] flex gap-2 items-start font-bold leading-relaxed">
                <div className="w-1.5 h-1.5 mt-1 bg-rose-500 rounded-full shrink-0 animate-ping" />
                <p>{authError}</p>
              </div>
            )}

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-450 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition duration-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              {authLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                "Acceder a Plataforma"
              )}
            </button>
          </form>

          {/* Separador de Accesos Directos */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-black">
              <span className="bg-zinc-900 px-3 text-slate-400 select-none">Accesos Directos Un-Clic</span>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setLoginEmail("admin@acsa.com");
                showFirebaseToast("Auto-completado", "Correo de Administrador cargado. Por favor, introduzca su contraseña.", "info");
              }}
              className="p-2.5 text-left rounded-xl bg-zinc-950/40 hover:bg-zinc-950/80 border border-white/5 hover:border-amber-500/50 shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <LogoSVG className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-white">Administrador</span>
              </div>
              <p className="text-[8.5px] text-slate-400 font-bold leading-normal">
                Acceso Total. Eliminación habilitada.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginEmail("moto@acsa.com");
                showFirebaseToast("Auto-completado", "Correo de Visor cargado. Por favor, introduzca su contraseña.", "info");
              }}
              className="p-2.5 text-left rounded-xl bg-zinc-950/40 hover:bg-zinc-950/80 border border-white/5 hover:border-amber-500/50 shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-4 w-4 text-slate-400 group-hover:scale-110 group-hover:text-amber-500 transition-all" />
                <span className="text-[10px] font-black text-white">Visor / Moto</span>
              </div>
              <p className="text-[8.5px] text-slate-400 font-bold leading-normal">
                Sin permisos de borrado de histórico.
              </p>
            </button>
          </div>

          {/* Información Adicional Conexión */}
          <div className="mt-5 text-center">
            <span className="px-2.5 py-1 text-[8px] font-extrabold bg-zinc-950/50 border border-white/5 rounded-full uppercase tracking-wider select-none inline-flex items-center gap-1">
              {isFirebaseConfigured ? (
                <>
                  <Database className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400">Base de datos sincronizada</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-2.5 w-2.5 text-amber-500 shrink-0 animate-pulse" />
                  <span className="text-amber-400">Modo Desconectado Activo</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen motorcycle-asphalt-bg flex flex-col font-sans text-slate-100 relative ${mobileOptimized ? "forced-mobile-mode" : ""}`}>
      
      {/* Pisada de neumatico translucida de fondo (imagen del usuario con opacidad del 22%) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-[0.22] mix-blend-multiply" id="tire-watermark">
        <img 
          src={tireTracksBg} 
          alt="Huellas de neumáticos de fondo" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* BARRA ASIDE DE OPERACIONES (Sidemenu Modular) */}
      <div className={`flex flex-col min-h-screen ${mobileOptimized ? "" : "md:flex-row"}`}>
        
        {/* SIDEBAR ADAPTATIVO PREMIUM (Con estilo Glass Asfalto y Ámbar de Tránsito) */}
        {!isExecutivePublicShared && (
          <aside className={`w-full bg-zinc-950/60 backdrop-blur-md text-white flex flex-col shrink-0 border-b border-amber-500/10 shadow-2xl relative z-10 ${
            mobileOptimized ? "" : "md:w-64 md:border-r md:border-b-0"
          }`}>
            <div className="p-6 border-b border-amber-500/10 flex items-center gap-3">
              <div className="p-1.5 bg-amber-500/10 rounded-xl flex items-center justify-center shadow-inner shrink-0 border border-amber-500/20">
                <LogoSVG className="h-10 w-10 text-[#FF9100] drop-shadow-[0_2px_8px_rgba(255,145,0,0.6)] shrink-0" />
              </div>
            <div>
              <h1 className="text-sm font-display font-black tracking-tight text-white leading-none">MotoAssist Vial</h1>
              <p className="text-[9px] text-amber-400 font-extrabold uppercase tracking-widest mt-1.5 leading-none">Monitoreo Vial Activo</p>
            </div>
          </div>

          <nav className={`p-4 gap-1.5 pt-6 flex overflow-x-auto scrollbar-none shrink-0 ${
            mobileOptimized ? "flex-row" : "md:flex-col md:flex-grow md:overflow-x-visible md:space-y-1.5"
          }`}>
            
            {/* Tab Tickets */}
            <button
              onClick={() => { setActiveTab("tickets"); setSelectedInvoiceForView(null); setIsEditing(false); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 sm:py-3 rounded-xl text-xs font-black whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
                activeTab === "tickets" 
                  ? "bg-amber-500/20 text-amber-300 shadow-xl shadow-amber-500/5 scale-[1.02] border border-amber-500/40" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white font-bold"
              }`}
            >
              <Receipt className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "tickets" ? "text-amber-400" : "text-slate-400"}`} />
              <span>Registro de Ventas</span>
            </button>

            {/* Tab Fleet */}
            <button
              onClick={() => { setActiveTab("fleet"); setSelectedInvoiceForView(null); setIsEditing(false); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 sm:py-3 rounded-xl text-xs font-black whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
                activeTab === "fleet" 
                  ? "bg-amber-500/20 text-amber-300 shadow-xl shadow-amber-500/5 scale-[1.02] border border-amber-500/40" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white font-bold"
              }`}
            >
              <Users className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "fleet" ? "text-amber-400" : "text-slate-400"}`} />
              <span>Flota Motorizados</span>
            </button>

            {/* Tab Reports */}
            <button
              onClick={() => { setActiveTab("reports"); setSelectedInvoiceForView(null); setIsEditing(false); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 sm:py-3 rounded-xl text-xs font-black whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
                activeTab === "reports" 
                  ? "bg-amber-500/20 text-amber-300 shadow-xl shadow-amber-500/5 scale-[1.02] border border-amber-500/40" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white font-bold"
              }`}
            >
              <Filter className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "reports" ? "text-amber-400" : "text-slate-400"}`} />
              <span>Reportes & Filtros</span>
            </button>

            {/* Tab Dashboard */}
            <button
              onClick={() => { setActiveTab("dashboard"); setSelectedInvoiceForView(null); setIsEditing(false); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 sm:py-3 rounded-xl text-xs font-black whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
                activeTab === "dashboard" 
                  ? "bg-amber-500/20 text-amber-300 shadow-xl shadow-amber-500/5 scale-[1.02] border border-amber-500/40" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white font-bold"
              }`}
            >
              <BarChart3 className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "dashboard" ? "text-amber-400" : "text-slate-400"}`} />
              <span>Dashboard General</span>
            </button>

            {/* Tab Executive Report */}
            <button
              onClick={() => { setActiveTab("executive"); setSelectedInvoiceForView(null); setIsEditing(false); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 sm:py-3 rounded-xl text-xs font-black whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
                activeTab === "executive" 
                  ? "bg-indigo-500/20 text-indigo-300 shadow-xl shadow-indigo-500/5 scale-[1.02] border border-indigo-500/40" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white font-bold"
              }`}
            >
              <Layers className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "executive" ? "text-indigo-400" : "text-slate-400"}`} />
              <span>Reporte Ejecutivo</span>
            </button>
          </nav>

          {/* SESIÓN USUARIO PIE */}
          <div className={`p-4 border-t border-amber-500/10 bg-zinc-950/70 text-amber-200 ${
            mobileOptimized ? "hidden" : "hidden md:block"
          }`}>
            {isFirebaseConfigured ? (
              currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30 font-black text-xs shadow-md shrink-0">
                      {currentUser.displayName ? currentUser.displayName[0] : "U"}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-black text-white truncate">{currentUser.displayName || currentUser.email}</p>
                      <p className="text-[8px] text-emerald-400 uppercase font-black tracking-wide">Firebase Sincronizado</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogOut}
                    className="w-full py-2 bg-rose-600/85 hover:bg-rose-700 text-[10px] font-black uppercase rounded-xl text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <LogOut className="h-3 w-3" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="text-center p-2.5 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-[9.5px] font-bold text-slate-300 uppercase tracking-widest pl-0.5">Base de Datos Activa</p>
                </div>
              )
            ) : (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-extrabold text-[9px] uppercase leading-none">Firebase Desconectado</p>
                  <p className="text-[8px] text-red-300/80 mt-1">Configure variables de entorno en la consola.</p>
                </div>
              </div>
            )}
          </div>
        </aside>
        )}

        {/* CONTAINER CONTENIDO PRINCIPAL */}
        <main className="flex-grow flex flex-col min-h-screen">
          
          <header className="bg-zinc-900/50 backdrop-blur-md text-white shadow-2xl px-6 py-5 md:px-8 rounded-2xl mb-6 mx-0 sm:mx-4 mt-0 sm:mt-2 border border-white/5">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
                  {isExecutivePublicShared ? (
                    <>
                      <Layers className="h-5 w-5 text-indigo-400 shrink-0" />
                      <span>MotoAssist Vial - Reporte Ejecutivo (Solo Visualización)</span>
                    </>
                  ) : (
                    <>
                      {activeTab === "tickets" && (
                        <>
                          <Receipt className="h-5 w-5 text-amber-500 shrink-0" />
                          <span>Asistencia Vial & Registro de Ventas</span>
                        </>
                      )}
                      {activeTab === "fleet" && (
                        <>
                          <Users className="h-5 w-5 text-amber-500 shrink-0" />
                          <span>Flota de Motorizados</span>
                        </>
                      )}
                      {activeTab === "reports" && (
                        <>
                          <Filter className="h-5 w-5 text-amber-500 shrink-0" />
                          <span>Reportes & Exportación</span>
                        </>
                      )}
                      {activeTab === "dashboard" && (
                        <>
                          <BarChart3 className="h-5 w-5 text-amber-500 shrink-0" />
                          <span>Panel de Monitoreo Vial</span>
                        </>
                      )}
                      {activeTab === "executive" && (
                        <>
                          <Layers className="h-5 w-5 text-indigo-400 shrink-0" />
                          <span>Reporte Ejecutivo de Asistencias</span>
                        </>
                      )}
                    </>
                  )}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {isExecutivePublicShared ? (
                    "Matriz ejecutiva consolidada de medios, sucursales y evolución interanual (Enlace compartido público)"
                  ) : (
                    <>
                      {activeTab === "tickets" && "Almacena copia de ventas de asistencia e instala tus reportes en tiempo real"}
                      {activeTab === "fleet" && "Control de choferes, matrículas, fletes, KPI por motorizado e incidentes de motocicleta"}
                      {activeTab === "reports" && "Filtros inteligentes de impuestos y descargas personalizadas Excel/CSV"}
                      {activeTab === "dashboard" && "Inspección de KPI por sucursal, incidentes activos de motos y flujo temporal"}
                      {activeTab === "executive" && "Matriz ejecutiva consolidada de medios, sucursales y evolución interanual 2025 vs 2026"}
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setMobileOptimized(!mobileOptimized)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 border shadow-lg cursor-pointer ${
                    mobileOptimized 
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold scale-105 shadow-amber-500/20" 
                      : "bg-zinc-950/70 text-amber-400 border-amber-500/20 hover:border-amber-500/50 hover:bg-zinc-900"
                  }`}
                  id="toggle-layout-density"
                  title="Optimiza el espacio de las tarjetas y cuadrículas para evitar elementos amontonados"
                >
                  <Smartphone className="h-4 w-4 shrink-0" />
                  <span>{mobileOptimized ? "Vista Ajustada" : "Ajustar Móvil"}</span>
                </button>

                {(isEditing || selectedInvoiceForView) && activeTab === "tickets" && (
                  <button
                    onClick={() => { setIsEditing(false); setSelectedInvoiceForView(null); }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-black transition border border-white/10 cursor-pointer backdrop-blur-md shadow-xs"
                  >
                    Regresar a la Entrada
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
            
            {/* VIEW MODULES */}
            {activeTab === "dashboard" && (
              <DashboardView invoices={invoices} motorizados={motorizados} incidents={incidents} />
            )}

            {activeTab === "fleet" && (
              <MotorizadosView 
                motorizados={motorizados} 
                invoices={invoices} 
                onSave={handleSaveMotorizado} 
                onDelete={handleDeleteMotorizado}
                incidents={incidents}
                onSaveIncidents={saveIncidents}
                triggerConfirm={triggerConfirm}
                isAdmin={currentUser?.role === "admin"}
              />
            )}

            {activeTab === "reports" && (
              <ReportsView invoices={invoices} motorizados={motorizados} />
            )}

            {activeTab === "executive" && (
              <ExecutiveReportView invoices={invoices} isSharedView={isExecutivePublicShared} />
            )}

            {activeTab === "tickets" && (
              <div className={`grid gap-8 ${mobileOptimized ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"}`}>
                
                {/* COL IZQUIERDA: FORM O AREA DE CARGA */}
                <div className={`${mobileOptimized ? "grid-cols-1" : "lg:col-span-7"} space-y-6`}>
                  
                  {isEditing ? (
                    <TicketEditForm
                      formValues={formValues}
                      setFormValues={setFormValues}
                      motorizados={motorizados}
                      onSave={handleSaveInvoice}
                      onCancel={() => { setIsEditing(false); setActiveImage(null); }}
                      isScanning={isScanning}
                      scanError={scanError}
                      activeImage={activeImage}
                    />
                  ) : selectedInvoiceForView ? (
                    <TicketDetailView
                      invoice={selectedInvoiceForView}
                      motorizados={motorizados}
                      onClose={() => setSelectedInvoiceForView(null)}
                      onEdit={() => {
                        setFormValues({ ...selectedInvoiceForView });
                        setIsEditing(true);
                        setSelectedInvoiceForView(null);
                      }}
                      onDelete={handleDeleteInvoice}
                      isAdmin={currentUser?.role === "admin"}
                    />
                  ) : (
                    /* SCANNER ZONE INPUT */
                    <div className="bg-zinc-950/40 backdrop-blur-md rounded-xl border border-amber-500/10 p-6 md:p-8 shadow-sm space-y-6">
                      <div className="text-center max-w-sm mx-auto space-y-2">
                        <span className="px-3 py-1.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/20 uppercase tracking-wide">
                          Registro de Ventas IA
                        </span>
                        <h3 className="text-base font-black text-white pt-1">Cargar Copia de Venta Instalada</h3>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                          Arrastra la factura instalada por el motorizado, selecciona una foto o activa la cámara web para procesar la copia con Gemini IA y guardarla en tiempo real.
                        </p>
                      </div>

                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition duration-200 flex flex-col items-center justify-center min-h-[220px] ${
                          dragOver 
                            ? "border-amber-500 bg-amber-500/10" 
                            : "border-slate-800 bg-zinc-950/20 hover:bg-zinc-900/40"
                        }`}
                      >
                        <input 
                          type="file" 
                          accept="image/*" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden" 
                        />
                        
                        <div className="rounded-full bg-amber-500/10 p-3.5 shadow-sm border border-amber-500/20 text-amber-400 mb-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-6 w-6" />
                        </div>
                        
                        <p className="text-xs font-bold text-slate-300">Arrastra tu ticket térmico aquí</p>
                        <p className="text-[10px] text-slate-500 mt-1 mb-5">JPEG, PNG, WEBP Soportados</p>
                        
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-1.8 bg-zinc-900 border border-slate-800 text-slate-300 hover:bg-zinc-800 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            Seleccionar Archivo
                          </button>
                          
                          <button
                            onClick={() => setShowCamera(true)}
                            className="flex items-center gap-1.5 px-4 py-1.8 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-450 text-slate-950 rounded-lg text-xs font-black transition shadow-sm cursor-pointer"
                          >
                            <Camera className="h-3.5 w-3.5" />
                            Usar Cámara
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* COL DERECHA: BIBLIOTECA LISTA */}
                <div className={`${mobileOptimized ? "grid-cols-1" : "lg:col-span-5"} space-y-6`}>
                  
                  {invoices.length > 0 && (
                    <div className="bg-zinc-950/40 backdrop-blur-md rounded-xl border border-amber-500/10 p-4.5 shadow-sm space-y-3">
                      <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-0.5">Resumen de Periodo</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/25">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Monto Gasto</span>
                          <span className="text-base font-black font-mono text-amber-300 block mt-1">
                            ${invoices.reduce((a, b) => a + (b.total || 0), 0).toLocaleString("es-PA", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="p-3 bg-zinc-900/60 rounded-lg border border-slate-800">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Comprobantes</span>
                          <span className="text-base font-black font-mono text-white block mt-1">
                            {invoices.length} un.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-zinc-950/40 backdrop-blur-md rounded-xl border border-amber-500/10 p-4.5 shadow-sm space-y-4">
                    <div className="flex flex-col gap-2 border-b border-white/5 pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="font-bold text-slate-200 text-sm">Biblioteca de Tickets</h3>
                          <p className="text-[10px] text-slate-400">Total registrados ({invoices.length})</p>
                        </div>

                        {invoices.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setShowExportFieldsConfig(!showExportFieldsConfig)}
                              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                                showExportFieldsConfig ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-zinc-900 border-slate-800 text-slate-400 hover:bg-zinc-800"
                              }`}
                              title="Editar Campos a Exportar"
                            >
                              <Settings className="h-3.5 w-3.5 shrink-0" />
                              <span className="hidden sm:inline">Columnas</span>
                            </button>
                            <button
                              onClick={() => exportInvoicesToCSV(invoices, motorizados, selectedExportFields)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                              title="Exportar Excel"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                              <span>Descargar Todo</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {showExportFieldsConfig && invoices.length > 0 && (
                        <div className="mt-3 p-3 bg-zinc-900 border border-slate-800 rounded-lg space-y-2 animate-fade-in">
                          <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Configurar Columnas de Exportación ({selectedExportFields.length} seleccionadas)</p>
                          <div className="flex flex-wrap gap-1.5 pb-2">
                            <button
                              type="button"
                              onClick={() => setSelectedExportFields(EXPORT_COLUMNS)}
                              className="px-2 py-0.5 bg-zinc-900 border border-slate-800 hover:bg-zinc-800 text-[8.5px] font-bold text-slate-400 rounded"
                            >
                              Todo
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedExportFields(["Establecimiento", "Tipo Factura", "Nº Ticket/Factura", "Asignado a (Motorizado)", "Total Ticket", "Fecha Emisión"])}
                              className="px-2 py-0.5 bg-zinc-900 border border-slate-800 hover:bg-zinc-800 text-[8.5px] font-bold text-slate-400 rounded"
                            >
                              Básico
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedExportFields([])}
                              className="px-2 py-0.5 bg-zinc-900 border border-slate-800 hover:bg-zinc-800 text-[8.5px] font-bold text-slate-400 rounded"
                            >
                              Limpiar
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                            {EXPORT_COLUMNS.map(col => {
                              const isSel = selectedExportFields.includes(col);
                              return (
                                <label
                                  key={col}
                                  className={`flex items-center gap-1.5 p-1.5 text-[9.5px] rounded border cursor-pointer select-none transition ${
                                    isSel ? "bg-amber-500/10 text-amber-300 border-amber-500/30 font-bold" : "bg-zinc-900 border-slate-850 text-slate-400"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSel}
                                    onChange={() => {
                                      if (isSel) {
                                        setSelectedExportFields(selectedExportFields.filter(f => f !== col));
                                      } else {
                                        setSelectedExportFields([...selectedExportFields, col]);
                                      }
                                    }}
                                    className="rounded text-amber-500 focus:ring-0 scale-75 border-slate-700 bg-zinc-950"
                                  />
                                  <span className="truncate">{col}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {loadingList ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-2">
                        <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                        <p className="text-[10px] text-slate-400 font-bold">Actualizando con Firestore real-time...</p>
                      </div>
                    ) : invoices.length === 0 ? (
                      <div className="text-center py-10 px-4 space-y-3">
                        <div className="rounded-full bg-zinc-900 border border-slate-800 p-3 w-10 h-10 flex items-center justify-center mx-auto text-slate-400">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div className="max-w-xs mx-auto space-y-1">
                          <p className="text-xs font-bold text-slate-300">Sin copias registradas</p>
                          <p className="text-[10.5px] text-slate-400 leading-normal font-semibold">
                            Toma una captura o sube la factura de ventas instaladas por los motorizados para sincronizarlas en tu panel.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {invoices.map((inv) => {
                          const isSelected = selectedInvoiceForView?.id === inv.id;
                          return (
                            <div 
                              key={inv.id}
                              onClick={() => setSelectedInvoiceForView(inv)}
                              className={`p-3 rounded-lg border transition duration-150 cursor-pointer flex items-center justify-between gap-3 text-left ${
                                isSelected 
                                  ? "bg-amber-500/10 border-amber-500/30 shadow-xxs" 
                                  : "bg-zinc-900/40 border-slate-800/40 hover:border-amber-500/20 hover:bg-zinc-900/60"
                              }`}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`rounded-lg p-2 ${
                                  isSelected ? "bg-amber-500/20 text-amber-300" : "bg-zinc-900 text-slate-400 border border-slate-800"
                                }`}>
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-xs font-black text-slate-200 truncate" title={inv.issuer}>{inv.issuer}</p>
                                  <p className="text-[10px] text-slate-450 mt-0.5 font-bold space-x-1">
                                    <span>{inv.date}</span>
                                    <span>•</span>
                                    <span>#{inv.invoiceNumber}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right">
                                  <p className="text-xs font-bold font-mono text-slate-100">${(inv.total || 0).toFixed(2)}</p>
                                  {inv.motorizadoId ? (
                                    <span className="text-[8px] bg-amber-500/10 text-amber-300 font-bold px-1 rounded block mt-0.5 uppercase">flota</span>
                                  ) : (
                                    <span className="text-[8px] text-slate-550 font-bold block mt-0.5">S/Chofer</span>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (inv.imageUrl) {
                                      setOriginalImageInModal(inv.imageUrl);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-amber-500 transition"
                                  title="Ver Factura Original"
                                  disabled={!inv.imageUrl}
                                >
                                  <FolderOpen className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (inv.id) handleDeleteInvoice(inv.id); }}
                                  className="p-1 text-slate-300 hover:text-red-550 transition"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>

        </main>

      </div>

      {showCamera && (
        <CameraCapture 
          onCapture={(base64) => { setShowCamera(false); processImageInput(base64); }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {pendingPreprocessingImage && (
        <ImagePreprocessor
          imageSrc={pendingPreprocessingImage}
          onClose={() => setPendingPreprocessingImage(null)}
          onConfirm={(optimizedBase64) => {
            setPendingPreprocessingImage(null);
            executeImageExtraction(optimizedBase64);
          }}
        />
      )}

      {originalImageInModal && (
        <div 
          className="fixed inset-0 bg-zinc-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setOriginalImageInModal(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-xl w-full p-4 space-y-4 border border-slate-200 shadow-xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="h-4.5 w-4.5 text-blue-600" />
                <span>Factura Original Registrada</span>
              </h3>
              <button 
                onClick={() => setOriginalImageInModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-center max-h-[70vh] overflow-y-auto bg-zinc-50 rounded-lg p-2 border border-slate-200">
              <img 
                src={originalImageInModal} 
                alt="Factura Original" 
                className="max-h-[60vh] object-contain rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-right">
              <button
                onClick={() => setOriginalImageInModal(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-slate-700 text-xs font-bold rounded-lg transition"
              >
                Cerrar Imagen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICACIÓN FLOTANTE DE CONFIRMACIÓN DE OPERACIONES EN FIREBASE/LOCAL */}
      {firebaseNotification?.show && (
        <div 
          className="fixed bottom-6 right-6 z-[110] max-w-sm w-full bg-zinc-950/95 border border-amber-500/30 text-white rounded-xl shadow-2xl p-4 flex gap-3 items-start backdrop-blur-md border-l-4 border-l-amber-500" 
          id="firebase-realtime-toast"
        >
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 shrink-0">
            {firebaseNotification.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-[#FF9100] animate-bounce" />
            ) : firebaseNotification.type === "info" ? (
              <Database className="h-5 w-5 text-blue-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="flex-grow space-y-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono">
                {firebaseNotification.title}
              </span>
              <button 
                onClick={() => setFirebaseNotification(null)}
                className="text-slate-400 hover:text-white transition p-0.5 ml-2 shrink-0 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed font-semibold break-words">
              {firebaseNotification.message}
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[9.5px] text-[#FF9100]/70 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Sincronización Cloud Firebase activa</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN CUSTOM */}
      {confirmState?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md animate-fade-in" id="custom-confirm-modal">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${confirmState.variant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">{confirmState.title}</h3>
            </div>
            <p className="text-slate-650 text-xs font-semibold leading-normal">
              {confirmState.message}
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setConfirmState(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-zinc-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmState.onConfirm}
                className={`px-4 py-2 text-xs font-black text-white rounded-lg transition ${
                  confirmState.variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
