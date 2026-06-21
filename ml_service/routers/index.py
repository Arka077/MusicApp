from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from services import encoder, qdrant

router = APIRouter()

class IndexRequest(BaseModel):
    music_id: int
    audio_url: str

def _index_song_task(music_id: int, audio_url: str):
    """Background task — runs after Node.js already got its response"""
    try:
        print(f"🎵 Indexing song {music_id}...")
        chunk_embeddings, _ = encoder.embed_audio_from_url(audio_url)
        qdrant.upsert_song_chunks(music_id, chunk_embeddings)
        print(f"✅ Song {music_id} indexed — {len(chunk_embeddings)} chunks")
    except Exception as e:
        print(f"❌ Failed to index song {music_id}: {e}")

@router.post("/index")
async def index_song(request: IndexRequest, background_tasks: BackgroundTasks):
    """
    Node.js calls this after successful upload.
    Returns immediately — indexing happens in background.
    """
    background_tasks.add_task(
        _index_song_task,
        request.music_id,
        request.audio_url
    )
    return {"status": "accepted", "music_id": request.music_id}