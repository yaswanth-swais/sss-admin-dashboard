# sss-admin-dashboard
# SSS Admin Backend

FastAPI service. Existing PostgreSQL tables will be reused; no schema migration is included in this first scaffold.

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8001
```

# SSS Admin Frontend

Next.js + Tailwind. Mobile-first and designed to run under `NEXT_PUBLIC_BASE_PATH`.

```bash
npm install
copy .env.example .env.local
npm run dev
```
