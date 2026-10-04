import React, { useState } from 'react'

export interface ActivityItem {
  id: number | string
  supplier: string
  desc: string
  date: string
  amount: string
  status: string
  isWarning?: boolean
}

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 1,
    supplier: 'Lácteos del Centro',
    desc: 'Insumos lácteos y barista',
    date: 'Hoy, 10:14',
    amount: '$1,274.00',
    status: 'Auditado'
  },
  {
    id: 2,
    supplier: 'CFE Suministrador',
    desc: 'Servicio eléctrico sucursal',
    date: 'Ayer, 18:20',
    amount: '$3,420.00',
    status: 'Auditado'
  },
  {
    id: 3,
    supplier: 'Compras de fruta',
    desc: 'Mercado central abastecimiento',
    date: '24 oct',
    amount: '$350.00',
    status: 'Auditado'
  },
  {
    id: 4,
    supplier: 'Empaques Bio',
    desc: 'Vasos y cubiertos compostables',
    date: '22 oct',
    amount: '$1,180.00',
    status: 'Auditado'
  },
]

interface ResumenViewProps {
  onGoToComprobantes: () => void
  onOpenDemo?: () => void
  activities?: ActivityItem[]
  lastAuditBanner?: {
    stamped_response: string
    is_overpriced: boolean
    supplier_name: string
    amount: string
  } | null
  onDismissBanner?: () => void
}

