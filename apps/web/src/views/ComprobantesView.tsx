import React, { useState } from 'react'

export interface ReceiptItem {
  id: string
  date: string
  supplier: string
  concept: string
  medium: 'Telegram' | 'PDF'
  amount: string
  category: string
  taxId: string
  lines: Array<{ name: string; qty: number; unitPrice: string; total: string }>
}

export const SAMPLE_RECEIPTS: ReceiptItem[] = [
  {
    id: 'rec-1',
    date: '24 Oct 10:42',
    supplier: 'Lácteos del Centro S.A.',
    concept: '12L Leche + 5kg Café',
    medium: 'Telegram',
    amount: '$1,274.00',
    category: 'Insumos',
    taxId: 'LCE890312-KA1',
    lines: [
      { name: 'Leche entera pasteurizada 1L', qty: 12, unitPrice: '$24.50', total: '$294.00' },
      { name: 'Café de especialidad Veracruz 1kg', qty: 5, unitPrice: '$196.00', total: '$980.00' }
    ]
  },
  {
    id: 'rec-2',
    date: '24 Oct 08:15',
    supplier: 'Comercializadora San Juan',
    concept: 'Vasos kraft 8oz x 500',
    medium: 'PDF',
    amount: '$860.00',
    category: 'Insumos',
    taxId: 'CSJ940215-992',
    lines: [
      { name: 'Vaso térmico biodegradable 8oz', qty: 500, unitPrice: '$1.72', total: '$860.00' }
    ]
  },
  {
    id: 'rec-3',
    date: '23 Oct 19:30',
    supplier: 'Gas Natural del Valle',
    concept: 'Suministro gas ciclo 10',
    medium: 'PDF',
    amount: '$3,420.50',
    category: 'Servicios',
    taxId: 'GNV010101-ABC',
    lines: [
      { name: 'Consumo gas comercial M3', qty: 180, unitPrice: '$19.00', total: '$3,420.50' }
    ]
  },
  {
    id: 'rec-4',
    date: '23 Oct 14:10',
    supplier: 'Frutería El Canario',
    concept: 'Fruta fresca de temporada',
    medium: 'Telegram',
    amount: '$450.00',
    category: 'Insumos',
    taxId: 'FCA820510-12A',
    lines: [
      { name: 'Plátano dominico y fresas', qty: 8, unitPrice: '$56.25', total: '$450.00' }
    ]
  },
  {
    id: 'rec-5',
    date: '20 Oct 11:00',
    supplier: 'Mantenimiento Espresso Pro',
    concept: 'Calibración grupo y filtros',
    medium: 'PDF',
    amount: '$2,100.00',
    category: 'Mantenimiento',
    taxId: 'MEP180703-9X9',
    lines: [
      { name: 'Servicio preventivo máquina 2 grupos', qty: 1, unitPrice: '$2,100.00', total: '$2,100.00' }
    ]
  }
]

interface ComprobantesViewProps {
  receipts?: ReceiptItem[]
}

