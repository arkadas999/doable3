# 🏗️ Doable Architecture Specification

Doable is designed as a unified, ultra-lightweight web application using a modern monolithic design pattern. It combines a fast backend framework with a Vue 3 single-page frontend connected seamlessly via Inertia.js.

---

## 🏛️ High-Level Architecture Overview

```
                        ┌──────────────────────────────────────────┐
                        │             Web Browser (Client)         │
                        │   Vue 3 (Options / Composition API)      │
                        │   Tailwind CSS v4 / Reka UI / Lucide     │
                        └────────────────────┬─────────────────────┘
                                             │
                                    Inertia.js Protocol
                                             │
                        ┌────────────────────▼─────────────────────┐
                        │               Bun Runtime                │
                        │ ┌──────────────────────────────────────┐ │
                        │ │          Hono Web Framework          │ │
                        │ │  - Request Routing & Middleware      │ │
                        │ │  - Session & Cookie Security         │ │
                        │ │  - AES-256 Encryption Engine         │ │
                        │ │  - Simple-WebAuthn Passkey Engine    │ │
                        │ └──────────────────┬───────────────────┘ │
                        │                    │                     │
                        │ ┌──────────────────▼───────────────────┐ │
                        │ │        bun:sqlite Database           │ │
                        │ │  - SQLite with WAL Mode enabled      │ │
                        │ └──────────────────────────────────────┘ │
                        └──────────────────────────────────────────┘
```

---

## ⚙️ Core System Components

### 1. **Bun JavaScript Runtime**
- Serves as the high-performance runtime environment, package manager, and test runner.
- Executes native TypeScript files directly without transpilation steps during server startup.

### 2. **Hono Web Framework (`src/index.ts`)**
- Serves request routing, HTTP middleware, static file serving, and Inertia response rendering.
- Encapsulates authentication middleware, WebAuthn challenge handling, dynamic theme updates, task CRUD, and habit tracking.

### 3. **Inertia.js v2 Adapter**
- Connects Hono backend controllers with Vue 3 frontend components without requiring custom REST/GraphQL boilerplate.
- Provides seamless page transitions, prop passing, form handling (`useForm`), and error flash messages.

### 4. **Embedded SQLite Database (`bun:sqlite`)**
- Uses Bun's native SQLite bindings for zero-latency database operations.
- Operates in Write-Ahead Logging (WAL) mode for concurrency and transactional integrity.
- Stores user accounts, encrypted tasks, habit records, WebAuthn passkeys, and user preferences.

### 5. **AES-256 GCM Encryption Layer (`src/crypto.ts`)**
- Encrypts sensitive personal data (e.g., Task titles, descriptions, Habit names) at rest using the master `APP_KEY`.
- Decrypts data transparently before rendering responses through Inertia props.

---

## 📂 Directory & Component Structure

```
Doable/
├── src/                      # Backend application source code
│   ├── index.ts              # Entry point: Hono server, routes, and controllers
│   ├── db.ts                 # Database schema initialization and SQLite connections
│   ├── crypto.ts             # AES-256 encryption & decryption functions
│   └── passkeys.ts           # Simple-WebAuthn registration & verification helpers
├── resources/                # Frontend source code
│   ├── views/                # Inertia root layout template (app.html)
│   └── js/                   # Vue 3 pages, components, and assets
│       ├── app.js            # Inertia app bootstrapper
│       ├── Pages/            # Page components (Dashboard, HabitTracker, Security, etc.)
│       └── Components/       # UI components (Navigation, Modals, Task Lists)
├── public/                   # Static assets & compiled Vite output
├── docs/                     # Technical documentation
├── Dockerfile                # Multi-stage production container build
├── docker-compose.yml        # Multi-container orchestration definition
└── e2e.test.ts               # End-to-end Bun integration test suite
```
