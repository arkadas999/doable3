# 🎯 Doable

> A lightning-fast, privacy-focused task management and habit tracking web application built with Bun, Hono, Vue 3, Inertia.js, and SQLite.

[![Bun](https://img.shields.io/badge/Bun-1.4+-black?style=flat-square&logo=bun)](https://bun.sh)
[![Hono](https://img.shields.io/badge/Framework-Hono-orange?style=flat-square&logo=hono)](https://hono.dev)
[![Vue 3](https://img.shields.io/badge/Frontend-Vue_3-emerald?style=flat-square&logo=vue.js)](https://vuejs.org)
[![Inertia.js](https://img.shields.io/badge/Adapter-Inertia_v2-purple?style=flat-square&logo=inertia)](https://inertiajs.com)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue?style=flat-square&logo=docker)](docs/DOCKER.md)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🏷️ Tags & Topics

`#docker` `#docker-compose` `#productivity` `#task-manager` `#habit-tracker` `#bun` `#hono` `#vue3` `#inertiajs` `#passkeys` `#webauthn` `#sqlite` `#typescript` `#tailwindcss`

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [📚 Technical Documentation](#-technical-documentation)
- [🛠️ Tech Stack](#️-tech-stack)
- [🐳 Quick Start with Docker](#-quick-start-with-docker)
- [🚀 Quick Start (Local Development)](#-quick-start-local-development)
- [🧪 Testing](#-testing)
- [📦 Production Deployment](#-production-deployment)
- [📄 License](#-license)

---

## ✨ Features

### 📋 Task Management
- **Interactive Calendar**: Theme-aligned calendar view to schedule and filter tasks by date instantly.
- **Prioritized Buckets**: Organize tasks into **Important** and **Eventual** buckets.
- **Drag-and-Drop Reordering**: Smooth position updating and persistent list order.
- **Due Dates & Priorities**: Categorize tasks by default or custom priority (Normal, Medium, High) with due date support.
- **Bin & Trash Workflows**: Move items to bin with instant undo/restore toast notifications, or permanently purge.

### 🔥 Habit Tracking & Streaks
- **Interactive Habit Grids**: Visual 150-day heatmaps to track daily completions.
- **Dynamic Streak Counters**: Automatic computation of **Current Streak** and **Longest Streak**.
- **Habit Reordering**: Reorder habits seamlessly.

### 🔑 Security & Authentication
- **Native WebAuthn & Passkeys**: Hardware biometrics (TouchID, FaceID, Windows Hello, YubiKey) for passwordless login and identity confirmation.
- **Smart Security Auto-Lock**: Automatically locks the Security section 15 seconds after navigating to other pages.
- **Data Encryption**: Sensitive fields (names, task titles, notes) are encrypted at rest using AES-256 GCM.
- **Password Strength Meter**: Realtime strength evaluation and match confirmation on sign-up.

### 🎨 Personalization & UX
- **User-Specific Theme Sync**: Choose between **Light**, **Dark**, or **System** theme, synced across sessions.
- **Custom Accent Colors**: Pick your favorite accent color (Default Blue, Emerald, Violet, Rose, Amber) with instant UI application.
- **Avatar Management**: Upload and manage custom profile pictures.

---

## 📚 Technical Documentation

Explore detailed guides and technical references in the [`docs/`](docs/) directory:

- 🏗️ **[Architecture Specification](docs/ARCHITECTURE.md)** – Technical design, component breakdown, and data flow.
- 🐳 **[Docker & Containerization Guide](docs/DOCKER.md)** – Docker Compose setup, volume persistence, and environment variables.
- 🛡️ **[Security & WebAuthn Specification](docs/SECURITY.md)** – Passkeys, AES-256 GCM payload encryption, and auto-lock security.
- 📡 **[API & Route Reference](docs/API.md)** – Complete route table, endpoints, HTTP methods, and payload structures.
- 🌐 **[VPS Hosting Guide](docs/host.md)** – Instructions for hosting on Ubuntu/Debian with Nginx reverse proxy.
- ⚡ **[Performance Benchmarks](docs/speed.md)** – Resource utilization, memory footprint, and throughput metrics.
- 📖 **[Usage Guide](docs/use.md)** – User navigation and workflow overview.

---

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh) (JavaScript runtime, package manager, and test runner)
- **Backend Framework**: [Hono](https://hono.dev) (Ultra-fast web framework for JS runtimes)
- **Frontend Framework**: [Vue 3](https://vuejs.org) (Composition API, `<script setup>`)
- **Monolith Bridge**: [Inertia.js](https://inertiajs.com) (Server-side routing with modern Vue SPA frontend)
- **Database**: [bun:sqlite](https://bun.sh/docs/api/sqlite) (Embedded SQLite with WAL mode and foreign key constraints)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + [shadcn-vue / Reka UI](https://www.reka-ui.com)
- **Containerization**: [Docker](https://www.docker.com) & [Docker Compose](https://docs.docker.com/compose/)

---

## 🐳 Quick Start with Docker

Run Doable instantly with Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/anujkp/Doable.git
cd Doable

# 2. Copy environment template and generate key
cp .env.example .env
bun run key:generate

# 3. Start container with Docker Compose
docker compose up -d
```

Open `http://localhost:8000` in your browser.

For complete Docker configuration, environment variables, and volume persistence options, see the **[Docker & Containerization Guide](docs/DOCKER.md)**.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
Make sure you have [Bun](https://bun.sh) installed:
```bash
curl -fsSL https://bun.sh/install | bash
```

### 1. Clone & Install
```bash
git clone https://github.com/anujkp/Doable.git
cd Doable
bun install
```

### 2. Environment Configuration
Create a `.env` file by copying the template:
```bash
cp .env.example .env
```

#### Generating an Encryption Key (`APP_KEY`)
Generate a secure 32-byte AES-256 base64 encryption key for your `.env` file:
```bash
bun run key:generate
```

#### Customizing Server Port
Change `PORT` in your `.env` file or pass it directly on launch:
```bash
PORT=3000 bun run start
```

### 3. Development Mode
Run Vite and Hono concurrently with watch mode:
```bash
bun run dev
```
Open `http://localhost:8000` in your browser.

---

## 🧪 Testing

Doable includes an end-to-end integration test suite powered by `bun test`:

```bash
bun test e2e.test.ts
```

Tests cover end-to-end user workflows including:
- Account Registration & Password Rules
- User Login & Session Persistence
- Task CRUD, Drag-and-Drop Reordering, Bin/Restore
- Habit Tracking, Streaks, Entry Toggling
- Profile & Security Updates, Account Deletion
- Unmapped Route Fallback Handling

---

## 📦 Production Deployment

### Build Assets
```bash
bun run build
```

### Start Server
```bash
bun run start
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
