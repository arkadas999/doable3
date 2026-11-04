# Hosting Doable (Bun)

Doable is now a single Bun application with an embedded SQLite database.
This makes hosting extremely simple.

## Running on a VPS (e.g. Ubuntu/Debian)

1. **Install Bun:**
   `curl -fsSL https://bun.sh/install | bash`

2. **Clone and Install:**
   `git clone https://github.com/your-repo/doable.git`
   `cd doable`
   `bun install`

3. **Build Frontend:**
   `bun run build`

4. **Environment Variables:**
   Create a `.env` file with `APP_KEY=base64:32_character_string_here...`

5. **Run the Server:**
   `NODE_ENV=production bun src/index.ts`

## Caddy Reverse Proxy (Recommended)
If you use Caddy as your web server / reverse proxy:
```caddy
doable.anujkp.dev {
    encode gzip zstd
    reverse_proxy 127.0.0.1:8000
}
```

> **Note:** Caddy automatically handles HTTPS certificates and sets standard `X-Forwarded-Proto`, `X-Forwarded-Host`, and `X-Forwarded-For` headers.

## Nginx Reverse Proxy
If you want to use Nginx in front of Bun:
```nginx
server {
    listen 80;
    server_name doable.app;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```
