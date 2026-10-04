import React, { useState } from 'react'

export const AjustesView: React.FC = () => {
  const [telegramStatus] = useState<'CONNECTED' | 'DISCONNECTED'>('CONNECTED')
  const [primeCostLimit, setPrimeCostLimit] = useState(60)
  const [monthlyBudget, setMonthlyBudget] = useState(45000)

  return (
    <div className="w-full px-4 lg:px-8 py-8 max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header Titular */}
      <div className="flex flex-col gap-1 pb-2 border-b border-outline-variant/20">
        <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Ajustes &amp; Calibración</h1>
        <p className="text-sm text-on-surface-variant">Configuración de parámetros operativos y vinculación de canales</p>
      </div>

      {/* Sección 1: Canal de Ingesta (Telegram) */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs border border-outline-variant/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">send</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Canal de Telegram Bot</h2>
              <p className="text-xs text-on-surface-variant">Recepción de fotos de tickets y audios de gastos</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-primary/10 text-primary font-medium border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            {telegramStatus === 'CONNECTED' ? 'Bot Vinculado' : 'Sin Vincular'}
          </span>
        </div>

        <div className="p-4 bg-surface-container-low/50 rounded-lg border border-outline-variant/20 space-y-2 text-xs">
          <div className="flex justify-between items-center text-on-surface">
            <span className="text-on-surface-variant">Bot asignado:</span>
            <span className="font-mono font-semibold text-primary">@StampyFinOpsBot</span>
          </div>
          <div className="flex justify-between items-center text-on-surface">
            <span className="text-on-surface-variant">ID de chat vinculado:</span>
            <span className="font-mono text-on-surface font-medium">987654321</span>
          </div>
          <div className="flex justify-between items-center text-on-surface">
            <span className="text-on-surface-variant">Modo de ingesta:</span>
            <span className="font-medium text-on-surface">Visión Multimodal (Gemini 2.5 Flash)</span>
          </div>
        </div>

        <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer">
          <span>Generar nuevo código de vinculación</span>
          <span className="material-symbols-outlined text-[16px]">sync</span>
        </button>
      </div>

      {/* Sección 2: Calibración Financiera (Prime Cost & Presupuesto) */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs border border-outline-variant/20 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-on-surface">Parámetros Operativos (FinOps)</h2>
          <p className="text-xs text-on-surface-variant">Límites para las alertas del Copiloto Stampy</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="font-medium text-on-surface">Umbral Máximo de Prime Cost</label>
              <span className="font-mono font-bold text-primary">{primeCostLimit}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="75"
              value={primeCostLimit}
              onChange={e => setPrimeCostLimit(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-[11px] text-on-surface-variant">
              El estándar para cafeterías y restaurantes es &le; 60% (Insumos + Nómina).
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-outline-variant/20">
            <div className="flex justify-between">
              <label className="font-medium text-on-surface">Tope de Gasto Mensual</label>
              <span className="font-mono font-bold text-primary">${monthlyBudget.toLocaleString()} MXN</span>
            </div>
            <input
              type="range"
              min="20000"
              max="100000"
              step="5000"
              value={monthlyBudget}
              onChange={e => setMonthlyBudget(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        <div className="pt-2">
          <button className="px-4 py-2 rounded bg-primary hover:bg-primary-container text-on-primary text-xs font-medium transition-colors cursor-pointer shadow-xs">
            Guardar Parámetros
          </button>
        </div>
      </div>
    </div>
  )
}
