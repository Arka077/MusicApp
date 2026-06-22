from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import encoder, qdrant

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    top_k: int = 10

@router.post("/search")
async def search(request: SearchRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    try:
        print("\n--- SEARCH REQUEST ---", flush=True)
        print("QUERY:", request.query, flush=True)
        
        query_vector = encoder.embed_text(request.query)
        print("EMBED DONE:", query_vector.shape, flush=True)
        
        results = qdrant.search(query_vector, top_k=request.top_k)
        print("QDRANT RESULTS:", results, flush=True)
        
        return {"results": results}
        
    except Exception as e:
        import traceback
        print("\n❌ SEARCH ERROR:", flush=True)
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
