import re
from typing import Dict, Any
from langchain_core.messages import AIMessage

from apps.api.src.application.agent.state import (
    StampyAgentState,
    TicketExtraction,
    ExpenseItemDraft
)
from apps.api.src.application.agent.tools import check_item_overprice_tool, execute_owners_bridge_tool


# Precios históricos de referencia para detectar sobreprecios en el MVP
HISTORICAL_PRICES = {
    "aguacate": 50.0,
    "cafe": 120.0,
    "leche": 25.0,
    "aceite": 40.0,
    "huevo": 45.0
}


def node_intake_router(state: StampyAgentState) -> Dict[str, Any]:
    """Identifica la naturaleza de la entrada del usuario."""
    text = (state.get("raw_input_text") or "").strip().lower()
    media_type = state.get("media_type")

    if not media_type:
        if "retiro" in text or "sueldo" in text or "nómina" in text or "nomina" in text:
            detected_type = "COMMAND"
        else:
            detected_type = "TEXT"
    else:
        detected_type = media_type

    return {"media_type": detected_type}


def node_extract_and_audit(state: StampyAgentState) -> Dict[str, Any]:
    """
    Simula o ejecuta la extracción estructurada del ticket.
    Soporta extracción por texto ("Gasté $450 en fruta") o inferencia visual/multimodal.
    """
    text = state.get("raw_input_text") or ""
    active_mode = state.get("active_mode", "BUSINESS")

    # Si ya venía una extracción inyectada (ej: desde webhook con Gemini), la usamos
    if state.get("extraction"):
        return {"extraction": state["extraction"]}

    # Caso: Comando de Retiro de Nómina del Dueño
    if state.get("media_type") == "COMMAND":
        amount_match = re.search(r"\$?([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)", text)
        amount = float(amount_match.group(1).replace(",", "")) if amount_match else 0.0
        
        extraction = TicketExtraction(
            supplier_name="Puente del Sueldo del Dueño",
            total=amount,
            subtotal=amount,
            items=[
                ExpenseItemDraft(
                    description="Retiro de Nómina del Dueño",
                    quantity=1.0,
                    unit_price=amount,
                    total_line=amount,
                    category="Nómina",
                    suggested_bucket="PRIME_NOMINA"
                )
            ]
        )
        return {"extraction": extraction}

    # Caso: Extracción por Texto ("Gasté $450 en fruta")
    amount_match = re.search(r"\$?([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)", text)
    total_amount = float(amount_match.group(1).replace(",", "")) if amount_match else 100.0

    # Determinar concepto básico
    clean_text = re.sub(r"(gasté|gaste|pague|compré|compre|\$?[0-9]+(\.[0-9]+)?|en|de)", "", text, flags=re.IGNORECASE).strip()
    item_desc = clean_text.title() if clean_text else "Gasto General"

    bucket = "PRIME_INSUMO" if active_mode == "BUSINESS" else "PERSONAL_NEED_50"

    extraction = TicketExtraction(
        supplier_name="Comercio Local / Varios",
        total=total_amount,
        subtotal=total_amount,
        items=[
            ExpenseItemDraft(
                description=item_desc,
                quantity=1.0,
                unit_price=total_amount,
                total_line=total_amount,
                category="Insumo" if active_mode == "BUSINESS" else "Despensa",
                suggested_bucket=bucket
            )
        ]
    )

    return {"extraction": extraction}


def node_anomaly_detector(state: StampyAgentState) -> Dict[str, Any]:
    """Evalúa coherencia de precios y sobreprecios en proveedores."""
    extraction = state.get("extraction")
    if not extraction:
        return {"audit_flags": []}

    flags = []

    # 1. Chequeo de sobreprecios en partidas
    for item in extraction.items:
        desc_lower = item.description.lower()
        for key, hist_price in HISTORICAL_PRICES.items():
            if key in desc_lower:
                res = check_item_overprice_tool.invoke({
                    "item_description": item.description,
                    "current_unit_price": item.unit_price,
                    "historical_avg_price": hist_price
                })
                if res["is_overpriced"]:
                    item.is_overpriced = True
                    item.price_variance_pct = res["variance_percentage"]
                    flags.append(f"ALERTA_SOBREPRECIO: {item.description} subió +{res['variance_percentage']}%")

    # 2. Chequeo de cuadratura de totales
    items_sum = sum(i.total_line for i in extraction.items)
    if extraction.total > 0 and abs(items_sum - extraction.subtotal) > 1.0:
        flags.append(f"DISCREPANCIA_TOTALES: Suma partidas (${items_sum:.2f}) difiere del subtotal (${extraction.subtotal:.2f})")

    return {"audit_flags": flags, "extraction": extraction}


def node_execute_tools(state: StampyAgentState) -> Dict[str, Any]:
    """Ejecuta acciones contables deterministas."""
    media_type = state.get("media_type")
    extraction = state.get("extraction")

    if media_type == "COMMAND" and extraction and extraction.total > 0:
        res = execute_owners_bridge_tool.invoke({
            "amount": extraction.total,
            "notes": "Retiro automatizado vía comando de Stampy"
        })
        return {"audit_flags": state.get("audit_flags", []) + [res["message"]]}

    return {}


def node_format_stamp(state: StampyAgentState) -> Dict[str, Any]:
    """Construye la respuesta final con el sello icónico de Stampy."""
    extraction = state.get("extraction")
    active_mode = state.get("active_mode", "BUSINESS")
    flags = state.get("audit_flags", [])

    is_warning = any("SOBREPRECIO" in f or "DISCREPANCIA" in f for f in flags)
    stamp_header = "[ ⚠️ AUDITADO // CON ADVERTENCIA ]" if is_warning else "[ ✦ AUDITADO // OK ]"

    mode_label = "👔 MODO NEGOCIO (FinOps)" if active_mode == "BUSINESS" else "🧢 MODO PERSONAL (Wealth)"

    lines = [
        f"**{stamp_header}**",
        f"*{mode_label}*",
        f"📍 **Proveedor:** {extraction.supplier_name if extraction else 'Comercio General'}",
    ]

    if extraction and extraction.items:
        lines.append("\n📦 **Desglose de Partidas:**")
        for item in extraction.items:
            flag_marker = f" 🚨 (+{item.price_variance_pct}%)" if item.is_overpriced else ""
            lines.append(f"  • {item.quantity}x {item.description} — ${item.total_line:,.2f} MXN ({item.suggested_bucket}){flag_marker}")

        lines.append(f"\n💵 **Total:** ${extraction.total:,.2f} MXN")

    if flags:
        lines.append("\n🔍 **Telemetría de Auditoría:**")
        for flag in flags:
            lines.append(f"  • {flag}")

    lines.append("\n*Revisa tus métricas actualizadas en el Dashboard Web.*")
    response_text = "\n".join(lines)

    return {
        "stamped_response": response_text,
        "messages": [AIMessage(content=response_text)]
    }