export const ComprobantesView: React.FC<ComprobantesViewProps> = ({ receipts: propReceipts }) => {
  const allReceipts = propReceipts || SAMPLE_RECEIPTS
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem>(allReceipts[0] || SAMPLE_RECEIPTS[0])
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const categories = ['Todos', 'Insumos', 'Servicios', 'Nómina', 'Mantenimiento']

  const filteredReceipts = allReceipts.filter(r => {
    const matchesCat = activeCategory === 'Todos' || r.category === activeCategory
    const matchesSearch = r.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.concept.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="w-full px-4 lg:px-8 py-8 max-w-[1600px] mx-auto flex flex-col gap-6">
      {/* Header Titular */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 pb-2">
        <div className="flex items-baseline gap-4">
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Comprobantes</h1>
          <span className="text-sm font-mono text-on-surface-variant">
            {filteredReceipts.length} registros auditados en octubre
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-medium">Periodo fiscal</span>
          <div className="bg-surface-container-high px-3 py-1 rounded text-xs font-mono text-on-surface font-semibold">
            Octubre 2024
          </div>
        </div>
      </div>

      {/* Barra de Filtros & Búsqueda */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-surface-container-lowest p-2 rounded-lg shadow-xs border border-outline-variant/20">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-surface-container-highest text-on-surface font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-80">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por proveedor o partida..."
              className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low text-on-surface text-xs rounded outline-none placeholder:text-on-surface-variant/60 focus:bg-surface-container transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid Principal: Tabla a la izquierda (7 Cols) & Detalle a la derecha (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tabla de comprobantes */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-lg shadow-xs overflow-hidden border border-outline-variant/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-medium border-b border-outline-variant/20">
                  <th className="py-2.5 pl-4 pr-2 font-medium">Fecha</th>
                  <th className="py-2.5 px-2 font-medium">Proveedor</th>
                  <th className="py-2.5 px-2 font-medium">Concepto principal</th>
                  <th className="py-2.5 px-2 font-medium">Medio</th>
                  <th className="py-2.5 pr-4 pl-2 font-medium text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                {filteredReceipts.map(receipt => {
                  const isSelected = selectedReceipt.id === receipt.id
                  return (
                    <tr
                      key={receipt.id}
                      onClick={() => setSelectedReceipt(receipt)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-surface-container-high/70 font-medium' 
                          : 'hover:bg-surface-container-low/60'
                      }`}
                    >
                      <td className="py-3 pl-4 pr-2 font-mono whitespace-nowrap text-on-surface-variant">
                        {receipt.date}
                      </td>
                      <td className="py-3 px-2 font-semibold">
                        <div className="truncate max-w-[150px]">{receipt.supplier}</div>
                      </td>
                      <td className="py-3 px-2 text-on-surface-variant">
                        <div className="truncate max-w-[160px]">{receipt.concept}</div>
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                          <span className="material-symbols-outlined text-[13px]">
                            {receipt.medium === 'Telegram' ? 'send' : 'description'}
                          </span>
                          {receipt.medium}
                        </span>
                      </td>
                      <td className="py-3 pr-4 pl-2 text-right font-mono font-semibold whitespace-nowrap">
                        {receipt.amount}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Lateral: Detalle del Comprobante & Ticket Térmico con Sello Stampy */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-lg shadow-xs space-y-6 border border-outline-variant/20 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">Auditoría #024-B</span>
              <h2 className="text-base font-semibold text-on-surface mt-0.5">{selectedReceipt.supplier}</h2>
              <span className="text-xs font-mono text-on-surface-variant">RFC: {selectedReceipt.taxId}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-primary/10 text-primary font-medium border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Auditado OK
            </span>
          </div>

          {/* Tarjeta del Ticket Simulado */}
          <div className="p-4 bg-surface-container-low/40 rounded-lg border border-dashed border-outline-variant/40 space-y-4">
            <div className="flex items-center justify-between text-xs text-on-surface-variant pb-2 border-b border-outline-variant/20">
              <span>Capturado vía {selectedReceipt.medium}</span>
              <span className="font-mono">{selectedReceipt.date}</span>
            </div>

            {/* Lista de Partidas */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-on-surface text-[11px] uppercase tracking-wider">Desglose de Partidas</span>
              <div className="space-y-2">
                {selectedReceipt.lines.map((line, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-medium text-on-surface">{line.name}</div>
                      <div className="text-[11px] font-mono text-on-surface-variant">{line.qty}x a {line.unitPrice}</div>
                    </div>
                    <span className="font-mono font-semibold text-on-surface">{line.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-on-surface">Total Liquidado</span>
              <span className="text-xl font-mono font-bold text-primary">{selectedReceipt.amount}</span>
            </div>
          </div>

          {/* Botones de acción del panel */}
          <div className="flex items-center gap-3 pt-2">
            <button className="flex-1 py-2 px-3 rounded bg-primary hover:bg-primary-container text-on-primary text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs">
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Descargar Comprobante</span>
            </button>
            <button className="py-2 px-3 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-outline-variant/30">
              <span className="material-symbols-outlined text-[16px]">call_split</span>
              <span>Splitter 50/30</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
