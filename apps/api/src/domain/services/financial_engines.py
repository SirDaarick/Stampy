from decimal import Decimal
from typing import Optional, NamedTuple
from pydantic import BaseModel


class PrimeCostResult(NamedTuple):
    cogs_amount: Decimal
    payroll_amount: Decimal
    total_sales: Decimal
    prime_cost_percentage: Decimal
    is_healthy: bool  # True if prime_cost <= 60%
    alert_level: str  # "OK", "WARNING", "CRITICAL"


class Budget503020Result(NamedTuple):
    total_income: Decimal
    needs_amount: Decimal
    wants_amount: Decimal
    savings_amount: Decimal
    needs_percentage: Decimal
    wants_percentage: Decimal
    savings_percentage: Decimal
    is_balanced: bool


class PrimeCostCalculator:
    """
    Calculadora del estándar de la industria gastronómica / PyME:
    Prime Cost = (Insumos + Nómina) / Ventas Netas.
    Objetivo: <= 60% de las ventas.
    """
    TARGET_THRESHOLD = Decimal("60.00")
    WARNING_THRESHOLD = Decimal("65.00")

    @classmethod
    def calculate(
        cls, 
        cogs_amount: Decimal, 
        payroll_amount: Decimal, 
        total_sales: Decimal
    ) -> PrimeCostResult:
        if total_sales <= Decimal("0"):
            return PrimeCostResult(
                cogs_amount=cogs_amount,
                payroll_amount=payroll_amount,
                total_sales=total_sales,
                prime_cost_percentage=Decimal("100.00"),
                is_healthy=False,
                alert_level="CRITICAL"
            )

        prime_sum = cogs_amount + payroll_amount
        percentage = (prime_sum / total_sales) * Decimal("100.00")
        percentage = round(percentage, 2)

        if percentage <= cls.TARGET_THRESHOLD:
            alert = "OK"
            healthy = True
        elif percentage <= cls.WARNING_THRESHOLD:
            alert = "WARNING"
            healthy = False
        else:
            alert = "CRITICAL"
            healthy = False

        return PrimeCostResult(
            cogs_amount=cogs_amount,
            payroll_amount=payroll_amount,
            total_sales=total_sales,
            prime_cost_percentage=percentage,
            is_healthy=healthy,
            alert_level=alert
        )


class Rule503020Calculator:
    """
    Calculadora de salud financiera para el Modo Personal.
    Distribuye ingresos en:
    50% Necesidades básicas
    30% Deseos / Ocio
    20% Ahorro e Inversión
    """
    @classmethod
    def calculate(
        cls,
        total_income: Decimal,
        needs_expenses: Decimal,
        wants_expenses: Decimal,
        savings_invested: Decimal
    ) -> Budget503020Result:
        if total_income <= Decimal("0"):
            return Budget503020Result(
                total_income=total_income,
                needs_amount=needs_expenses,
                wants_amount=wants_expenses,
                savings_amount=savings_invested,
                needs_percentage=Decimal("0.00"),
                wants_percentage=Decimal("0.00"),
                savings_percentage=Decimal("0.00"),
                is_balanced=False
            )

        needs_pct = round((needs_expenses / total_income) * Decimal("100.00"), 2)
        wants_pct = round((wants_expenses / total_income) * Decimal("100.00"), 2)
        savings_pct = round((savings_invested / total_income) * Decimal("100.00"), 2)

        # Se considera balanceado si necesidades <= 55% y ahorros >= 15%
        is_balanced = needs_pct <= Decimal("55.00") and savings_pct >= Decimal("15.00")

        return Budget503020Result(
            total_income=total_income,
            needs_amount=needs_expenses,
            wants_amount=wants_expenses,
            savings_amount=savings_invested,
            needs_percentage=needs_pct,
            wants_percentage=wants_pct,
            savings_percentage=savings_pct,
            is_balanced=is_balanced
        )


class OverpriceDetector:
    """
    Detecta sobreprecios en insumos recurrentes.
    Si el precio unitario nuevo supera en >= 15% el promedio histórico,
    levanta bandera de alerta.
    """
    THRESHOLD_PCT = Decimal("15.00")

    @classmethod
    def evaluate(
        cls, 
        current_unit_price: Decimal, 
        historical_average_price: Decimal
    ) -> tuple[bool, Decimal]:
        """
        Retorna (is_overpriced, variance_percentage)
        """
        if historical_average_price <= Decimal("0"):
            return False, Decimal("0.00")

        diff = current_unit_price - historical_average_price
        variance_pct = round((diff / historical_average_price) * Decimal("100.00"), 2)

        is_overpriced = variance_pct >= cls.THRESHOLD_PCT
        return is_overpriced, variance_pct
