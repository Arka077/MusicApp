from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from contextlib import asynccontextmanager
from routers import search, index
from services import qdrant, encoder

print("ENCODER FILE:", encoder.__file__, flush=True)
print("ENCODER ATTRS:", dir(encoder), flush=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting ML service...", flush=True)
    
    # 1. Init Qdrant (fast)
    print("🔌 Initializing Qdrant...", flush=True)
    qdrant.init_collection()
    print("✅ Qdrant ready", flush=True)
    
    # 2. Load ML models (FIXED: changed load_model to ensure_model)
    print("🧠 Loading CLAP model...", flush=True)
    encoder.ensure_model()
    print("✅ CLAP model loaded", flush=True)
    
    print("📊 Loading PCA...", flush=True)
    encoder.load_pca()
    print("✅ PCA loaded", flush=True)
    
    print("🎉 ML service fully ready", flush=True)
    yield
    print("👋 Shutting down service", flush=True)

app = FastAPI(lifespan=lifespan)

app.include_router(index.router, prefix="/api")
app.include_router(search.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}
