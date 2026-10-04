// src/demo/isDemoMode.ts
// Fuente única de verdad para detectar el modo demostración autónomo.

export function isDemoActive(): boolean {
  // 1. Variable explícita de entorno VITE_DEMO_MODE o VITE_MODO_DEMO
  const viteDemoMode = import.meta.env?.VITE_DEMO_MODE || import.meta.env?.VITE_MODO_DEMO;
  if (String(viteDemoMode ?? '').toLowerCase() === 'true' || viteDemoMode === '1') {
    return true;
  }

  // 2. Variable estándar DEMO_MODE
  const demoMode = import.meta.env?.DEMO_MODE;
  if (String(demoMode ?? '').toLowerCase() === 'true' || demoMode === '1') {
    return true;
  }

  // 3. Fallback inteligente en producción (Vercel) si no se configuró URL de API backend
  const apiUrl = import.meta.env?.VITE_API_URL;
  if (import.meta.env?.PROD && (!apiUrl || apiUrl.includes('localhost'))) {
    return true;
  }

  return false;
}

export default isDemoActive;
