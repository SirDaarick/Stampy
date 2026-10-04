from typing import Annotated, Literal, Optional, List
from typing_extensions import TypedDict
from pydantic import BaseModel, Field
from langgraph.graph.message import add_messages


class ExpenseItemDraft(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price: float
    total_line: float
    category: str
    suggested_bucket: Literal[
        "PRIME_INSUMO", 
        "PRIME_NOMINA", 
        "GASTO_OPERATIVO", 
        "PERSONAL_NEED_50", 
        "PERSONAL_WANT_30", 
        "PERSONAL_SAVINGS_20"
    ] = "PRIME_INSUMO"
    is_overpriced: bool = False
    price_variance_pct: Optional[float] = None


class TicketExtraction(BaseModel):
    supplier_name: Optional[str] = "Comercio / Proveedor General"
    tax_id: Optional[str] = None
    date: Optional[str] = None
    items: List[ExpenseItemDraft] = Field(default_factory=list)
    subtotal: float = 0.0
    tax: float = 0.0
    total: float = 0.0
    confidence_score: float = 0.95


class StampyAgentState(TypedDict):
    messages: Annotated[list, add_messages]
    user_id: str
    telegram_chat_id: int
    active_mode: Literal["BUSINESS", "PERSONAL"]
    raw_input_text: Optional[str]
    media_url: Optional[str]
    media_type: Optional[Literal["PHOTO", "VOICE", "TEXT", "COMMAND"]]
    extraction: Optional[TicketExtraction]
    audit_flags: List[str]
    recorded_expense_id: Optional[str]
    stamped_response: Optional[str]
