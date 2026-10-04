import React from 'react'

export const AnalisisView: React.FC = () => {
  return (
    <div className="w-full px-4 lg:px-8 py-8 max-w-[1600px] mx-auto flex flex-col gap-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-medium">
            Auditoría Operativa · Café Alameda Matriz
          </span>
          <h1 className="text-2xl lg:text-3xl font-semibold text-on-surface tracking-tight">
            Control de Costos &amp; Fugas
          </h1>
          <p className="text-sm text-on-surface-variant">
            Corte acumulado mensual al 24 de Octubre de 2024
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            <span>Descargar reporte Excel</span>
          </button>
          <span className="text-outline-variant/60">·</span>
          <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">description</span>
            <span>Exportar resumen PDF</span>
          </button>
        </div>
      </div>

      {/* 4 KPIs de Alto Nivel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <span className="text-xs text-on-surface-variant font-medium">Ventas Brutas Periodo</span>
          <div className="mt-4 flex flex-col">
            <span className="text-3xl font-semibold text-on-surface tracking-tight">$184,500</span>
            <span className="text-xs text-primary font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              +4.8% vs mes previo
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <span className="text-xs text-on-surface-variant font-medium">Prime Cost Total</span>
          <div className="mt-4 flex flex-col">
            <span className="text-3xl font-semibold text-on-surface tracking-tight">56.0%</span>
            <span className="text-xs text-on-surface-variant font-mono mt-1">
              $103,320 MXN (Objetivo &le; 58%)
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <span className="text-xs text-on-surface-variant font-medium">Margen Neto Retenible</span>
          <div className="mt-4 flex flex-col">
            <span className="text-3xl font-semibold text-primary tracking-tight">$47,970</span>
            <span className="text-xs text-on-surface-variant mt-1">
              26.0% después de costos operativos
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">Fugas Abiertas</span>
            <span className="h-2.5 w-2.5 rounded-full bg-error animate-pulse"></span>
          </div>
          <div className="mt-4 flex flex-col">
            <span className="text-3xl font-semibold text-on-surface tracking-tight">2</span>
            <span className="text-xs text-error font-medium mt-1">
              $3,850 MXN riesgo cuantificado
            </span>
          </div>
        </div>
      </div>

      {/* Distribución Estructural de Costos */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs border border-outline-variant/20 space-y-6">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 pb-2 border-b border-outline-variant/20">
          <div>
            <h2 className="text-base font-semibold text-on-surface">Distribución Estructural de Costos</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Composición porcentual de egresos respecto al total facturado en caja</p>
          </div>
          <span className="text-xs font-mono text-on-surface-variant">Base calculada: $184,500 MXN</span>
        </div>

        <div className="space-y-4">
          <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-surface-container shadow-inner">
            <div className="h-full bg-secondary transition-all" style={{ width: '30%' }} title="Insumos (30%)"></div>
            <div className="h-full bg-secondary-container transition-all" style={{ width: '26%' }} title="Nómina (26%)"></div>
            <div className="h-full bg-outline-variant transition-all" style={{ width: '18%' }} title="Servicios Fijos (18%)"></div>
            <div className="h-full bg-primary transition-all" style={{ width: '26%' }} title="Margen Retenible (26%)"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span>Insumos (COGS)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-on-surface">30.0%</span>
                <span className="text-xs font-mono text-on-surface-variant">$55,350 MXN</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
                <span>Nómina Operativa</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-on-surface">26.0%</span>
                <span className="text-xs font-mono text-on-surface-variant">$47,970 MXN</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                <span>Servicios Fijos</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-on-surface">18.0%</span>
                <span className="text-xs font-mono text-on-surface-variant">$33,210 MXN</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span>Margen Retenible</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-primary">26.0%</span>
                <span className="text-xs font-mono text-on-surface-variant">$47,970 MXN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fugas Detectadas / Alertas de Sobreprecio */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs border border-outline-variant/20 space-y-4">
        <h2 className="text-base font-semibold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[20px]">warning</span>
          <span>Radares de Fugas y Desviación de Precios</span>
        </h2>

        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-surface-container-low/50 border border-error/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-error/10 text-error">
                  SOBREPRECIO +24%
                </span>
                <span className="text-sm font-semibold text-on-surface">Distribuidora del Centro · Aguacate Hass</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                El precio unitario saltó de $52.00 a $64.50 por kg en los últimos 2 comprobantes.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono text-sm font-bold text-error">+$1,450.00 MXN fuga</span>
              <button className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface transition-colors cursor-pointer border border-outline-variant/30">
                Verificar proveedor
              </button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface-container-low/50 border border-amber-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700">
                  CONSUMO ANÓMALO
                </span>
                <span className="text-sm font-semibold text-on-surface">CFE Suministrador · Cargo Tarifa DAC</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                El recibo eléctrico superó en +18% el histórico estacional de refrigeradores de barra.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono text-sm font-bold text-amber-700">+$2,400.00 MXN exceso</span>
              <button className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface transition-colors cursor-pointer border border-outline-variant/30">
                Auditar consumo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
