import logging
import math
import os

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings


log = logging.getLogger("sss-admin-db")

DEFAULT_SLOTS = int(os.getenv("DB_SERVICE_SLOTS", "12"))
DEFAULT_RESERVE = float(os.getenv("DB_RESERVE", "0.2"))
FALLBACK_MAX_CONNECTIONS = int(
    os.getenv("DB_MAX_CONNECTIONS_FALLBACK", "80")
)

engine = None
SessionLocal = None


def normalize_database_url(url: str) -> str:
    if url.startswith("postgresql://"):
        return url.replace(
            "postgresql://",
            "postgresql+asyncpg://",
            1,
        )

    return url


async def get_max_connections(database_url: str) -> int:
    probe = None

    try:
        probe = create_async_engine(
            database_url,
            pool_size=1,
            max_overflow=0,
            pool_pre_ping=True,
            connect_args={
                "ssl": "require",
                "server_settings": {
                    "application_name": "sss-admin-probe",
                },
            },
        )

        async with probe.connect() as conn:
            result = await conn.execute(
                text("SHOW max_connections")
            )

            value = result.scalar()

            if value:
                return int(value)

    except Exception as exc:
        log.warning(
            "Could not read PostgreSQL max_connections: %s. "
            "Using fallback %s.",
            exc,
            FALLBACK_MAX_CONNECTIONS,
        )

    finally:
        if probe is not None:
            await probe.dispose()

    return FALLBACK_MAX_CONNECTIONS


def calculate_pool_share(
    max_connections: int,
    slots: int = DEFAULT_SLOTS,
    reserve: float = DEFAULT_RESERVE,
) -> int:
    slots = max(1, slots)

    share = math.floor(
        max_connections * (1 - reserve) / slots
    )

    return max(2, share)


async def initialize_database():
    global engine
    global SessionLocal

    database_url = normalize_database_url(
        settings.database_url
    )

    max_connections = await get_max_connections(
        database_url
    )

    share = calculate_pool_share(
        max_connections,
        DEFAULT_SLOTS,
        DEFAULT_RESERVE,
    )

    log.warning(
        "SSS Admin DB pool: "
        "pool_size=1, max_overflow=%s, "
        "max_connections=%s, slots=%s",
        share - 1,
        max_connections,
        DEFAULT_SLOTS,
    )

    engine = create_async_engine(
        database_url,
        pool_size=1,
        max_overflow=share - 1,
        pool_pre_ping=True,
        pool_recycle=1800,
        pool_timeout=10,
        connect_args={
            "ssl": "require",
            "server_settings": {
                "application_name": "sss-admin",
            },
        },
    )

    SessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    log.warning(
        "SSS Admin database initialized successfully"
    )


async def close_database():
    global engine
    global SessionLocal

    if engine is not None:
        await engine.dispose()

    engine = None
    SessionLocal = None


async def get_db():
    if SessionLocal is None:
        raise RuntimeError(
            "Database has not been initialized."
        )

    async with SessionLocal() as session:
        yield session