from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from apps.api.src.application.agent.state import StampyAgentState
from apps.api.src.application.agent.nodes import (
    node_intake_router,
    node_extract_and_audit,
    node_anomaly_detector,
    node_execute_tools,
    node_format_stamp
)


def create_stampy_graph(checkpointer=None):
    """
    Construye y compila el flujo dirigido del Agente Stampy.
    
    Flujo:
    START -> intake_router -> extract_and_audit -> anomaly_detector -> execute_tools -> format_stamp -> END
    """
    workflow = StateGraph(StampyAgentState)

    # 1. Registro de Nodos
    workflow.add_node("intake_router", node_intake_router)
    workflow.add_node("extract_and_audit", node_extract_and_audit)
    workflow.add_node("anomaly_detector", node_anomaly_detector)
    workflow.add_node("execute_tools", node_execute_tools)
    workflow.add_node("format_stamp", node_format_stamp)

    # 2. Conexión de Aristas (Edges)
    workflow.add_edge(START, "intake_router")
    workflow.add_edge("intake_router", "extract_and_audit")
    workflow.add_edge("extract_and_audit", "anomaly_detector")
    workflow.add_edge("anomaly_detector", "execute_tools")
    workflow.add_edge("execute_tools", "format_stamp")
    workflow.add_edge("format_stamp", END)

    # 3. Compilación con Checkpointer (MemorySaver o PostgresSaver)
    cp = checkpointer if checkpointer is not None else MemorySaver()
    return workflow.compile(checkpointer=cp)


# Instancia singleton precompilada para invocaciones estándar
stampy_agent = create_stampy_graph()
