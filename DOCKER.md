# 🐳 Docker & Containerization Guide

Doable provides full Docker and Docker Compose support for easy containerized deployment in production and self-hosted environments.

---

## 🚀 Quick Start with Docker Compose

The fastest way to deploy Doable is using Docker Compose:

### 1. Clone the repository
```bash
git clone https://github.com/anujkp/Doable.git
cd Doable
```

### 2. Configure environment variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Generate a secure `APP_KEY`:
```bash
bun run key:generate
```
*(Or use OpenSSL / Node `crypto` to generate a 32-byte base64 string and paste it into `.env`)*

### 3. Launch the container
```bash
docker compose up -d
```

The application will be running at `http://localhost:8000`.

---

## 🛠️ Dockerfile Architecture

Doable utilizes a multi-stage Docker build powered by `oven/bun:1-alpine` to minimize image size and maximize performance.

### Build Stage (`builder`)
- Installs all dependencies including devDependencies.
- Compiles Vite assets into `/app/public/build`.

### Production Stage (`runner`)
- Installs production-only dependencies (`bun install --production`).
- Copies compiled assets, views, scripts, and server source files.
- Sets `NODE_ENV=production` and exposes port `8000`.

---

## 🔑 Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Execution environment mode |
| `PORT` | `8000` | HTTP port for the web application |
| `APP_KEY` | *(Required)* | 32-byte base64 key used for AES-256 GCM payload encryption |

---

## 💾 Persistent Volumes

Docker Compose mounts two named volumes to preserve data across container recreations:

- **`doable-data`**: Mounts to `/app/data` (stores the `doable.db` SQLite database).
- **`doable-avatars`**: Mounts to `/app/public/avatars` (stores uploaded profile pictures).

---

## ⚙️ Building & Running Standalone Docker Container

If you prefer building and running the container manually without Docker Compose:

```bash
# Build the Docker image
docker build -t doable:latest .

# Run container with volume persistence
docker run -d \
  --name doable \
  -p 8000:8000 \
  -e APP_KEY="base64:YOUR_GENERATED_BASE64_KEY_HERE" \
  -v doable-data:/app/data \
  -v doable-avatars:/app/public/avatars \
  doable:latest
```

---

## 🧹 Maintenance & Logs

### View Container Logs
```bash
docker compose logs -f doable
```

### Stop Application
```bash
docker compose down
```
