# Colco Task

Simple project scaffold for an artist/song admin system.

Current state:

- Backend: Node.js + PostgreSQL connection bootstrap.
- Database: PostgreSQL in Docker, initialized from SQL schema.
- Frontend: static scaffold files (currently placeholders).

## Project Structure

```text
colco-task/
├── .env.example
├── backend/
│   ├── docker-compose.yml
│   ├── package.json
│   ├── sql/
│   │   └── schema.sql
│   └── src/
│       ├── index.js
│       └── db/dbConnect.js
└── frontend/
	├── *.html
	└── js/
```

## Prerequisites

Install these on your machine:

- Docker + Docker Compose
- Node.js 18+ and npm

Check quickly:

```bash
docker --version
docker compose version
node -v
npm -v
```

## 1) Configure Environment Variables

From project root:

```bash
cp .env.example .env
```

Default values in `.env`:

```env
DB_USER=admin
DB_PASSWORD=password
DB_NAME=artistdb
```

## 2) Start PostgreSQL with Docker

From project root:

```bash
docker compose up -d postgres
docker compose ps
```

Expected port mapping:

- Host: `5433`
- Container: `5432`

The database schema is auto-created on first startup from:

- `sql/schema.sql`

## 3) Install Backend Dependencies

From project root:

```bash
cd backend
npm install
cd ..
```

## 4) Run Backend

From project root:

```bash
node backend/src/index.js
```

Expected log:

```text
Server is running...
```

## 5) Stop Services

From project root:

```bash
docker compose down
```

If you want to remove DB data volume too (fresh DB next run):

```bash
docker compose down -v
```

## Troubleshooting

### Docker not running

Start Docker Desktop / Docker daemon, then retry:

```bash
docker compose up -d postgres
```

### Port `5432` already in use

This project already maps Postgres to host port `5433`, so it can coexist with another local Postgres on `5432`.

### Postgres container exits immediately

Ensure `docker-compose.yml` uses a pinned image (`postgres:17`) and not `postgres:latest`.

### Container name conflict (`artist-db` already exists)

If you previously started DB from another compose project/folder:

```bash
docker rm -f artist-db
docker compose up -d postgres
```

### Re-initialize schema

If SQL changes are not reflected, recreate volume:

```bash
docker compose down -v
docker compose up -d postgres
```

## Notes

- Backend DB connection config is in `backend/src/db/dbConnect.js`.
- Frontend files currently exist as placeholders and are not wired to backend APIs yet.
