from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from app.config import settings
from app.db.pool import build_async_engine

database_url = settings.database_url

if database_url.startswith("postgresql://"):
    database_url = database_url.replace(
        "postgresql://",
        "postgresql+asyncpg://",
        1,
    )

# Temporary placeholder.
# We will initialize the real engine during application startup.
engine = None
SessionLocal = None


async def initialize_database():
    global engine
    global SessionLocal

    from app.db.pool import get_max_connections

    max_connections = await get_max_connections(
        database_url
    )

    engine = build_async_engine(
        database_url=database_url,
        service="sss-admin",
        max_connections=max_connections,
        slots=settings.db_service_slots,
        reserve=settings.db_reserve,
    )

    SessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )


async def close_database():
    global engine

    if engine is not None:
        await engine.dispose()
        engine = None


async def get_db():
    if SessionLocal is None:
        raise RuntimeError(
            "Database has not been initialized."
        )

    async with SessionLocal() as session:
        yield session