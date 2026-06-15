import React, { useState } from "react";
import { 
  Edit3, 
  Trash2, 
  Plus, 
  Calendar, 
  CreditCard, 
  Layers, 
  FileText, 
  Users, 
  Percent, 
  HelpCircle,
  MapPin,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { Invoice, InvoiceItem, Motorizado } from "../types";

interface TicketEditFormProps {
  formValues: Invoice;
  setFormValues: React.Dispatch<React.SetStateAction<Invoice>>;
  motorizados: Motorizado[];
  onSave: () => Promise<void>;
  onCancel: () => void;
  isScanning: boolean;
  scanError: string | null;
  activeImage: string | null;
}

export default function TicketEditForm({
  formValues,
  setFormValues,
  motorizados,
  onSave,
  onCancel,
  isScanning,
  scanError,
  activeImage
}: TicketEditFormProps) {

  // Controladores de ítems de productos
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      name: "",
      quantity: 1,
      price: 0,
      total: 0
    };
    setFormValues(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormValues(prev => {
      const updated = [...(prev.items || [])];
      updated.splice(index, 1);
      
      // Recalcular el total y subtotal tras remover
      const newTotal = updated.reduce((sum, item) => sum + (item.total || 0), 0);
      return {
        ...prev,
        items: updated,
        total: Number(newTotal.toFixed(2))
      };
    });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setFormValues(prev => {
      const updated = [...(prev.items || [])];
      const item = { ...updated[index] };

      if (field === "name") {
        item.name = value;
      } else if (field === "quantity") {
        item.quantity = Number(value) || 0;
        item.total = Number((item.quantity * item.price).toFixed(2));
      } else if (field === "price") {
        item.price = Number(value) || 0;
        item.total = Number((item.quantity * item.price).toFixed(2));
      }

      updated[index] = item;
      
      // Re-sumar toda la factura
      const newTotal = updated.reduce((sum, current) => sum + (current.total || 0), 0);
      
      return {
        ...prev,
        items: updated,
        total: Number(newTotal.toFixed(2)),
        subtotal: Number((newTotal - (prev.tax || 0)).toFixed(2))
      };
    });
  };

  const handleTotalChange = (val: number) => {
    setFormValues(prev => ({
      ...prev,
      total: val,
      subtotal: Number((val - (prev.tax || 0)).toFixed(2))
    }));
  };

  const handleTaxChange = (val: number) => {
    setFormValues(prev => ({
      ...prev,
      tax: val,
      itbms: val,
      subtotal: Number(((prev.total || 0) - val).toFixed(2))
    }));
  };

  return (
    <div className="bg-slate-950/40 backdrop-blur-md rounded-xl border border-amber-500/10 p-5 shadow-sm space-y-6 text-slate-100">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-display">
            <Edit3 className="h-4.5 w-4.5 text-amber-400" />
            Editor Completo de Comprobante Térmico
          </h2>
          <p className="text-[11px] text-slate-400">Revisa, completa y audita todos los campos detectados</p>
        </div>
        <button 
          onClick={onCancel}
          className="p-1 px-3 text-[10px] bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-full transition font-semibold"
        >
          Cancelar
        </button>
      </div>

      {isScanning && (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/60 rounded-xl border border-amber-500/10 text-center space-y-3">
          <div className="relative">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200 font-display">Gemini IA analizando ticket...</p>
            <p className="text-[11px] text-slate-450 mt-1 max-w-xs mx-auto">Reconociendo estructuración, desgloses, importes, CUFE y sucursales del ticket físico...</p>
          </div>
        </div>
      )}

      {scanError && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-300 text-xs font-bold flex gap-2 items-center">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{scanError}</span>
        </div>
      )}

      {!isScanning && (
        <div className="space-y-6">
          {activeImage && (
            <div className="flex items-center gap-3.5 p-2.5 bg-slate-900/50 border border-slate-800 rounded-lg">
              <img src={activeImage} alt="Miniatura" className="w-10 h-12 object-cover rounded border border-slate-700 bg-slate-950 shadow-xs" referrerPolicy="no-referrer" />
              <div>
                <p className="text-xs font-bold text-slate-200">Digitalización de Imagen Lista</p>
                <p className="text-[10px] text-slate-400">La IA procesó este ticket. Edita libremente cualquier campo.</p>
              </div>
            </div>
          )}

          {/* CAMPOS EMISOR */}
          <div className="space-y-3 p-3.5 bg-slate-900/40 rounded-xl border border-white/5">
            <h3 className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">Datos del Comercio (Emisor)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Establecimiento / Razón Social</label>
                <input
                  type="text"
                  value={formValues.issuer}
                  onChange={(e) => setFormValues(p => ({ ...p, issuer: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-bold text-slate-100"
                  placeholder="Ej. AUTO CENTRO, S.A."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">R.U.C. Emisor</label>
                <input
                  type="text"
                  value={formValues.issuerRuc || ""}
                  onChange={(e) => setFormValues(p => ({ ...p, issuerRuc: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-slate-200"
                  placeholder="Ej. 149204-1-659102"
                />
              </div>

              <div className="space-y-1 md:col-span-3">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Dirección de Sucursal</label>
                <input
                  type="text"
                  value={formValues.issuerAddress || ""}
                  onChange={(e) => setFormValues(p => ({ ...p, issuerAddress: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-slate-200"
                  placeholder="Ej. Panama Brisas del Golf, Av. Principal"
                />
              </div>
            </div>
          </div>

          {/* CAMPOS DOCUMENTO */}
          <div className="space-y-3 p-3.5 bg-slate-900/40 rounded-xl border border-white/5">
            <h3 className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">Parámetros del Documento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" />
                  Fecha de Ticket
                </label>
                <input
                  type="date"
                  value={formValues.date}
                  onChange={(e) => setFormValues(p => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-bold text-white [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Nº Factura / Documento</label>
                <input
                  type="text"
                  value={formValues.invoiceNumber}
                  onChange={(e) => setFormValues(p => ({ ...p, invoiceNumber: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-bold text-slate-100"
                  placeholder="Ej. T-90412"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Nº de Serie / Consecutivo</label>
                <input
                  type="text"
                  value={formValues.serial || ""}
                  onChange={(e) => setFormValues(p => ({ ...p, serial: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-slate-200"
                  placeholder="Ej. SEC12204"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Nº de Sucursal</label>
                <input
                  type="text"
                  value={formValues.sucursal || ""}
                  onChange={(e) => setFormValues(p => ({ ...p, sucursal: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-slate-200"
                  placeholder="Ej. 0001 (Brisas)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Punto Facturación (Caja)</label>
                <input
                  type="text"
                  value={formValues.ptoFact || ""}
                  onChange={(e) => setFormValues(p => ({ ...p, ptoFact: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-slate-200"
                  placeholder="Ej. 02"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5 text-amber-550" />
                  Método de Pago
                </label>
                <input
                  type="text"
                  value={formValues.paymentMethod}
                  onChange={(e) => setFormValues(p => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-slate-200"
                  placeholder="Ej. Pago Contra Entrega / Tarjetas"
                />
              </div>
            </div>
          </div>

          {/* CAMPOS RECEPTOR */}
          <div className="space-y-3 p-3.5 bg-slate-900/40 rounded-xl border border-white/5">
            <h3 className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">Comercializador y Comprador (Receptor)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase">Nombre del Cliente (Receptor)</label>
                <input
                  type="text"
                  value={formValues.receiverName || ""}
                  onChange={(e) => setFormValues(p => ({ ...p, receiverName: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-slate-200"
                  placeholder="Ej. Distribuidora Brisas"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase">RUC / CIP Cliente</label>
                <input
                  type="text"
                  value={formValues.receiverRuc || ""}
                  onChange={(e) => setFormValues(p => ({ ...p, receiverRuc: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-slate-200"
                  placeholder="Ej. 8-NT-9201"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase">Vendedor (Atendido por)</label>
                <input
                  type="text"
                  value={formValues.seller || ""}
                  onChange={(e) => setFormValues(p => ({ ...p, seller: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold text-slate-200"
                  placeholder="Ej. VICTOR CRUZ"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase">Tipo de Factura <span className="text-amber-400 font-extrabold">* Obligatorio</span></label>
                <select
                  value={formValues.invoiceType || ""}
                  onChange={(e) => setFormValues(p => ({ ...p, invoiceType: e.target.value }))}
                  className="w-full px-3 py-1.8 text-xs bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-lg focus:outline-none font-bold text-white [color-scheme:dark]"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="CALL CENTER">CALL CENTER</option>
                  <option value="SUCURSAL">SUCURSAL</option>
                  <option value="FLOTA">FLOTA</option>
                  <option value="GERENTE DE LINEA">GERENTE DE LINEA</option>
                  <option value="OMITIDO">OMITIDO</option>
                </select>
              </div>
            </div>
          </div>

          {/* OPERATIVO / FLOTA Y COMENTARIOS */}
          <div className="space-y-3 p-3.5 bg-slate-900/40 rounded-xl border border-white/5">
            <h3 className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">Asignación Operativa de la Flota</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-amber-400" />
                  Asociar a (Motorizado) <span className="text-amber-400 font-extrabold">* Obligatorio</span>
                </label>
                <select
                  value={formValues.motorizadoId || ""}
                  onChange={(e) => setFormValues(p => ({ ...p, motorizadoId: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-lg focus:outline-none font-bold text-white [color-scheme:dark]"
                >
                  <option value="">-- Seleccionar Motorizado --</option>
                  {motorizados.map(m => (
                    <option key={m.id} value={m.id}>{m.name} [{m.vehiclePlate}]</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase">Lugar de flete / Comentarios</label>
                <input
                  type="text"
                  value={formValues.comments || ""}
                  onChange={(e) => setFormValues(p => ({ ...p, comments: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold"
                  placeholder="Ej. Domicilio Brisas del Golf, calle principal"
                />
              </div>
            </div>
          </div>

          {/* DESGLOSE ARTÍCULOS */}
          <div className="border bg-slate-900/20 p-4.5 rounded-xl border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-450">
                <Layers className="h-4 w-4 text-slate-400" />
                <span>Desglose Físico de Artículos</span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-amber-300 hover:text-amber-250 bg-slate-900 border border-slate-800 hover:bg-slate-800 px-2.5 py-1 rounded-md transition cursor-pointer"
              >
                + Añadir Item
              </button>
            </div>

            {(!formValues.items || formValues.items.length === 0) ? (
              <div className="text-center p-6 bg-slate-955 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                Sin artículos. Añade uno con el botón superior.
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 select-text">
                {formValues.items.map((item, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-850 shadow-xxs">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      className="flex-grow min-w-[120px] px-2 py-1 text-xs border border-slate-800 bg-slate-950 text-slate-100 rounded font-semibold focus:outline-none focus:border-amber-500/60"
                      placeholder="Producto o Servicio"
                    />
                    <div className="w-16">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="w-full px-2 py-1 text-xs text-center border border-slate-800 bg-slate-950 text-slate-100 rounded font-semibold focus:outline-none focus:border-amber-500/60"
                        title="Cantidad"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, "price", e.target.value)}
                        className="w-full px-2 py-1 text-xs text-center border border-slate-800 bg-slate-950 text-slate-100 rounded font-semibold focus:outline-none focus:border-amber-500/60"
                        title="Precio"
                      />
                    </div>
                    <div className="w-20 font-mono text-xs font-bold text-amber-300 text-right pr-2">
                      ${(item.total || 0).toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 hover:bg-rose-950/45 text-slate-500 hover:text-rose-450 rounded transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TOTALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-850 pt-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">Impuestos (ITBMS / IVA 7% - 10%) ($)</label>
              <input
                type="number"
                step="0.01"
                value={formValues.tax}
                onChange={(e) => handleTaxChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">Total de Factura ($)</label>
              <input
                type="number"
                step="0.01"
                value={formValues.total}
                onChange={(e) => handleTotalChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-amber-500/10 border border-amber-500/30 rounded-lg focus:outline-none focus:border-amber-500/60 font-black text-amber-300 font-mono"
              />
            </div>
          </div>

          {/* CLAVE DE ACCESO FACTURACIÓN ELECTRÓNICA */}
          <div className="space-y-1.5 p-3.5 bg-slate-900/40 rounded-xl border border-white/5">
            <label className="text-[10px] font-bold font-mono text-slate-450 uppercase">CUFE / Clave Acceso Electrónica Autorizada</label>
            <input
              type="text"
              value={formValues.accessKey || ""}
              onChange={(e) => setFormValues(p => ({ ...p, accessKey: e.target.value }))}
              className="w-full px-3 py-1.5 text-[10px] font-mono bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/60 font-semibold"
              placeholder="Ej. 149204A2-92104-FE-2026-9210492104..."
            />
          </div>

          {/* ACCIÓN BOTONES */}
          <div className="flex gap-3 pt-4 border-t border-slate-850">
            <button
              onClick={onSave}
              className="flex-1 py-2.8 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-black text-xs transition cursor-pointer"
            >
              Guardar en Base de Datos Real-Time
            </button>
            <button
              onClick={onCancel}
              className="px-5 py-2.8 bg-slate-900 hover:bg-slate-805 text-slate-400 border border-slate-800 rounded-lg font-bold text-xs transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
