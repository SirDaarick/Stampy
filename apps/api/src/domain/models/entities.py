import enum
import uuid
from datetime import datetime, date, timezone
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import (
    String, 
    Numeric, 
    Boolean, 
    ForeignKey, 
    DateTime, 
    Date, 
    BigInteger, 
    Enum as SQLEnum,
    Text,
    JSON,
    Uuid
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from apps.api.src.infrastructure.database.session import Base


class WorkspaceType(str, enum.Enum):
    BUSINESS = "BUSINESS"
    PERSONAL = "PERSONAL"


class ExpenseStatus(str, enum.Enum):
    PENDING = "PENDING"
    AUDITED = "AUDITED"
    REJECTED = "REJECTED"


class BudgetBucket(str, enum.Enum):
    # Prime Cost (Negocio: Insumos + Nómina <= 60%)
    PRIME_INSUMO = "PRIME_INSUMO"
    PRIME_NOMINA = "PRIME_NOMINA"
    GASTO_OPERATIVO = "GASTO_OPERATIVO"
    
    # Regla 50/30/20 (Personal)
    PERSONAL_NEED_50 = "PERSONAL_NEED_50"
    PERSONAL_WANT_30 = "PERSONAL_WANT_30"
    PERSONAL_SAVINGS_20 = "PERSONAL_SAVINGS_20"


class IncomeType(str, enum.Enum):
    BASE_SALARY = "BASE_SALARY"
    FREELANCE = "FREELANCE"
    INVESTMENT = "INVESTMENT"
    OWNERS_DRAW = "OWNERS_DRAW"  # Proveniente del Puente del Sueldo


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True, nullable=False)
    username: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    first_name: Mapped[str] = mapped_column(String(150), nullable=False)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relaciones
    workspaces: Mapped[List["Workspace"]] = relationship(
        "Workspace", back_populates="user", cascade="all, delete-orphan"
    )


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[WorkspaceType] = mapped_column(
        SQLEnum(WorkspaceType), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="MXN", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relaciones
    user: Mapped["User"] = relationship("User", back_populates="workspaces")
    expenses: Mapped[List["Expense"]] = relationship(
        "Expense", back_populates="workspace", cascade="all, delete-orphan"
    )
    suppliers: Mapped[List["Supplier"]] = relationship(
        "Supplier", back_populates="workspace", cascade="all, delete-orphan"
    )
    income_sources: Mapped[List["IncomeSource"]] = relationship(
        "IncomeSource", back_populates="workspace", cascade="all, delete-orphan"
    )


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    tax_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # RFC / NIF
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relaciones
    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="suppliers")
    expenses: Mapped[List["Expense"]] = relationship("Expense", back_populates="supplier")


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    supplier_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False, index=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    status: Mapped[ExpenseStatus] = mapped_column(
        SQLEnum(ExpenseStatus), default=ExpenseStatus.AUDITED, nullable=False, index=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw_transcription: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relaciones
    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="expenses")
    supplier: Mapped[Optional["Supplier"]] = relationship("Supplier", back_populates="expenses")
    items: Mapped[List["ExpenseItem"]] = relationship(
        "ExpenseItem", back_populates="expense", cascade="all, delete-orphan"
    )
    receipt_media: Mapped[Optional["ReceiptMedia"]] = relationship(
        "ReceiptMedia", back_populates="expense", uselist=False, cascade="all, delete-orphan"
    )


class ExpenseItem(Base):
    __tablename__ = "expense_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    expense_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    description: Mapped[str] = mapped_column(String(250), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 3), default=Decimal("1.000"), nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_line: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    bucket: Mapped[BudgetBucket] = mapped_column(
        SQLEnum(BudgetBucket), nullable=False, index=True
    )
    
    # Flags de Auditoría / Anomalías
    is_overpriced: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    price_variance_pct: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2), nullable=True)

    # Relaciones
    expense: Mapped["Expense"] = relationship("Expense", back_populates="items")


class ReceiptMedia(Base):
    __tablename__ = "receipt_media"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    expense_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("expenses.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    storage_key: Mapped[str] = mapped_column(String(500), nullable=False)  # S3 Object Key
    mime_type: Mapped[str] = mapped_column(String(100), default="image/jpeg", nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    raw_ocr_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relaciones
    expense: Mapped["Expense"] = relationship("Expense", back_populates="receipt_media")


class IncomeSource(Base):
    __tablename__ = "income_sources"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_name: Mapped[str] = mapped_column(String(150), nullable=False)
    type: Mapped[IncomeType] = mapped_column(SQLEnum(IncomeType), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relaciones
    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="income_sources")


class OwnersBridgeLink(Base):
    """
    Enlace Atómico e Idempotente del 'Puente del Sueldo del Dueño'.
    Conecta una partida de nómina retirada en el Workspace de Negocio
    con una partida de ingreso registrada en el Workspace Personal.
    """
    __tablename__ = "owners_bridge_links"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    business_expense_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("expenses.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    personal_income_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("income_sources.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    transferred_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
