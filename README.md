# Colco Task: Artist Management Admin Panel

A simple Admin panel to manage records of artists with their songs collection.

---

## 📂 Project Structure

```text
colco-task/
├── docker-compose.yml
├── package.json
├── package-lock.json
├── public
│   ├── artists.html
│   ├── dashboard.html
│   ├── javascript
│   │   ├── api.js
│   │   ├── app.js
│   │   └── state.js
│   ├── login.html
│   ├── register.html
│   └── styles
│       ├── dashboard.css
│       └── login.css
├── README.md
├── sql
│   ├── queries.js
│   └── schema.sql
└── src
    ├── controllers
    │   ├── artist.controller.js
    │   ├── song.controller.js
    │   └── user.controller.js
    ├── db
    │   └── dbConnect.js
    ├── index.js
    ├── middleware
    │   └── sessionAuth.js
    ├── queries
    │   ├── artist.queries.js
    │   ├── song.queries.js
    │   └── user.queries.js
    ├── services
    │   ├── artist.service.js
    │   ├── song.service.js
    │   └── user.service.js
    └── utils
        ├── bodyParse.js
        ├── validate.js
        └── static.js
```

---

## 🛠️ Prerequisites

Ensure your host machine has the following dependencies initialized:
*   **Docker** & **Docker Compose**
*   **Node.js 18+** & **npm**

---

## ⚙️ Setup & Execution

### 1) Configure Environment Variables

Replicate the environment schema provided in the base directory to hook environment states into active configurations.
```bash
cp .env.example .env
```
Default `.env` assignments check logic:
```env
DB_USER=admin
DB_PASSWORD=password
DB_NAME=artistdb
```

### 2) Database Architecture initialization
Launch the PostgreSQL engine implicitly through Docker Compose natively. 
```bash
docker compose up -d postgres
```
The architecture explicitly maps internal bindings to your host system across port `:5433` avoiding typical fallback collisions on `:5432`. Upon startup, the container accurately constructs schemas resolving to `sql/schema.sql`.

### 3) Install Node Packages
Install minimal dependencies (`pg`, `dotenv`, `nodemon`) for compiling connections:
```bash
npm install
```

### 4) Launching the Backend Server 
```bash
npm run dev
```
Execute the backend pipeline directly; the server immediately intercepts local bindings.
Navigate your browser to: `http://localhost:3000` to proceed onto the UI interceptor directly linking context tracking via Login schemas!

---

## 🩺 Troubleshooting

**Docker is not responsive/running**
Start your Docker Desktop layout or background daemon and reissue the container instantiation.

**Postgres Database connection faults on UI startup**
Verify local environment configurations `.env` accurately reflect connection settings encoded within `src/db/dbConnect.js`.

**Schema Re-Initialization**
If SQL changes fail to project themselves actively after rewriting `schema.sql`, immediately purge local caching volumes via:
```bash
docker compose down -v
docker compose up -d postgres
```
