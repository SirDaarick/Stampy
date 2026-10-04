import React from 'react'

export type TabType = 'resumen' | 'comprobantes' | 'analisis' | 'ajustes'
export type ModeType = 'BUSINESS' | 'PERSONAL'

interface HeaderProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  activeMode: ModeType
  onModeChange: (mode: ModeType) => void
  onOpenDemo?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  activeMode,
  onModeChange,
  onOpenDemo,
}) => {
  const isBusiness = activeMode === 'BUSINESS'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant/30">
      <div className="h-14 w-full px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onTabChange('resumen')}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <span className="text-xl text-on-surface font-semibold lowercase tracking-tight">stampy</span>
            <span className="h-2 w-2 rounded-full bg-primary ring-4 ring-primary/20" title="Sistema online"></span>
          </button>

          <nav className="hidden md:flex items-center gap-6 h-14">
            <button
              onClick={() => onTabChange('resumen')}
              className={`h-full flex items-center px-1 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'resumen'
                  ? 'text-on-surface border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => onTabChange('comprobantes')}
              className={`h-full flex items-center px-1 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'comprobantes'
                  ? 'text-on-surface border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent'
              }`}
            >
              Comprobantes
            </button>
            <button
              onClick={() => onTabChange('analisis')}
              className={`h-full flex items-center px-1 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'analisis'
                  ? 'text-on-surface border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent'
              }`}
            >
              Análisis
            </button>
            <button
              onClick={() => onTabChange('ajustes')}
              className={`h-full flex items-center px-1 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'ajustes'
                  ? 'text-on-surface border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent'
              }`}
            >
              Ajustes
            </button>
          </nav>
        </div>

        {/* Right: Business/Personal Toggle & Profile */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Demo Mode Trigger */}
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all cursor-pointer border border-primary/20 shadow-xs"
            title="Abrir Simulador de Ingesta Telegram & Modo Demo"
          >
            <span className="material-symbols-outlined text-[16px] animate-pulse">science</span>
            <span className="hidden sm:inline">Modo Demo</span>
          </button>

          {/* Dual Scope Selector */}
          <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-outline-variant/40">
            <button
              onClick={() => onModeChange('BUSINESS')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                isBusiness
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Negocio
            </button>
            <button
              onClick={() => onModeChange('PERSONAL')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                !isBusiness
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Personal
            </button>
          </div>

          {/* User & Venue Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-on-surface leading-tight">
                {isBusiness ? 'Café Alameda' : 'Patrimonio Personal'}
              </span>
              <span className="text-[11px] text-on-surface-variant leading-tight">
                {isBusiness ? 'Sucursal Matriz' : 'Erick D.'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
