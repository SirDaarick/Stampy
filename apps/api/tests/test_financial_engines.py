from decimal import Decimal
from apps.api.src.domain.services.financial_engines import (
    PrimeCostCalculator,
    Rule503020Calculator,
    OverpriceDetector
)


def test_prime_cost_under_60_percent_is_healthy():
    # Ventas: $10,000 | Insumos: $3,000 (30%) | Nómina: $2,400 (24%) -> Prime Cost: 54%
    result = PrimeCostCalculator.calculate(
        cogs_amount=Decimal("3000.00"),
        payroll_amount=Decimal("2400.00"),
        total_sales=Decimal("10000.00")
    )
    assert result.is_healthy is True
    assert result.alert_level == "OK"
    assert result.prime_cost_percentage == Decimal("54.00")


def test_prime_cost_over_65_percent_is_critical():
    # Ventas: $10,000 | Insumos: $4,500 | Nómina: $3,000 -> Prime Cost: 75% (Riesgo inminente de quiebra)
    result = PrimeCostCalculator.calculate(
        cogs_amount=Decimal("4500.00"),
        payroll_amount=Decimal("3000.00"),
        total_sales=Decimal("10000.00")
    )
    assert result.is_healthy is False
    assert result.alert_level == "CRITICAL"
    assert result.prime_cost_percentage == Decimal("75.00")


def test_prime_cost_zero_sales_handled_safely():
    result = PrimeCostCalculator.calculate(
        cogs_amount=Decimal("1500.00"),
        payroll_amount=Decimal("2000.00"),
        total_sales=Decimal("0.00")
    )
    assert result.is_healthy is False
    assert result.alert_level == "CRITICAL"


def test_50_30_20_balanced_distribution():
    # Ingreso: $30,000 | Necesidades: $14,000 (46.67%) | Deseos: $8,500 (28.33%) | Ahorro: $7,500 (25%)
    result = Rule503020Calculator.calculate(
        total_income=Decimal("30000.00"),
        needs_expenses=Decimal("14000.00"),
        wants_expenses=Decimal("8500.00"),
        savings_invested=Decimal("7500.00")
    )
    assert result.is_balanced is True
    assert result.needs_percentage == Decimal("46.67")
    assert result.wants_percentage == Decimal("28.33")
    assert result.savings_percentage == Decimal("25.00")


def test_overprice_detector_flags_variance_above_15_percent():
    # Precio habitual de aguacate: $50.00/kg -> Nuevo precio en ticket: $60.00/kg (+20%)
    is_overpriced, variance_pct = OverpriceDetector.evaluate(
        current_unit_price=Decimal("60.00"),
        historical_average_price=Decimal("50.00")
    )
    assert is_overpriced is True
    assert variance_pct == Decimal("20.00")


def test_overprice_detector_accepts_normal_variance():
    # Precio habitual: $50.00/kg -> Nuevo precio: $52.00/kg (+4%)
    is_overpriced, variance_pct = OverpriceDetector.evaluate(
        current_unit_price=Decimal("52.00"),
        historical_average_price=Decimal("50.00")
    )
    assert is_overpriced is False
    assert variance_pct == Decimal("4.00")
