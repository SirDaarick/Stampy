// src/demo/mockApiHandler.ts
// Manejador de llamadas a la API en modo demostración para Stampy.

import { mockDb, type ReceiptRecord } from './mockDatabase';

export interface TelegramSimulatePayload {
  chat_id: number;
  text: string;
  active_mode: 'BUSINESS' | 'PERSONAL';
}

export interface TelegramSimulateResponse {
  success: boolean;
  stamped_response: string;
  parsed_data: {
    vendor: string;
    category: string;
    amount: number;
    mode: 'BUSINESS' | 'PERSONAL';
    is_deductible: boolean;
  };
  record: ReceiptRecord;
}

export async function handleDemoTelegramSimulate(
  payload: TelegramSimulatePayload
): Promise<TelegramSimulateResponse> {
  // Simulación de latencia realista de 180ms
  await new Promise((resolve) => setTimeout(resolve, 200));

  const text = payload.text || '';
  const mode = payload.active_mode;

  // 1. Extracción de monto numérico
  const numMatch = text.match(/\$?\s*(\d+([.,]\d{1,2})?)/);
  const amount = numMatch ? parseFloat(numMatch[1].replace(',', '.')) : 450.00;

  // 2. Clasificación semántica de negocio vs personal
  const lower = text.toLowerCase();
  let vendor = 'Comercio Local / Varios';
  let category = mode === 'BUSINESS' ? 'Insumos Generales' : 'Gasto Personal';
  const isDeductible = mode === 'BUSINESS';

  if (
    lower.includes('insumo') ||
    lower.includes('cocina') ||
    lower.includes('fruta') ||
    lower.includes('carne') ||
    lower.includes('verdura') ||
    lower.includes('alimento')
  ) {
    vendor = mode === 'BUSINESS' ? 'Central de Abastos S.A.' : 'Supermercado Central';
    category = mode === 'BUSINESS' ? 'Insumo Cocina' : 'Despensa Personal';
  } else if (
    lower.includes('uber') ||
    lower.includes('transporte') ||
    lower.includes('taxi') ||
    lower.includes('viaje')
  ) {
    vendor = 'Uber Technologies Inc.';
    category = mode === 'BUSINESS' ? 'Transporte & Visita' : 'Movilidad Privada';
  } else if (
    lower.includes('gasolina') ||
    lower.includes('shell') ||
    lower.includes('pemex') ||
    lower.includes('combustible')
  ) {
    vendor = 'Gasolinera Shell #402';
    category = mode === 'BUSINESS' ? 'Combustible Operativo' : 'Gasolina Auto Propio';
  } else if (lower.includes('luz') || lower.includes('cfe') || lower.includes('oficina')) {
    vendor = 'CFE Suministrador Básicos';
    category = 'Gasto Fijo Oficina';
  } else if (
    lower.includes('despensa') ||
    lower.includes('hogar') ||
    lower.includes('casa')
  ) {
    vendor = 'Supermercado Central';
    category = 'Despensa Personal';
  } else if (
    lower.includes('café') ||
    lower.includes('cine') ||
    lower.includes('cena') ||
    lower.includes('restaurante')
  ) {
    vendor = 'Restaurante / Ocio';
    category = mode === 'BUSINESS' ? 'Alimentos & Representación' : 'Ocio sin culpa';
  }

  // 3. Insertar en la base de datos local
  const record = mockDb.insertReceipt({
    name: vendor,
    category,
    amount,
    status: '[ ✦ OK ]',
    time: 'Hace un momento',
    mode,
    isDeductible,
  });

  const formattedMoney = `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
  const stamped_response = `[ ✦ AUDITADO // OK ]\n${formattedMoney} MXN registrado en ${category} (${mode}).`;

  return {
    success: true,
    stamped_response,
    parsed_data: {
      vendor,
      category,
      amount,
      mode,
      is_deductible: isDeductible,
    },
    record,
  };
}
