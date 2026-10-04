import { useState } from 'react'
import { 
  Building2, 
  User, 
  Receipt, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRightLeft
} from 'lucide-react'

export function App() {
  const [activeMode, setActiveMode] = useState<'BUSINESS' | 'PERSONAL'>('BUSINESS')
  const [isSimulating, setIsSimulating] = useState(false)
  const [lcdMessage, setLcdMessage] = useState<string | null>(null)
  const [receiptsList, setReceiptsList] = useState([
    { name: 'Central de Abastos S.A.', category: 'Insumo Cocina', amount: '$1,450.00', status: '[ ✦ OK ]', time: 'Hoy 11:42 AM' },
    { name: 'CFE Suministrador', category: 'Gasto Fijo', amount: '$3,210.00', status: '[ ✦ OK ]', time: 'Ayer 04:15 PM' },
    { name: 'Gasolinera Shell #402', category: 'Operativo', amount: '$850.00', status: '[ ✦ OK ]', time: '02 Oct 09:30 AM' },
  ])

  const handleSimulate = async () => {
    setIsSimulating(true)
    setLcdMessage('AUDITANDO TICKET DE TELEGRAM... 🔍')
    try {
      const textToSimulate = activeMode === 'BUSINESS' 
        ? 'Gasté $450 en fruta' 
        : 'Pagué $350 en despensa'

      const res = await fetch('http://localhost:8000/api/v1/telegram/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: 12345678,
          text: textToSimulate,
          active_mode: activeMode
        })
      })

      if (res.ok) {
        const data = await res.json()
        setLcdMessage(data.stamped_response || '[ ✦ AUDITADO // OK ]')
        setReceiptsList(prev => [
          {
            name: 'Comercio Local / Varios',
            category: activeMode === 'BUSINESS' ? 'Insumo Cocina' : 'Despensa Personal',
            amount: activeMode === 'BUSINESS' ? '$450.00' : '$350.00',
            status: '[ ✦ OK ]',
            time: 'Hace un momento'
          },
          ...prev
        ])
      } else {
        // Fallback local si la API aún no está corriendo en segundo plano
        setLcdMessage('[ ✦ AUDITADO // OK ]\n$450.00 MXN en Insumos guardado.')
        setReceiptsList(prev => [
          {
            name: activeMode === 'BUSINESS' ? 'Mercado de Abastos / Insumos' : 'Supermercado Central / Despensa',
            category: activeMode === 'BUSINESS' ? 'Insumo Cocina' : 'Despensa Personal',
            amount: activeMode === 'BUSINESS' ? '$450.00' : '$350.00',
            status: '[ ✦ OK ]',
            time: 'Hace un momento'
          },
          ...prev
        ])
      }
    } catch {
      setLcdMessage('[ ✦ AUDITADO // OK ]\n$450.00 MXN en Insumos guardado.')
      setReceiptsList(prev => [
        {
          name: activeMode === 'BUSINESS' ? 'Mercado de Abastos / Insumos' : 'Supermercado Central / Despensa',
          category: activeMode === 'BUSINESS' ? 'Insumo Cocina' : 'Despensa Personal',
          amount: activeMode === 'BUSINESS' ? '$450.00' : '$350.00',
          status: '[ ✦ OK ]',
          time: 'Hace un momento'
        },
        ...prev
      ])
    } finally {
      setIsSimulating(false)
    }
  }

  const isBusiness = activeMode === 'BUSINESS'

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start text-slate-800">
      {/* Master Chassis Top Bar */}
      <header className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 p-4 tactile-extrusion mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              STAMPY <span className="text-xs font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">v0.1.0-alpha</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Auditor Financiero & Gestor de Gastos</p>
          </div>
        </div>

        {/* Dual-Scope Mode Switch (Hardware Knurl) */}
        <div className="tactile-inset p-1.5 flex items-center gap-2">
          <button
            onClick={() => setActiveMode('BUSINESS')}
            className={`px-4 py-2 rounded-md font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2 ${
              isBusiness 
                ? 'tactile-extrusion text-emerald-700 font-bold bg-white' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Modo Negocio (FinOps)</span>
          </button>
          <button
            onClick={() => setActiveMode('PERSONAL')}
            className={`px-4 py-2 rounded-md font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2 ${
              !isBusiness 
                ? 'tactile-extrusion text-indigo-700 font-bold bg-white' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Modo Personal (Wealth)</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mascot LCD & Telemetry */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Stampy Hardware Module */}
          <div className="tactile-extrusion p-6 flex flex-col items-center">
            {/* Visual Character Stamp */}
            <div className="relative w-32 h-36 tactile-inset flex flex-col items-center justify-center mb-6 p-4">
              <div className="text-4xl mb-1 select-none transition-transform hover:scale-110 cursor-pointer">
                {isBusiness ? '👔' : '🧢'}
              </div>
              <div className="w-16 h-10 stampy-lcd flex items-center justify-center text-xs font-mono font-bold tracking-widest px-2">
                {isBusiness ? '[ OK ]' : '[ RELAX ]'}
              </div>
              <div className="mt-2 text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                STAMPY BOT
              </div>
            </div>

            {/* LCD Telemetry Screen */}
            <div className="w-full stampy-lcd p-4 text-xs space-y-2 mb-4">
              <div className="flex items-center justify-between text-[10px] opacity-75 border-b border-emerald-800 pb-1">
                <span>// ESTADO EN VIVO</span>
                <span className="animate-pulse text-emerald-300">● ACTIVO</span>
              </div>
              <p className="font-mono leading-relaxed whitespace-pre-line">
                {lcdMessage || (isBusiness 
                  ? 'MODO NEGOCIO AUDITADO. PRIME COST VIGILADO AL 54.2% (OBJETIVO <= 60%).' 
                  : 'MODO PERSONAL CALIBRADO. DISTRIBUCIÓN 50/30/20 EQUILIBRADA ESTE MES.')}
              </p>
              <div className="text-[10px] text-emerald-400 font-mono pt-1">
                [ ✦ TELEGRAM: VINCULADO ]
              </div>
            </div>

            {/* Quick Action Button */}
            <button 
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 tactile-extrusion text-emerald-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-50 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>{isSimulating ? 'Stampy Procesando...' : 'Simular Ingesta Telegram'}</span>
            </button>
          </div>

          {/* Owner's Bridge Card */}
          <div className="tactile-extrusion p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                <span>Puente del Sueldo</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Atómico</span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Nómina del negocio transferida directamente como ingreso a tu patrimonio personal.
            </p>
            <div className="tactile-inset p-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">Último retiro:</span>
              <span className="font-mono font-bold text-sm text-emerald-700">$25,000.00 MXN</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Metrics & Health */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main KPI Panel */}
          <div className="tactile-extrusion p-6">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{isBusiness ? 'Salud Operativa (Prime Cost Standard)' : 'Distribución Patrimonial (Regla 50 / 30 / 20)'}</span>
            </h2>

            {isBusiness ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="tactile-inset p-4">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Insumos (COGS)</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1">31.4%</div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-1">✓ Bajo control</div>
                </div>
                <div className="tactile-inset p-4">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Nómina Total</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1">22.8%</div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-1">✓ En rango esperado</div>
                </div>
                <div className="tactile-inset p-4 border border-emerald-300">
                  <div className="text-[10px] font-mono text-emerald-800 uppercase font-bold">Prime Cost Total</div>
                  <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">54.2%</div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-1">Objetivo: &le; 60%</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="tactile-inset p-4">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">50% Necesidades</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1">48.5%</div>
                  <div className="text-[10px] text-indigo-600 font-medium mt-1">Vivienda, despensa, salud</div>
                </div>
                <div className="tactile-inset p-4">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">30% Deseos</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1">28.0%</div>
                  <div className="text-[10px] text-indigo-600 font-medium mt-1">Ocio sin culpa</div>
                </div>
                <div className="tactile-inset p-4 border border-indigo-300">
                  <div className="text-[10px] font-mono text-indigo-800 uppercase font-bold">20% Ahorro / Inversión</div>
                  <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">23.5%</div>
                  <div className="text-[10px] text-indigo-700 font-medium mt-1">Superando la meta</div>
                </div>
              </div>
            )}

            {/* Anomaly / Overprice Alert Banner */}
            <div className="tactile-inset p-4 flex items-start gap-3 border-l-4 border-amber-500">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  {isBusiness ? 'Radar de Sobreprecios: Alerta Activa' : 'Detector de Fugas Hormiga'}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isBusiness 
                    ? 'Proveedor "Distribuidora del Centro" aumentó el precio del aguacate un +24% respecto al promedio de las últimas 3 compras.' 
                    : 'Se detectaron 3 cargos recurrentes de streaming con nulo uso en los últimos 30 días.'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Audited Receipts Table Preview */}
          <div className="tactile-extrusion p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Últimos Comprobantes Auditados</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">Captura Telegram</span>
            </div>

            <div className="space-y-3">
              {receiptsList.map((item, idx) => (
                <div key={idx} className="tactile-inset p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.category} • {item.time}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold font-mono text-slate-900">{item.amount}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
