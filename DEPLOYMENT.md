# Production deployment

The application is deployed as three containers (Next.js, Spring Boot, PostgreSQL) behind the host's shared Traefik `web` network.

## Configure

```bash
cp .env.example .env
# Replace every placeholder secret, then protect the file.
chmod 600 .env
mkdir -p data/postgres
```

`API_URL` is embedded in the frontend image as the internal Compose address `http://backend:8080`. The public browser uses same-origin `/api/*` requests, so only `roiet.porogramr.com` is exposed.

## Deploy

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

The DNS A record for `roiet.porogramr.com` must point to the Traefik host. Verify both the UI and API through HTTPS:

```bash
curl --resolve roiet.porogramr.com:443:127.0.0.1 https://roiet.porogramr.com/login
curl --resolve roiet.porogramr.com:443:127.0.0.1 \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"<password>"}' \
  https://roiet.porogramr.com/api/auth/login
```

Runtime secrets, database files, and the local credentials note are ignored by Git (`.env`, `data/`, `.credentials`). Rotate the seeded development passwords immediately on a fresh production database.
