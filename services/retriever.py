import numpy as np
import os
from typing import List, Dict
import google.generativeai as genai

class InMemoryRetriever:
    def __init__(self, model_name: str = "models/gemini-1.5-pro"):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.embed_model = genai.GenerativeModel(model_name)
        self.index: List[Dict] = []

    def build_index(self, messages: List[Dict]):
        self.index.clear()
        for msg in messages:
            # получаем эмбеддинг: в Gemini это делается через method embed_content()
            emb = self.embed_model.embed_content(
                content=msg["text"],
                title="processed message",
            ).embedding
            self.index.append({"id": msg["id"], "text": msg["text"], "vector": np.array(emb)})
    
    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        # эмбеддинг для запроса
        q_emb = self.embed_model.embed_content(content=query).embedding
        q_vec = np.array(q_emb)
        scored = []
        for entry in self.index:
            # косинусная близость
            score = np.dot(entry["vector"], q_vec) / (np.linalg.norm(entry["vector"]) * np.linalg.norm(q_vec) + 1e-8)
            scored.append((score, entry))
        # сортируем по убыванию
        scored.sort(reverse=True, key=lambda x: x[0])
        return [entry for _, entry in scored[:top_k]]