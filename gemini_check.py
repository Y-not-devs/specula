import os, sys, traceback
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("ERROR: GEMINI_API_KEY не задан")
    sys.exit(1)

genai.configure(api_key=API_KEY)

# Попробуем ОБА формата имени модели последовательно.
CANDIDATES = [
    os.getenv("GEMINI_MODEL") or "",               # если ты что-то задал сам
    "models/gemini-1.5-flash",                     # формат для gRPC
    "gemini-1.5-flash",                            # формат без префикса
    "models/gemini-1.5-pro",
    "gemini-1.5-pro",
]

tried = []
for name in CANDIDATES:
    name = (name or "").strip()
    if not name:
        continue
    try:
        print(f"TRY MODEL: {name}")
        m = genai.GenerativeModel(name)
        r = m.generate_content("Ответь одним словом: ПРИВЕТ")
        print("OK MODEL:", name)
        print("TEXT:", (r.text or "").strip())
        break
    except Exception as e:
        tried.append((name, str(e).splitlines()[-1]))
        continue
else:
    print("\nВсе варианты не сработали. Диагностика:")
    for n, err in tried:
        print(f"- {n} -> {err}")
    print("\nСоветы:")
    print("1) Обнови google-generativeai: pip install -U google-generativeai")
    print("2) Проверь, что ключ действителен и у аккаунта есть доступ к выбранной модели.")
    sys.exit(2)
