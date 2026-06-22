from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from services import encoder, qdrant

router = APIRouter()

class IndexRequest(BaseModel):
    music_id: int
    audio_url: str

def _index_song_task(music_id: int, audio_url: str):
    try:
        print(f"\n🎵 Indexing song {music_id}", flush=True)
        chunk_embeddings, _ = encoder.embed_audio_from_url(audio_url)
        print("Chunks:", chunk_embeddings.shape, flush=True)
        qdrant.upsert_song_chunks(music_id, chunk_embeddings)
        print(f"✅ Indexed song {music_id}", flush=True)
    except Exception as e:
        import traceback
        print(f"\n❌ INDEX ERROR for {music_id}", flush=True)
        print(traceback.format_exc())

@router.post("/index")
async def index_song(request: IndexRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(
        _index_song_task,
        request.music_id,
        request.audio_url
    )
    return {
        "status": "accepted",
        "music_id": request.music_id
    }
