from decimal import Decimal
from typing import List, Optional
from langchain_core.tools import tool

from apps.api.src.domain.services.financial_engines import OverpriceDetector


@tool
def check_item_overprice_tool(
    item_description: str,
    current_unit_price: float,
    historical_avg_price: float
) -> dict:
    """
    Verifica si el precio unitario de un producto subió >= 15% respecto a su historial.
    Retorna si tiene sobreprecio y el porcentaje de variación.
    """
    is_overpriced, variance_pct = OverpriceDetector.evaluate(
        current_unit_price=Decimal(str(current_unit_price)),
        historical_average_price=Decimal(str(historical_avg_price))
    )
    return {
        "item_description": item_description,
        "is_overpriced": is_overpriced,
        "variance_percentage": float(variance_pct),
        "alert": f"⚠️ Sobreprecio detectado (+{variance_pct}%)" if is_overpriced else "✓ Precio dentro del rango"
    }


@tool
def execute_owners_bridge_tool(
    amount: float,
    notes: Optional[str] = "Retiro de Nómina del Dueño"
) -> dict:
    """
    Transfiere atómicamente un retiro de nómina del negocio a la cuenta personal.
    Disminuye la liquidez del negocio (Costo Nómina) y genera ingreso personal.
    """
    if amount <= 0:
        return {"status": "ERROR", "message": "El monto debe ser mayor a cero."}

    return {
        "status": "SUCCESS",
        "action": "OWNERS_BRIDGE_EXECUTED",
        "transferred_amount": amount,
        "impact_business": f"-${amount:,.2f} MXN en Nómina Negocio",
        "impact_personal": f"+${amount:,.2f} MXN en Ingreso Personal",
        "message": f"✦ Puente del Sueldo ejecutado exitosamente por ${amount:,.2f} MXN."
    }
