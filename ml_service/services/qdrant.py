from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
import numpy as np
import os
import uuid

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "music_chunks"
VECTOR_DIM = 128

_client = None

def init_collection():
    global _client
    _client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY
    )
    existing = [c.name for c in _client.get_collections().collections]
    
    if COLLECTION_NAME not in existing:
        _client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_DIM,
                distance=Distance.COSINE
            )
        )
        print("✅ Created collection", flush=True)
    else:
        print("✅ Collection exists")

def upsert_song_chunks(music_id: int, chunk_embeddings: np.ndarray):
    points = []
    for vec in chunk_embeddings:
        points.append(PointStruct(
            id=str(uuid.uuid4()),
            vector=vec.tolist(),
            payload={"music_id": music_id}
        ))
        
    _client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

def search(query_vector: np.ndarray, top_k: int = 10):
    vec = np.array(query_vector).reshape(-1)
    
    response = _client.query_points(
        collection_name=COLLECTION_NAME,
        query=vec.tolist(),
        limit=top_k * 10
    )
    
    seen = {}
    for hit in response.points:
        mid = hit.payload["music_id"]
        if mid not in seen or hit.score > seen[mid]:
            seen[mid] = hit.score
            
    ranked = sorted(seen.items(), key=lambda x: x[1], reverse=True)[:top_k]
    
    return [
        {"music_id": m, "score": round(s, 4)}
        for m, s in ranked
    ]

def delete_song(music_id: int):
    _client.delete(
        collection_name=COLLECTION_NAME,
        points_selector={
            "must": [{
                "key": "music_id",
                "match": {"value": music_id}
            }]
        }
    )
