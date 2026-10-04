import pytest
import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from apps.api.src.infrastructure.database.session import Base
from apps.api.src.domain.models import (
    User,
    Workspace,
    WorkspaceType,
    Expense,
    IncomeSource,
    IncomeType,
    BudgetBucket,
    OwnersBridgeLink
)
from apps.api.src.application.use_cases.owners_bridge import OwnersBridgeService


@pytest.fixture
async def async_test_session():
    # SQLite async in-memory test engine
    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async_session = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest.mark.asyncio
async def test_owners_bridge_atomicity_and_link(async_test_session: AsyncSession):
    session = async_test_session

    # 1. Setup User
    user = User(telegram_id=987654321, first_name="Erick")
    session.add(user)
    await session.flush()

    # 2. Setup 1 Business + 1 Personal Workspace
    biz_ws = Workspace(user_id=user.id, type=WorkspaceType.BUSINESS, name="Cafetería Stampy")
    pers_ws = Workspace(user_id=user.id, type=WorkspaceType.PERSONAL, name="Patrimonio Personal Erick")
    session.add_all([biz_ws, pers_ws])
    await session.flush()

    # 3. Execute Owner's Bridge transfer of $15,000 MXN
    amount = Decimal("15000.00")
    result = await OwnersBridgeService.execute_transfer(
        session=session,
        business_workspace_id=biz_ws.id,
        personal_workspace_id=pers_ws.id,
        amount=amount
    )
    await session.commit()

    assert result.amount == amount

    # 4. Assert Business Expense created
    stmt_expense = select(Expense).where(Expense.id == result.business_expense_id)
    expense = (await session.execute(stmt_expense)).scalar_one()
    assert expense.total_amount == amount
    assert expense.workspace_id == biz_ws.id

    # 5. Assert Personal Income created
    stmt_income = select(IncomeSource).where(IncomeSource.id == result.personal_income_id)
    income = (await session.execute(stmt_income)).scalar_one()
    assert income.amount == amount
    assert income.type == IncomeType.OWNERS_DRAW
    assert income.workspace_id == pers_ws.id

    # 6. Assert Link exists
    stmt_link = select(OwnersBridgeLink).where(OwnersBridgeLink.id == result.bridge_link_id)
    link = (await session.execute(stmt_link)).scalar_one()
    assert link.business_expense_id == expense.id
    assert link.personal_income_id == income.id
    assert link.amount == amount


@pytest.mark.asyncio
async def test_owners_bridge_rejects_zero_or_negative_amount(async_test_session: AsyncSession):
    session = async_test_session
    dummy_id = uuid.uuid4()

    with pytest.raises(ValueError, match="estrictamente mayor a cero"):
        await OwnersBridgeService.execute_transfer(
            session=session,
            business_workspace_id=dummy_id,
            personal_workspace_id=dummy_id,
            amount=Decimal("0.00")
        )
