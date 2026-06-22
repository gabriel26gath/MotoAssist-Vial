import React, { useState } from "react";
import { 
  Filter, 
  Calendar, 
  Download, 
  RefreshCw, 
  Search, 
  Receipt,
  Layers,
  ChevronRight,
  Calculator,
  MapPin,
  FolderOpen,
  Coins,
  DollarSign
} from "lucide-react";
import { Invoice, Motorizado } from "../types";
import { exportInvoicesToCSV } from "../utils/csvExport";

interface ReportsViewProps {
  invoices: Invoice[];
  motorizados: Motorizado[];
}

export default function ReportsView({ invoices, motorizados }: ReportsViewProps) {
  // Estados para filtros
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMotorizado, setSelectedMotorizado] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [searchIssuer, setSearchIssuer] = useState("");

  // Todos los encabezados disponibles
  const allHeaders = [
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

  const [selectedFields, setSelectedFields] = useState<string[]>(allHeaders);
  const [showFieldsConfig, setShowFieldsConfig] = useState(false);

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedMotorizado("all");
    setSelectedPayment("all");
    setSearchIssuer("");
  };

  // Filtrar facturas de forma dinámica
  const filteredInvoices = invoices.filter((inv) => {
    // Rango de fechas
    if (startDate && inv.date && inv.date < startDate) return false;
    if (endDate && inv.date && inv.date > endDate) return false;

    // Asignación de motorizado
    if (selectedMotorizado !== "all") {
      if (selectedMotorizado === "none") {
        if (inv.motorizadoId && inv.motorizadoId !== "") return false;
      } else {
        if (inv.motorizadoId !== selectedMotorizado) return false;
      }
    }

    // Método de pago
    if (selectedPayment !== "all") {
      const pm = (inv.paymentMethod || "").toLowerCase();
      const selPm = selectedPayment.toLowerCase();
      // Búsqueda simple por substring
      if (!pm.includes(selPm)) return false;
    }

    // Buscador emisor
    if (searchIssuer.trim()) {
      const issuer = (inv.issuer || "").toLowerCase();
      if (!issuer.includes(searchIssuer.toLowerCase())) return false;
    }

    return true;
  });

  // Métricas del subconjunto filtrado
  const filteredTotal = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const filteredTax = filteredInvoices.reduce((sum, inv) => sum + (inv.tax || 0), 0);
  const filteredSubtotal = filteredTotal - filteredTax;

  // Agrupar ventas y asistencias por sucursal
  interface SucursalStats {
    name: string;
    ventasTotal: number;
    ventasCount: number;
    asistenciasCount: number;
  }

  const sucursalStatsMap: { [key: string]: SucursalStats } = {};

  filteredInvoices.forEach(inv => {
    const rawBranch = inv.sucursal && inv.sucursal.trim() !== "" ? inv.sucursal.trim() : "Principal / Matriz";
    
    if (!sucursalStatsMap[rawBranch]) {
      sucursalStatsMap[rawBranch] = {
        name: rawBranch,
        ventasTotal: 0,
        ventasCount: 0,
        asistenciasCount: 0,
      };
    }

    const stats = sucursalStatsMap[rawBranch];
    stats.ventasTotal += inv.total || 0;
    stats.ventasCount += 1;

    // Verificar si es asistencia vial bat
    const isAsisComments = inv.comments?.toLowerCase().includes("asistencia vial bat");
    const isAsisItems = inv.items?.some(item => 
      item.name?.toLowerCase().includes("asistencia vial bat")
    );
    if (isAsisComments || isAsisItems) {
      stats.asistenciasCount += 1;
    }
  });

  const sucursalStatsList = Object.values(sucursalStatsMap).sort((a, b) => b.ventasTotal - a.ventasTotal);

  // Obtener todos los tipos de factura únicos presentes
  const allInvoiceTypes = Array.from(
    new Set(
      filteredInvoices.map(inv => inv.invoiceType && inv.invoiceType.trim() !== "" ? inv.invoiceType.trim() : "Otros / Sin Especificar")
    )
  ).sort();

  // Obtener todas las sucursales únicas presentes
  const allSucursalesList = Array.from(
    new Set(
      filteredInvoices.map(inv => inv.sucursal && inv.sucursal.trim() !== "" ? inv.sucursal.trim() : "Principal / Matriz")
    )
  ).sort();

  // Calcular la relación matricial: sucursal -> { [tipoFactura]: count }
  const matrixStats: { [sucursal: string]: { [tipoFactura: string]: number } } = {};
  
  // Totales por tipo de factura (para mostrar una fila de resumen / barra de distribución)
  const totalByInvoiceType: { [tipoFactura: string]: number } = {};

  allSucursalesList.forEach(suc => {
    matrixStats[suc] = {};
    allInvoiceTypes.forEach(t => {
      matrixStats[suc][t] = 0;
    });
  });

  filteredInvoices.forEach(inv => {
    const rawBranch = inv.sucursal && inv.sucursal.trim() !== "" ? inv.sucursal.trim() : "Principal / Matriz";
    const type = inv.invoiceType && inv.invoiceType.trim() !== "" ? inv.invoiceType.trim() : "Otros / Sin Especificar";

    if (matrixStats[rawBranch]) {
      matrixStats[rawBranch][type] = (matrixStats[rawBranch][type] || 0) + 1;
    }
    totalByInvoiceType[type] = (totalByInvoiceType[type] || 0) + 1;
  });

  const getMotorizadoName = (id?: string) => {
    if (!id) return "Sin asignar";
    const mot = motorizados.find(m => m.id === id);
    return mot ? mot.name : "Sin asignar";
  };

  const handleExportFiltered = () => {
    if (filteredInvoices.length === 0) {
      return;
    }
    // Exportar con los campos que el usuario editó o seleccionó
    exportInvoicesToCSV(filteredInvoices, motorizados, selectedFields);
  };

  return (
    <div id="reports-module-view" className="space-y-6 animate-fade-in text-white pb-12">
      {/* PANEL DE CONFIGURACIÓN DE FILTROS */}
      <div className="glass-card rounded-2xl p-5.5 shadow-2xl space-y-4">
        <div>
          <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">Filtros Avanzados del Reporte de Ventas</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">Restringe las copias de ventas para exportar o auditar sus valores de instalaciones</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Desde */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3 text-amber-400" />
              Desde Fecha
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-zinc-950/60 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-white cursor-pointer"
            />
          </div>

          {/* Hasta */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3 text-amber-400" />
              Hasta Fecha
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-zinc-950/60 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-white cursor-pointer"
            />
          </div>

          {/* Motorizado */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Asignación Chofer</label>
            <select
              value={selectedMotorizado}
              onChange={(e) => setSelectedMotorizado(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-zinc-950/60 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-white cursor-pointer"
            >
              <option className="bg-zinc-950 text-white" value="all">Ver Todos</option>
              <option className="bg-zinc-950 text-white" value="none">Sin Motorizado</option>
              {motorizados.map(m => (
                <option className="bg-zinc-950 text-white" key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Forma de pago */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Método de Pago</label>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-zinc-950/60 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-white cursor-pointer"
            >
              <option className="bg-zinc-950 text-white" value="all">Ver Todos</option>
              <option className="bg-zinc-950 text-white" value="pago contra entrega">Contrareembolso / Brisas</option>
              <option className="bg-zinc-950 text-white" value="efectivo">Efectivo</option>
              <option className="bg-zinc-950 text-white" value="tarjeta">Tarjeta</option>
            </select>
          </div>

          {/* Buscador de comercio */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Comercio / Emisor</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por comercio..."
                value={searchIssuer}
                onChange={(e) => setSearchIssuer(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-zinc-950/60 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-white placeholder-slate-550"
              />
              <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-black text-slate-200">Editar Campos del Reporte a Exportar ({selectedFields.length} Selección)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowFieldsConfig(!showFieldsConfig)}
              className="text-[11px] font-black text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              {showFieldsConfig ? "Ocultar Columnas" : "Personalizar Columnas o Campos"}
            </button>
          </div>

          {showFieldsConfig && (
            <div className="space-y-3 pt-2.5 border-t border-white/5">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFields(allHeaders)}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-300 rounded font-black cursor-pointer transition shadow-xxs"
                >
                  Seleccionar Todo
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFields(["Establecimiento", "Nº Ticket/Factura", "Total Ticket", "Fecha Emisión"])}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-300 rounded font-black cursor-pointer transition shadow-xxs"
                >
                  Básico (Mínimo)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFields([])}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-300 rounded font-black cursor-pointer transition shadow-xxs"
                >
                  Limpiar Todo
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 text-[10.5px] font-bold text-slate-300 font-mono">
                {allHeaders.map((field) => {
                  const isChecked = selectedFields.includes(field);
                  return (
                    <label 
                      key={field} 
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition ${
                        isChecked 
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300" 
                          : "bg-zinc-950 border-white/5 hover:bg-white/5 text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedFields(selectedFields.filter(f => f !== field));
                          } else {
                            setSelectedFields([...selectedFields, field]);
                          }
                        }}
                        className="rounded border-white/10 text-amber-500 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer bg-zinc-950"
                      />
                      <span className="truncate">{field}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs font-bold text-slate-300 transition cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Limpiar Filtros
          </button>
          <button
            type="button"
            onClick={handleExportFiltered}
            disabled={filteredInvoices.length === 0}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-white rounded-md text-xs font-bold transition cursor-pointer ${
              filteredInvoices.length === 0 
                ? "bg-white/5 cursor-not-allowed opacity-40 text-slate-500 border border-white/5" 
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            Exportar Filtrados (.CSV)
          </button>
        </div>
      </div>

      {/* METRICAS DEL RESUMEN FILTRADO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Venta Filtrado */}
        <div className="glass-card p-5 rounded-2xl shadow-2xl flex items-center justify-between hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:border-amber-500/40 hover:bg-zinc-900/50 transition-all duration-300 cursor-pointer group border border-white/5">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Monto Filtrado de Ventas</span>
            <p className="text-xl font-black font-mono text-[#FFB300] mt-0.5">${filteredTotal.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-400 mt-1">{filteredInvoices.length} copias registradas</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-300 rounded-xl shrink-0 border border-amber-500/20 group-hover:scale-110 group-hover:text-amber-200 transition-all duration-300">
            <DollarSign className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Subtotal Gasto Filtrado */}
        <div className="glass-card p-5 rounded-2xl shadow-2xl flex items-center justify-between hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:border-amber-500/40 hover:bg-zinc-900/50 transition-all duration-300 cursor-pointer group border border-white/5">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Base Gravable (Subtotal)</span>
            <p className="text-xl font-black font-mono text-white mt-0.5">${filteredSubtotal.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-400 mt-1">Excluye impuestos ITBMS</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-300 rounded-xl shrink-0 border border-amber-500/20 group-hover:scale-110 group-hover:text-amber-200 transition-all duration-300">
            <Receipt className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Total ITBMS Filtrado */}
        <div className="glass-card p-5 rounded-2xl shadow-2xl flex items-center justify-between hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:border-amber-500/40 hover:bg-zinc-900/50 transition-all duration-300 cursor-pointer group border border-white/5">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Impuestos Acumulados (ITBMS)</span>
            <p className="text-xl font-black font-mono text-amber-500 mt-0.5">${filteredTax.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-400 mt-1">Impuestos de venta estimados</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-300 rounded-xl shrink-0 border border-amber-500/20 group-hover:scale-110 group-hover:text-amber-200 transition-all duration-300">
            <Coins className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* SECTOR DASHBOARD: CANTIDAD DE TICKET POR SUCURSAL Y TIPO DE FACTURA */}
      <div className="glass-card p-5.5 rounded-2xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
            <div>
              <h4 className="font-black text-white text-xs uppercase tracking-wider font-display">KPI: Tipos de Facturación por Sucursal</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Distribución de cantidad de tickets según tipo de comprobante y punto de venta</p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 text-[10px] bg-amber-500/15 text-amber-300 font-mono font-bold rounded-lg border border-amber-500/20 shadow-xs">
            {allInvoiceTypes.length} Categorías de Comprobante
          </span>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400 font-bold bg-zinc-950/20 rounded-xl border border-white/5">
            Sin datos para generar la distribución matricial de sucursales.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 shadow-inner bg-zinc-950/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950/70 border-b border-white/10 text-[10px] uppercase font-black text-slate-300 tracking-wider">
                  <th className="p-3">Sucursal / Punto de Emisión</th>
                  {allInvoiceTypes.map(type => (
                    <th key={type} className="p-3 text-center whitespace-nowrap min-w-[150px]">
                      <div className="flex items-center justify-center gap-1">
                        <FolderOpen className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>{type}</span>
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-center font-black text-amber-400 whitespace-nowrap">Total Tickets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold text-slate-200">
                {allSucursalesList.map(sucName => {
                  const sStats = sucursalStatsMap[sucName];
                  const totalForThisBranch = allInvoiceTypes.reduce((sum, t) => sum + (matrixStats[sucName]?.[t] || 0), 0);
                  return (
                    <tr key={sucName} className="hover:bg-amber-500/10 transition">
                      <td className="p-3 font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                        <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>{sucName}</span>
                      </td>
                      {allInvoiceTypes.map(type => {
                        const count = matrixStats[sucName]?.[type] || 0;
                        return (
                          <td key={type} className="p-3 text-center font-mono">
                            {count > 0 ? (
                              <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-[#FFB300] text-[11px] font-black rounded-full shadow-xxs">
                                <span>{count}</span>
                                <span className="text-[9px] text-slate-400 font-normal">({((count / totalForThisBranch) * 100).toFixed(0)}%)</span>
                              </div>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center font-mono font-black text-white bg-zinc-950/20">
                        {totalForThisBranch} tkt
                      </td>
                    </tr>
                  );
                })}
                {/* FILA DE RESUMEN ACUMULADO */}
                <tr className="bg-zinc-950/60 font-black border-t-2 border-white/15 text-slate-200">
                  <td className="p-3 text-xs uppercase text-amber-400">Total Acumulado</td>
                  {allInvoiceTypes.map(type => {
                    const totalType = totalByInvoiceType[type] || 0;
                    return (
                      <td key={type} className="p-3 text-center font-mono text-xs text-white">
                        {totalType > 0 ? (
                          <div className="inline-flex flex-col items-center">
                            <span>{totalType} tkt</span>
                            <span className="text-[9px] text-slate-400 font-normal">({((totalType / filteredInvoices.length) * 100).toFixed(1)}%)</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-3 text-center font-mono text-xs text-amber-400 bg-zinc-950/40">
                    {filteredInvoices.length} tkt
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        {/* VENTAS Y ASISTENCIAS POR SUCURSAL */}
        <div className="lg:col-span-5 glass-card p-5.5 rounded-2xl shadow-2xl space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-400 animate-pulse" />
            <h4 className="font-black text-white text-xs uppercase tracking-wider font-display">Ventas y Asistencias por Sucursal</h4>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Distribución acumulada de facturación (Ventas) y asistencias viales del conductor (BAT) por sucursal:</p>

          <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
            {sucursalStatsList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-bold">No hay transacciones registradas para este periodo.</p>
            ) : (
              sucursalStatsList.map((suc) => (
                <div key={suc.name} className="bg-zinc-950/30 p-3 rounded-xl border border-white/10 shadow-inner space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs truncate max-w-[170px] flex items-center gap-1.5" title={suc.name}>
                      <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                      <span>{suc.name}</span>
                    </span>
                    <span className="font-mono text-xs font-black text-amber-400">
                      ${suc.ventasTotal.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-white/5 pt-1.5 font-sans">
                    <div>
                      <span>Facturas / Ventas: </span>
                      <strong className="text-white font-mono">{suc.ventasCount}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Asistencias Vial: </span>
                      <strong className="text-emerald-400 font-mono">{suc.asistenciasCount}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TABLA DE TICKET DETALLES FILTRADOS */}
        <div className="lg:col-span-7 glass-card p-5.5 rounded-2xl shadow-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">Bitácora de Ventas Filtradas</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">Historial directo de copias que cumplen con los filtros ({filteredInvoices.length})</p>
          </div>

          <div className="border border-white/10 rounded-xl overflow-hidden flex-grow max-h-[280px] overflow-y-auto bg-zinc-950/40">
            {filteredInvoices.length === 0 ? (
              <div className="p-10 text-center text-xs font-bold text-slate-400">Sin copias de ventas que coincidan con los filtros colocados.</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-white/10 text-[10px] uppercase font-black text-slate-300 tracking-wider">
                    <th className="p-2.5">Comercio</th>
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Chofer</th>
                    <th className="p-2.5 text-right font-black">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-slate-200">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-amber-500/10 transition">
                      <td className="p-2.5">
                        <p className="truncate max-w-[120px] font-bold text-white text-[11px]" title={inv.issuer}>{inv.issuer}</p>
                        <p className="text-[9px] text-slate-400 font-mono">#{inv.invoiceNumber}</p>
                      </td>
                      <td className="p-2.5 text-[10px] text-slate-300 whitespace-nowrap">{inv.date}</td>
                      <td className="p-2.5 text-[10px] text-slate-400 whitespace-nowrap truncate max-w-[90px]">{getMotorizadoName(inv.motorizadoId)}</td>
                      <td className="p-2.5 font-mono text-right text-emerald-400 font-bold">${(inv.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
