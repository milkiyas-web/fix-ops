from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np

app = FastAPI()
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")  

class EmbedRequest(BaseModel):
    text: str

@app.post("/embed")
def embed(req: EmbedRequest):
    embedding = model.encode(req.text, normalize_embeddings=True) 
    return {"embedding": embedding.tolist()} 
