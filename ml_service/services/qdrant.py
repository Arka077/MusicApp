from qdrant_client import QdrantClient
from qdrant_client.models import (
    VectorParams,
    Distance,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    ScoredPoint
)
import numpy as np
import os
import uuid
import numpy as np

QDRANT_URL      = os.getenv("QDRANT_URL")
QDRANT_API_KEY  = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "music_chunks"
VECTOR_DIM      = 128

_client = None

def init_collection():
    global _client
    _client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY
    )
    # rest stays exactly the same
    existing = [c.name for c in _client.get_collections().collections]

    if COLLECTION_NAME not in existing:
        _client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_DIM,
                distance=Distance.COSINE
            )
        )
        print(f"✅ Created Qdrant collection: {COLLECTION_NAME}")
    else:
        print(f"✅ Qdrant collection exists: {COLLECTION_NAME}")

def upsert_song_chunks(music_id: int, chunk_embeddings: np.ndarray):
    """
    Store all chunk embeddings for a song in Qdrant.
    Each chunk is a separate point tagged with music_id.
    """
    points = []
    for chunk_vec in chunk_embeddings:
        points.append(PointStruct(
            id=str(uuid.uuid4()),   # unique ID per chunk
            vector=chunk_vec.tolist(),
            payload={"music_id": music_id}  # links back to MySQL
        ))

    _client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

def search(query_vector: np.ndarray, top_k: int = 10):
    response = _client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector[0].tolist(),
        limit=top_k * 10
    )

    results = response.points

    seen = {}

    for hit in results:
        music_id = hit.payload["music_id"]
        score = hit.score

        if music_id not in seen or score > seen[music_id]:
            seen[music_id] = score

    ranked = sorted(
        seen.items(),
        key=lambda x: x[1],
        reverse=True
    )[:top_k]

    return [
        {"music_id": mid, "score": round(score, 4)}
        for mid, score in ranked
    ]

def delete_song(music_id: int):
    """Remove all chunks for a song from Qdrant"""
    _client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="music_id",
                    match=MatchValue(value=music_id)
                )
            ]
        )
    )