import pytest
from apps.api.src.application.agent import stampy_agent, create_stampy_graph
from langgraph.checkpoint.memory import MemorySaver


def test_stampy_agent_audits_clean_expense():
    config = {"configurable": {"thread_id": "test-chat-123"}}
    initial_state = {
        "messages": [],
        "user_id": "usr-1",
        "telegram_chat_id": 12345678,
        "active_mode": "BUSINESS",
        "raw_input_text": "Gasté $450 en fruta",
        "media_type": "TEXT"
    }

    result = stampy_agent.invoke(initial_state, config)

    assert result["stamped_response"] is not None
    assert "[ ✦ AUDITADO // OK ]" in result["stamped_response"]
    assert "450.00 MXN" in result["stamped_response"]
    assert "PRIME_INSUMO" in result["stamped_response"]
    assert "MODO NEGOCIO" in result["stamped_response"]


def test_stampy_agent_detects_overprice_anomaly():
    config = {"configurable": {"thread_id": "test-chat-overprice"}}
    # El precio habitual de aguacate es $50.00 -> $85.00 es un +70% de sobreprecio
    initial_state = {
        "messages": [],
        "user_id": "usr-1",
        "telegram_chat_id": 999888,
        "active_mode": "BUSINESS",
        "raw_input_text": "Gasté $85 en aguacate",
        "media_type": "TEXT"
    }

    result = stampy_agent.invoke(initial_state, config)

    response = result["stamped_response"]
    assert "[ ⚠️ AUDITADO // CON ADVERTENCIA ]" in response
    assert "ALERTA_SOBREPRECIO" in response or "🚨 (+70.0%)" in response
    assert "Aguacate" in response


def test_stampy_agent_personal_mode_bucket():
    config = {"configurable": {"thread_id": "test-chat-personal"}}
    initial_state = {
        "messages": [],
        "user_id": "usr-2",
        "telegram_chat_id": 555444,
        "active_mode": "PERSONAL",
        "raw_input_text": "Pagué $300 en despensa",
        "media_type": "TEXT"
    }

    result = stampy_agent.invoke(initial_state, config)

    response = result["stamped_response"]
    assert "[ ✦ AUDITADO // OK ]" in response
    assert "PERSONAL_NEED_50" in response
    assert "MODO PERSONAL" in response


def test_stampy_agent_executes_owners_bridge_command():
    config = {"configurable": {"thread_id": "test-chat-bridge"}}
    initial_state = {
        "messages": [],
        "user_id": "usr-1",
        "telegram_chat_id": 111222,
        "active_mode": "BUSINESS",
        "raw_input_text": "Retiro de nómina $18,000",
        "media_type": "COMMAND"
    }

    result = stampy_agent.invoke(initial_state, config)

    response = result["stamped_response"]
    assert "Puente del Sueldo ejecutado exitosamente" in response
    assert "18,000" in response


def test_stampy_agent_persists_conversation_thread():
    checkpointer = MemorySaver()
    graph = create_stampy_graph(checkpointer=checkpointer)
    config = {"configurable": {"thread_id": "persistent-conversation-thread"}}

    # Turno 1: Gasto 1
    state_1 = {
        "messages": [],
        "user_id": "usr-1",
        "telegram_chat_id": 777,
        "active_mode": "BUSINESS",
        "raw_input_text": "Gasté $25 en leche",
        "media_type": "TEXT"
    }
    res_1 = graph.invoke(state_1, config)
    assert "[ ✦ AUDITADO // OK ]" in res_1["stamped_response"]

    # Turno 2: Gasto 2 en el mismo thread
    state_2 = {
        "raw_input_text": "Gasté $200 en pan",
        "media_type": "TEXT"
    }
    res_2 = graph.invoke(state_2, config)
    assert "[ ✦ AUDITADO // OK ]" in res_2["stamped_response"]

    # Verificar que el historial acumuló los mensajes
    assert len(res_2["messages"]) >= 2
