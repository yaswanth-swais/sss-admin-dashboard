# SSS Admin Backend

FastAPI service. Existing PostgreSQL tables will be reused; no schema migration is included in this first scaffold.

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8001
```