export const ResumenView: React.FC<ResumenViewProps> = ({
  onGoToComprobantes,
  onOpenDemo,
  activities: propActivities,
  lastAuditBanner,
  onDismissBanner,
}) => {
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null)
  const [internalActivities, setInternalActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES)

  const activeActivities = propActivities || internalActivities

  const handleSimulateTicket = async () => {
    setIsSimulating(true)
    setSimulationStatus('Stampy procesando ticket...')
    try {
      const res = await fetch('http://localhost:8000/api/v1/telegram/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: 12345678,
          text: 'Gasté $450 en fruta fresca en el mercado',
          active_mode: 'BUSINESS'
        })
      })

      if (res.ok) {
        await res.json()
        setSimulationStatus('¡Ticket auditado por Stampy [ ✦ OK ]!')
        setInternalActivities(prev => [
          {
            id: Date.now(),
            supplier: 'Frutería del Mercado',
            desc: 'Insumo fruta fresca (Prime Cost)',
            date: 'Hace un momento',
            amount: '$450.00',
            status: 'Auditado'
          },
          ...prev
        ])
      } else {
        setSimulationStatus('Ticket procesado en modo simulación local.')
      }
    } catch {
      setSimulationStatus('Simulación completada en local.')
    } finally {
      setIsSimulating(false)
      setTimeout(() => setSimulationStatus(null), 4000)
    }
  }

  return (
    <div className="w-full px-4 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
      {/* Editorial Statement & Status Indicator */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-primary text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Auditoría en tiempo real activa</span>
            {simulationStatus && (
              <span className="ml-2 font-mono text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded">
                {simulationStatus}
              </span>
            )}
          </div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-on-surface">
            Salud financiera en rango óptimo
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Café Alameda mantiene el costo primo dentro de la meta estipulada para el ciclo operativo en curso.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenDemo || handleSimulateTicket}
            disabled={isSimulating}
            className="px-4 py-2 rounded bg-surface-container-low hover:bg-surface-container text-on-surface text-sm font-medium transition-colors flex items-center gap-2 border border-outline-variant/30 cursor-pointer disabled:opacity-50"
            title="Abrir Simulador de Ingesta Telegram"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">document_scanner</span>
            <span>{isSimulating ? 'Auditando...' : 'Simular ticket'}</span>
          </button>
          <button
            onClick={onOpenDemo || handleSimulateTicket}
            className="px-4 py-2 rounded bg-primary hover:bg-primary-container text-on-primary text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            title="Registrar comprobante manualmente o con IA"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Registrar gasto manual</span>
          </button>
        </div>
      </section>

      {/* Alerta de Auditoría en Tiempo Real / Simulación Telegram */}
      {lastAuditBanner && (
        <div className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all shadow-xs ${
          lastAuditBanner.is_overpriced 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-950' 
            : 'bg-primary/10 border-primary/30 text-primary-950'
        }`}>
          <div className="flex items-start gap-3">
            <span className={`material-symbols-outlined text-[24px] shrink-0 mt-0.5 ${
              lastAuditBanner.is_overpriced ? 'text-amber-600' : 'text-primary'
            }`}>
              {lastAuditBanner.is_overpriced ? 'warning' : 'verified'}
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {lastAuditBanner.is_overpriced ? 'Alerta de Auditoría' : 'Auditoría en Tiempo Real'}
                </span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-container-lowest/80 text-on-surface">
                  {lastAuditBanner.supplier_name} • {lastAuditBanner.amount}
                </span>
              </div>
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed opacity-90">
                {lastAuditBanner.stamped_response}
              </pre>
            </div>
          </div>
          {onDismissBanner && (
            <button 
              onClick={onDismissBanner}
              className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer shrink-0"
              title="Cerrar notificación"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      )}

      {/* Main Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Primary Column: Metrics & Ledger (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Core Financial Baseline Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs space-y-6 border border-outline-variant/20">
            <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-2">
              <div>
                <span className="text-xs text-on-surface-variant font-medium">Gasto consolidado del mes</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl lg:text-4xl text-on-surface tracking-tight font-semibold">
                    $32,450
                  </span>
                  <span className="text-sm font-mono text-on-surface-variant">MXN</span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-on-surface-variant font-medium">Tope presupuestario</span>
                <p className="text-sm font-mono text-on-surface font-medium mt-1">$45,000 MXN</p>
              </div>
            </div>

            {/* Ultra-fine progress bar */}
            <div className="space-y-2">
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-700 ease-out" style={{ width: '72.1%' }}></div>
              </div>
              <div className="flex justify-between items-center text-xs text-on-surface-variant">
                <span className="font-medium">72.1% ejercido</span>
                <span className="font-mono text-primary font-medium">$12,550 MXN disponible</span>
              </div>
            </div>

            {/* Secondary Indicators: Margin & Prime Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 bg-surface-container-low/40 -mx-6 -mb-6 p-6 rounded-b-xl border-t border-outline-variant/20">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-medium">
                  <span>Margen operativo</span>
                  <span className="material-symbols-outlined text-[16px] text-primary" title="Estable, objetivo cumplido">
                    check_circle
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl text-on-surface font-semibold">41.8%</span>
                  <span className="text-xs text-on-surface-variant">Meta: &ge; 40.0%</span>
                </div>
                <p className="text-xs text-on-surface-variant">Consistente respecto al periodo anterior</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-medium">
                  <span>Prime cost</span>
                  <span className="material-symbols-outlined text-[16px] text-primary" title="Controlado bajo el umbral del 60%">
                    verified
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl text-on-surface font-semibold">58.0%</span>
                  <span className="text-xs text-on-surface-variant">Umbral: &le; 60.0%</span>
                </div>
                <p className="text-xs text-on-surface-variant">Insumos y nómina en balance armónico</p>
              </div>
            </div>
          </div>

          {/* Grid de 2 Tarjetas: Distribución de costos & Evolución semanal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Donut Chart: Distribución de Costos */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs space-y-4 flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div>
                  <h2 className="text-base font-semibold text-on-surface">Distribución de costos</h2>
                  <p className="text-xs text-on-surface-variant">Composición proporcional del gasto</p>
                </div>
                <span className="material-symbols-outlined text-[20px] text-secondary">donut_large</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                {/* SVG Donut */}
                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" fill="none" r="45" stroke="#eaedff" strokeWidth="14" />
                    <circle cx="60" cy="60" fill="none" r="45" stroke="#006948" strokeDasharray="282.74" strokeDashoffset="197.9" strokeLinecap="round" strokeWidth="14" />
                    <circle cx="60" cy="60" fill="none" r="45" stroke="#00855d" strokeDasharray="282.74" strokeDashoffset="209.2" strokeLinecap="round" strokeWidth="14" style={{ transform: 'rotate(108deg)', transformOrigin: 'center' }} />
                    <circle cx="60" cy="60" fill="none" r="45" stroke="#515f74" strokeDasharray="282.74" strokeDashoffset="231.8" strokeLinecap="round" strokeWidth="14" style={{ transform: 'rotate(201deg)', transformOrigin: 'center' }} />
                    <circle cx="60" cy="60" fill="none" r="45" stroke="#68dba9" strokeDasharray="282.74" strokeDashoffset="209.2" strokeLinecap="round" strokeWidth="14" style={{ transform: 'rotate(266deg)', transformOrigin: 'center' }} />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[11px] text-on-surface-variant leading-none">Total</span>
                    <span className="text-base font-semibold text-on-surface tracking-tight mt-0.5">$32.4k</span>
                    <span className="text-[9px] text-primary font-medium">MXN</span>
                  </div>
                </div>

                {/* Leyenda */}
                <div className="space-y-1.5 text-xs w-full sm:w-auto">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></span>
                      <span className="text-on-surface">Insumos &amp; café</span>
                    </div>
                    <span className="font-mono text-on-surface-variant font-medium">30%</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container shrink-0"></span>
                      <span className="text-on-surface">Nómina &amp; equipo</span>
                    </div>
                    <span className="font-mono text-on-surface-variant font-medium">26%</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0"></span>
                      <span className="text-on-surface">Servicios fijos</span>
                    </div>
                    <span className="font-mono text-on-surface-variant font-medium">18%</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-inverse-primary shrink-0"></span>
                      <span className="text-on-surface">Margen retenido</span>
                    </div>
                    <span className="font-mono text-on-surface-variant font-medium">26%</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center text-xs text-on-surface-variant">
                <span>Costo unitario promedio</span>
                <span className="font-mono text-on-surface font-semibold">$18.40 MXN / taza</span>
              </div>
            </div>

            {/* Evolución Semanal */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs space-y-4 flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div>
                  <h2 className="text-base font-semibold text-on-surface">Evolución semanal</h2>
                  <p className="text-xs text-on-surface-variant">Gasto ejecutado vs presupuesto</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Meta: $11.2k
                </span>
              </div>

              <div className="space-y-3 py-1">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface font-medium">Semana 1 (1 - 7 oct)</span>
                    <span className="font-mono text-on-surface">$8,120 <span className="text-on-surface-variant">/ $11,250</span></span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: '72%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface font-medium">Semana 2 (8 - 14 oct)</span>
                    <span className="font-mono text-on-surface">$9,450 <span className="text-on-surface-variant">/ $11,250</span></span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: '84%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface font-medium">Semana 3 (15 - 21 oct)</span>
                    <span className="font-mono text-on-surface">$8,640 <span className="text-on-surface-variant">/ $11,250</span></span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: '76.8%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-on-surface font-medium">Semana 4 (proyectada)</span>
                      <span className="text-[10px] px-1 py-0.5 rounded bg-surface-container text-secondary font-medium">En curso</span>
                    </div>
                    <span className="font-mono text-on-surface">$6,240 <span className="text-on-surface-variant">/ $11,250</span></span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                    <div className="bg-primary/60 h-full rounded-full transition-all" style={{ width: '55.4%' }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center text-xs text-on-surface-variant">
                <span>Desviación consolidada</span>
                <span className="text-xs text-primary font-medium inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_down</span>
                  -8.4% bajo presupuesto
                </span>
              </div>
            </div>
          </div>

          {/* Actividad Reciente / Comprobantes Auditados */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs space-y-4 border border-outline-variant/20">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="text-base font-semibold text-on-surface">Actividad reciente</h2>
                <p className="text-xs text-on-surface-variant">Últimos comprobantes fiscales procesados y verificados</p>
              </div>
              <button
                onClick={onGoToComprobantes}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>Ver todos</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-on-surface-variant text-xs border-b border-outline-variant/20">
                    <th className="py-2.5 font-medium">Concepto / Proveedor</th>
                    <th className="py-2.5 font-medium">Fecha</th>
                    <th className="py-2.5 font-medium text-right">Importe</th>
                    <th className="py-2.5 font-medium text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {activeActivities.map(item => (
                    <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-on-surface text-sm flex items-center gap-1.5">
                          {item.supplier}
                          {item.isWarning && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 font-mono font-bold">
                              SOBREPRECIO
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-on-surface-variant">{item.desc}</div>
                      </td>
                      <td className="py-3 font-mono text-xs text-on-surface-variant">{item.date}</td>
                      <td className="py-3 font-mono text-sm text-right text-on-surface font-semibold">{item.amount}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded font-medium border ${
                          item.isWarning 
                            ? 'bg-amber-500/10 text-amber-800 border-amber-500/30' 
                            : 'bg-surface-container-low text-primary border-primary/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isWarning ? 'bg-amber-600' : 'bg-primary'}`}></span>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Secondary Column: Copilot Editorial Note & Context (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Stampy Copilot: Editorial Advisor */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs space-y-4 relative overflow-hidden border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20"></span>
                <span className="text-sm font-semibold text-on-surface tracking-tight">Stampy Copiloto</span>
              </div>
              <span className="text-xs text-on-surface-variant">Informe de ciclo</span>
            </div>

            <blockquote className="text-sm text-on-surface leading-relaxed italic bg-surface-container-low/50 p-4 rounded-lg border-l-3 border-primary">
              “Octubre avanza con margen saludable. El último comprobante de café mantuvo tus insumos en 29.4%. Sin alertas de riesgo activas.”
            </blockquote>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Eficiencia de insumos</span>
                <span className="font-mono text-on-surface font-semibold">29.4% (Meta &le; 32%)</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Discrepancias fiscales</span>
                <span className="text-primary font-semibold">0 detectadas</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Cierre contable proyectado</span>
                <span className="text-on-surface font-medium">31 de octubre</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 bg-surface-container-low rounded-lg flex items-start gap-2.5 border border-outline-variant/20">
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">lightbulb</span>
                <p className="text-xs text-on-surface-variant leading-snug">
                  Proyección: Al ritmo actual, se anticipa un excedente de caja de $4,200 MXN para mantenimiento programado.
                </p>
              </div>
            </div>
          </div>

          {/* Physical Venue Reference & In-store Verification */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs space-y-3 border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">Unidad operativa</span>
              <span className="font-mono text-xs text-primary font-semibold">Activo #01</span>
            </div>

            <div className="h-36 w-full rounded-lg overflow-hidden relative shadow-inner">
              <img
                className="w-full h-full object-cover"
                alt="Café Alameda"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLhvpwYalx66wDcjws4ng7_FjqxloO9rLHpx-TzVSiZ96yP9zp-smSCbm6k2xlyDoji5EapfLKBvGTh8uyX0OFfL7muuEyJy0CrgXWFa28wStda68uGsdJv-XPOtYRA0d6AcH5obtaytQLdI3KRTBqG9Zq3BPuEb7U0QX7VQkZ6JynEaLX96R2a2LLjahxfFM4InQda1zfFJWx8o6Re4Hcfir1A7oKvndZedChCuhgnJbalcODCFB8"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent"></div>
              <div className="absolute bottom-2.5 left-3 text-white text-xs font-medium">
                Barra Matriz • Av. Alameda 142
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-xs text-on-surface-variant border-t border-outline-variant/20">
              <span>Responsable de turno</span>
              <span className="text-on-surface font-semibold">Mariana Soto</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
