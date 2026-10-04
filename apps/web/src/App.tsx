import { useState } from 'react'
import { Header } from './components/Header'
import type { TabType, ModeType } from './components/Header'
import { ResumenView, INITIAL_ACTIVITIES, type ActivityItem } from './views/ResumenView'
import { ComprobantesView, SAMPLE_RECEIPTS, type ReceiptItem } from './views/ComprobantesView'
import { AnalisisView } from './views/AnalisisView'
import { AjustesView } from './views/AjustesView'
import { DemoModal } from './components/DemoModal'
import type { SimulationResult } from './lib/demoEngine'

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('resumen')
  const [activeMode, setActiveMode] = useState<ModeType>('BUSINESS')
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES)
  const [receipts, setReceipts] = useState<ReceiptItem[]>(SAMPLE_RECEIPTS)
  const [lastAuditBanner, setLastAuditBanner] = useState<{
    stamped_response: string
    is_overpriced: boolean
    supplier_name: string
    amount: string
  } | null>(null)

  const handleTicketAudited = (result: SimulationResult) => {
    // 1. Mostrar banner de resultado en tiempo real
    setLastAuditBanner({
      stamped_response: result.stamped_response,
      is_overpriced: result.is_overpriced,
      supplier_name: result.supplier_name,
      amount: result.amount,
    })

    // 2. Prepend a la actividad reciente en Resumen
    const newActivity: ActivityItem = {
      id: Date.now(),
      supplier: result.supplier_name,
      desc: `${result.concept} (${result.category})`,
      date: 'Hace un momento',
      amount: result.amount,
      status: result.is_overpriced ? 'Con Advertencia' : 'Auditado',
      isWarning: result.is_overpriced,
    }
    setActivities(prev => [newActivity, ...prev])

    // 3. Prepend al libro mayor de Comprobantes
    const newReceipt: ReceiptItem = {
      id: `rec-sim-${Date.now()}`,
      date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      supplier: result.supplier_name,
      concept: result.concept,
      medium: 'Telegram',
      amount: result.amount,
      category: result.category,
      taxId: 'SIM-AUTO-AUDIT',
      lines: [
        { name: result.concept, qty: 1, unitPrice: result.amount, total: result.amount }
      ]
    }
    setReceipts(prev => [newReceipt, ...prev])
  }

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col">
      {/* Header Fijo con Navegación, Selector Dual y Acceso al Modo Demo */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onOpenDemo={() => setIsDemoOpen(true)}
      />

      {/* Contenido Dinámico de la Pestaña Activa */}
      <main className="w-full pt-14 flex-1">
        {activeTab === 'resumen' && (
          <ResumenView
            onGoToComprobantes={() => setActiveTab('comprobantes')}
            onOpenDemo={() => setIsDemoOpen(true)}
            activities={activities}
            lastAuditBanner={lastAuditBanner}
            onDismissBanner={() => setLastAuditBanner(null)}
          />
        )}
        {activeTab === 'comprobantes' && <ComprobantesView receipts={receipts} />}
        {activeTab === 'analisis' && <AnalisisView />}
        {activeTab === 'ajustes' && <AjustesView />}
      </main>

      {/* Modal Interactivo de Demostración */}
      <DemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        activeMode={activeMode}
        onTicketAudited={handleTicketAudited}
      />
    </div>
  )
}

export default App
