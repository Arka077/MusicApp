from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import encoder, qdrant

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    top_k: int = 10

@router.post("/search")
async def search(request: SearchRequest):
    """
    User types a query → returns ranked list of music_ids
    Node.js uses these IDs to fetch metadata from MySQL
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        query_vector = encoder.embed_text(request.query)
        results      = qdrant.search(query_vector, top_k=request.top_k)
        return {"results": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))