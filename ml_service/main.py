from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from contextlib import asynccontextmanager
from routers import search, index
from services import encoder, qdrant

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load everything once at startup
    print("🚀 Loading CLAP model...")
    encoder.load_model()
    print("✅ CLAP model loaded")

    print("🔌 Connecting to Qdrant...")
    qdrant.init_collection()
    print("✅ Qdrant ready")

    yield
    print("👋 Shutting down ml_service")

app = FastAPI(lifespan=lifespan)
app.include_router(index.router)
app.include_router(search.router)

@app.get("/health")
def health():
    return {"status": "ok"}