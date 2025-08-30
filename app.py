import os
import json 
import re
from fastapi import FastAPI
from fastapi import HTTPException
from pydantic import BaseModel 
from dotenv import load_dotenv

def load_dummy_data(path: str) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return json.load(f)

DUMMY_DATA = load_dummy_data("data.json")

def find_relevant_messages(question: str, limit: int = 3) -> list[dict]:
    terms = re.findall(r"[а-яА-Яa-zA-Z]+", question.lower())
    scored = []
    for entry in DUMMY_DATA:
        text = entry["text"].lower()
        score = sum(text.count(term) for term in terms)
        if score > 0:
            scored.append((score, entry))
    # сортируем по количеству совпадений и возвращаем топ limit
    scored.sort(reverse=True, key=lambda t: t[0])
    return [entry for _, entry in scored[:limit]]

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
USE_GEMINI = bool(GEMINI_API_KEY)

VALID_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-pro", 
    "gemini-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest"
]

if USE_GEMINI:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    
    _model = None
    working_model = None
    
    for model_name in VALID_MODELS:
        try:
            print(f"Trying model: {model_name}")
            test_model = genai.GenerativeModel(model_name)
            test_response = test_model.generate_content(
                "Hello", 
                generation_config={"max_output_tokens": 10}
            )
            if test_response.text:
                _model = test_model
                working_model = model_name
                print(f"✓ Successfully using model: {model_name}")
                break
        except Exception as e:
            print(f"✗ Model {model_name} failed: {str(e)}")
            continue
    
    if not _model:
        print("❌ No working model found!")
        USE_GEMINI = False

app = FastAPI(title="specula-gemini")

class ChatIn(BaseModel):
    message: str

class ChatOut(BaseModel):
    reply: str
    provider: str
    model_used: str = ""

class AskIn(BaseModel):
    question: str
    top_k: int = 3

class AskOut(BaseModel):
    answer: str
    sources: list[int]  # id сообщений, которые использовались

@app.get("/health")
def health():
    return {
        "status": "ok", 
        "gemini_available": USE_GEMINI,
        "model_used": working_model if USE_GEMINI else "none"
    }

@app.post("/ask", response_model=AskOut)
def ask(payload: AskIn):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Вопрос не должен быть пустым.")
    
    chunks = find_relevant_messages(payload.question, payload.top_k)
    context = "\n\n".join(f"{i+1}. {msg['text']}" for i, msg in enumerate(chunks))

    # 2. Вызываем Gemini, если ключ есть
    if USE_GEMINI:
        prompt = (
            "Ответь на вопрос пользователя, опираясь только на следующие сообщения.\n\n"
            f"{context}\n\n"
            f"Вопрос: {payload.question}\n\n"
            "Ответь максимально кратко и по сути."
        )
        resp = _model.generate_content(prompt).text or ""
        answer = resp.strip()
    else:
        # мок‑ответ, пока нет ключа
        answer = "[mock] Демо-режим: я бы проанализировал эти сообщения, но ключа нет."

    return AskOut(
        answer=answer,
        sources=[msg["id"] for msg in chunks]
    )

@app.post("/chat", response_model=ChatOut)
def chat(payload: ChatIn):
    user_msg = (payload.message or "").strip()

    if not USE_GEMINI:
        return ChatOut(
            reply=f"[mock] Ты сказал: {user_msg}. Я без GEMINI_API_KEY, работаю в демо.",
            provider="mock",
            model_used="none"
        )
    
    try:
         # Ищем релевантный контекст из данных
        relevant_data = find_relevant_messages(user_msg, limit=2)
        context = ""
        if relevant_data:
            context = "\n\nКонтекст из базы знаний:\n"
            for i, item in enumerate(relevant_data, 1):
                context += f"{i}. {item['text'][:200]}...\n"

        sys_hint = "Отвечай кратко и по делу. Если вопрос вне темы — отвечай одной строкой."
        prompt = f"{sys_hint}\n\nПользователь: {user_msg}"
        
        resp = _model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "top_p": 0.95,
                "max_output_tokens": 256,
            }
        )
        text = resp.text or ""
        return ChatOut(
            reply=text.strip(), 
            provider="gemini",
            model_used=working_model
        )
    except Exception as e:
        return ChatOut(
            reply=f"Ошибка при обращении к Gemini: {str(e)}",
            provider="error",
            model_used=working_model or "unknown"
        )