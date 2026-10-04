# 🧾 STAMPY

> **Auditor Financiero & Gestor de Gastos Inteligente vía Telegram**  
> *Separación estricta de finanzas de Negocio vs Personales con validación determinista y auditoría en tiempo real.*

---

## 💡 El Problema
Los profesionales independientes y emprendedores enfrentan descontrol financiero al mezclar gastos personales con compras de negocio. Registrar gastos en hojas de cálculo o apps complejas toma demasiado tiempo, provocando pérdida de deducciones fiscales y descuadres contables a fin de mes.

## 🚀 La Solución
**Stampy** permite registrar tickets y notas de compra en segundos a través de un bot de **Telegram**. 
- Clasifica automáticamente el gasto en la categoría correspondiente.
- Permite alternar entre **Modo Negocio (`BUSINESS`)** y **Modo Personal (`PERSONAL`)** al vuelo.
- Audita y sella cada transacción con validación de montos e impuestos.
- Proporciona un dashboard retro-industrial táctil para visualizar el flujo en vivo.

---

## 🛠️ Arquitectura y Stack

El proyecto está organizado como un **Monorepo** modular:

```text
stampy/
├── apps/
│   ├── web/           # Frontend SPA (React 19 + Vite + Tailwind CSS + Lucide)
│   └── api/           # Backend (FastAPI + Pydantic + Uvicorn)
├── docker-compose.yml # Orquestación local para servicios y base de datos
├── vercel.json        # Configuración para despliegue de frontend en Vercel
└── package.json       # Orquestador de scripts monorepo
```

### Tecnologías:
- **Frontend (`apps/web`)**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite.
- **Backend (`apps/api`)**: Python 3.12+, FastAPI, Uvicorn, Pydantic v2.
- **Bot Integration**: Telegram Bot API Webhooks & Long-polling.

---

## ⚡ Inicio Rápido (Local)

### 1. Clonar el repositorio
```bash
git clone https://github.com/SirDaarick/Stampy.git
cd Stampy
```

### 2. Frontend
```bash
npm run dev --prefix apps/web
```
La aplicación web estará disponible en `http://localhost:5173`.

### 3. Backend (API)
```bash
cd apps/api
python -m venv .venv
# Activar entorno virtual
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
La API estará disponible en `http://localhost:8000`.

---

## ☁️ Despliegue en Vercel

El frontend está listo para desplegarse en [Vercel](https://vercel.com):
1. Importar el repositorio desde GitHub (`SirDaarick/Stampy`).
2. Vercel detectará automáticamente `vercel.json` y la configuración de `apps/web`.
3. Dominio asignado: `stampy.vercel.app`.

---

## 📄 Licencia
MIT © Erick Daniel (SirDaarick)
