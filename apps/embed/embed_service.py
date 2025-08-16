from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np

app = FastAPI()
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")  # 384-dim

class EmbedRequest(BaseModel):
    text: str

@app.post("/embed")
def embed(req: EmbedRequest):
    embedding = model.encode(req.text, normalize_embeddings=True)  # numpy array
    return {"embedding": embedding.tolist()}  # convert to list for JSON
