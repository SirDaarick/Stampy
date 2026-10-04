import React, { useState } from 'react'
import { DEMO_PRESETS, simulateAudit, type SimulationResult } from '../lib/demoEngine'
import type { ModeType } from './Header'

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
  activeMode: ModeType
  onTicketAudited: (result: SimulationResult) => void
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  activeMode,
  onTicketAudited,
}) => {
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)

  if (!isOpen) return null

  const handleRunSimulation = async (textToUse?: string) => {
    const text = textToUse || inputText || 'Gasté $450 en fruta fresca en el mercado'
    setIsLoading(true)
    setResult(null)

    try {
      const res = await simulateAudit(text, activeMode)
      setResult(res)
      onTicketAudited(res)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-on-surface/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-xl p-6 space-y-6 border border-outline-variant/30">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">document_scanner</span>
            <div>
              <h3 className="text-base font-semibold text-on-surface">Simulador de Ingesta Telegram</h3>
              <p className="text-xs text-on-surface-variant">Prueba cómo la IA de Stampy audita comprobantes en segundos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Input Text / Audio note simulator */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-on-surface">
            Mensaje o transcripción de nota de voz:
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="ej. Gasté $450 en fruta, o Compré 1kg de aguacate a $85"
              className="w-full h-10 pl-3 pr-10 bg-surface-container-low rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
            />
            <button
              onClick={() => handleRunSimulation()}
              disabled={isLoading}
              className="absolute right-1 top-1 h-8 px-3 rounded-md bg-primary hover:bg-primary-container text-on-primary text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Auditar
            </button>
          </div>
        </div>

        {/* Escenarios Demo Rápidos */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            O selecciona un escenario de prueba:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(preset.text)
                  handleRunSimulation(preset.text)
                }}
                disabled={isLoading}
                className="text-left p-2.5 rounded-lg bg-surface-container-low/70 hover:bg-surface-container text-xs text-on-surface border border-outline-variant/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="font-semibold text-[11px] text-primary">{preset.label}</div>
                <div className="text-[10px] text-on-surface-variant truncate mt-0.5">"{preset.text}"</div>
              </button>
            ))}
          </div>
        </div>

        {/* Resultado del Estampado en Vivo */}
        {isLoading && (
          <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-center gap-3 text-xs text-on-surface-variant animate-pulse">
            <span className="material-symbols-outlined text-primary text-[20px] animate-spin">refresh</span>
            <span>Stampy está extrayendo partidas y verificando precios...</span>
          </div>
        )}

        {result && !isLoading && (
          <div className={`p-4 rounded-xl border text-xs space-y-2 font-mono ${
            result.is_overpriced 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-950' 
              : 'bg-primary/5 border-primary/20 text-on-surface'
          }`}>
            <div className="flex items-center justify-between pb-1 border-b border-current/10">
              <span className="font-bold flex items-center gap-1.5">
                <span className={`material-symbols-outlined text-[16px] ${result.is_overpriced ? 'text-amber-600' : 'text-primary'}`}>
                  {result.is_overpriced ? 'warning' : 'verified'}
                </span>
                Respuesta estampada por Telegram
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                result.is_overpriced ? 'bg-amber-500/20 text-amber-800' : 'bg-primary/10 text-primary'
              }`}>
                {result.is_overpriced ? '⚠️ SOBREPRECIO' : '✦ AUDITADO OK'}
              </span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed text-[11px] font-sans">
              {result.stamped_response}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
