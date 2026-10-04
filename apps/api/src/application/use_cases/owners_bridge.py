import uuid
from datetime import date
from decimal import Decimal
from typing import NamedTuple
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.src.domain.models import (
    Expense,
    ExpenseItem,
    ExpenseStatus,
    BudgetBucket,
    IncomeSource,
    IncomeType,
    OwnersBridgeLink
)


class OwnersBridgeExecutionResult(NamedTuple):
    bridge_link_id: uuid.UUID
    business_expense_id: uuid.UUID
    personal_income_id: uuid.UUID
    amount: Decimal


class OwnersBridgeService:
    """
    Servicio de orquestación atómica para el Puente del Sueldo del Dueño.
    Regla: Retirar nómina de la empresa reduce la liquidez operativa y
    alimenta de inmediato el patrimonio personal sin requerir doble captura.
    """

    @classmethod
    async def execute_transfer(
        cls,
        session: AsyncSession,
        business_workspace_id: uuid.UUID,
        personal_workspace_id: uuid.UUID,
        amount: Decimal,
        notes: str = "Retiro de Nómina del Dueño (Puente Atómico)"
    ) -> OwnersBridgeExecutionResult:
        if amount <= Decimal("0"):
            raise ValueError("El monto del retiro de nómina debe ser estrictamente mayor a cero.")

        # 1. Crear Gasto de Nómina en el Negocio (Prime Cost)
        business_expense = Expense(
            workspace_id=business_workspace_id,
            total_amount=amount,
            date=date.today(),
            status=ExpenseStatus.AUDITED,
            notes=notes,
            raw_transcription="Transferencia de nómina del dueño ejecutada vía Puente Atómico"
        )
        session.add(business_expense)
        await session.flush()

        # Partida de Prime Cost Nómina
        expense_line = ExpenseItem(
            expense_id=business_expense.id,
            description="Nómina / Retiro del Dueño",
            quantity=Decimal("1.000"),
            unit_price=amount,
            total_line=amount,
            category="Nómina",
            bucket=BudgetBucket.PRIME_NOMINA
        )
        session.add(expense_line)

        # 2. Crear Ingreso en el Patrimonio Personal
        personal_income = IncomeSource(
            workspace_id=personal_workspace_id,
            source_name="Sueldo del Negocio (Owner's Draw)",
            type=IncomeType.OWNERS_DRAW,
            amount=amount,
            date=date.today()
        )
        session.add(personal_income)
        await session.flush()

        # 3. Enlazar Atómicamente ambos registros
        bridge_link = OwnersBridgeLink(
            business_expense_id=business_expense.id,
            personal_income_id=personal_income.id,
            amount=amount
        )
        session.add(bridge_link)
        await session.flush()

        return OwnersBridgeExecutionResult(
            bridge_link_id=bridge_link.id,
            business_expense_id=business_expense.id,
            personal_income_id=personal_income.id,
            amount=amount
        )
