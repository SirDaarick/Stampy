export interface SimulationResult {
  stamped_response: string
  supplier_name: string
  concept: string
  amount: string
  category: string
  is_overpriced: boolean
  audit_flags: string[]
}

export const DEMO_PRESETS = [
  {
    label: 'Insumo Normal ($450 Fruta)',
    text: 'Gasté $450 en fruta fresca en el mercado',
    mode: 'BUSINESS' as const,
  },
  {
    label: 'Alerta Sobreprecio (+70% Aguacate)',
    text: 'Compré 1kg de aguacate a $85.00',
    mode: 'BUSINESS' as const,
  },
  {
    label: 'Puente Sueldo ($25,000 Retiro)',
    text: 'Retiro de nómina $25,000',
    mode: 'BUSINESS' as const,
  },
  {
    label: 'Gasto Personal ($350 Despensa)',
    text: 'Pagué $350 en despensa de casa',
    mode: 'PERSONAL' as const,
  },
]

export async function simulateAudit(
  text: string,
  mode: 'BUSINESS' | 'PERSONAL'
): Promise<SimulationResult> {
  // 1. Intentar llamar a la API real de FastAPI si está disponible
  try {
    const res = await fetch('http://localhost:8000/api/v1/telegram/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: 12345678,
        text,
        active_mode: mode,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      const extraction = data.extraction || {}
      return {
        stamped_response: data.stamped_response || '[ ✦ AUDITADO // OK ]',
        supplier_name: extraction.supplier_name || 'Comercio Local',
        concept: extraction.items?.[0]?.description || 'Gasto registrado',
        amount: `$${(extraction.total || 450).toFixed(2)}`,
        category: mode === 'BUSINESS' ? 'Insumos' : 'Necesidades (50%)',
        is_overpriced: Boolean(data.audit_flags?.some((f: string) => f.includes('SOBREPRECIO'))),
        audit_flags: data.audit_flags || [],
      }
    }
  } catch {
    // Si la API no está corriendo, continuamos con el motor autónomo local
  }

  // 2. Motor autónomo local de respaldo para demo offline/Vercel
  const isOverpriced = text.toLowerCase().includes('aguacate')
  const isBridge = text.toLowerCase().includes('nómina') || text.toLowerCase().includes('sueldo') || text.toLowerCase().includes('retiro')

  let amount = '$450.00'
  let supplier = 'Central de Abastos'
  let concept = 'Insumo Fruta Fresca'
  let category = mode === 'BUSINESS' ? 'Insumos' : 'Necesidades (50%)'

  if (isBridge) {
    amount = '$25,000.00'
    supplier = 'Puente del Sueldo del Dueño'
    concept = 'Nómina / Retiro del Dueño'
    category = 'Nómina Operativa'
  } else if (isOverpriced) {
    amount = '$85.00'
    supplier = 'Distribuidora del Centro'
    concept = 'Aguacate Hass 1kg'
    category = 'Insumos'
  }

  const flags: string[] = []
  if (isOverpriced) {
    flags.push('ALERTA_SOBREPRECIO: Aguacate subió +70.0% vs histórico de $50.00')
  }
  if (isBridge) {
    flags.push('✦ Puente del Sueldo ejecutado: Nómina negocio -> Ingreso personal')
  }

  const header = isOverpriced ? '[ ⚠️ AUDITADO // CON ADVERTENCIA ]' : '[ ✦ AUDITADO // OK ]'
  const modeLabel = mode === 'BUSINESS' ? '👔 MODO NEGOCIO (FinOps)' : '🧢 MODO PERSONAL (Wealth)'

  const stamped = `${header}
${modeLabel}
📍 Proveedor: ${supplier}
📦 Desglose: 1x ${concept} — ${amount} MXN
💵 Total: ${amount} MXN
${flags.length > 0 ? '\n🔍 Telemetría:\n• ' + flags.join('\n• ') : ''}`

  return {
    stamped_response: stamped,
    supplier_name: supplier,
    concept,
    amount,
    category,
    is_overpriced: isOverpriced,
    audit_flags: flags,
  }
}
