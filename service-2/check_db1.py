import os, re, firebase_admin
from firebase_admin import credentials, firestore

print("DB1_SA =", os.environ.get("DB1_SA"))
print("DB1_PROJECT_ID =", os.environ.get("DB1_PROJECT_ID"))

cred = credentials.Certificate(os.environ['DB1_SA'])
try:
    app = firebase_admin.initialize_app(
        cred,
        options={"projectId": os.environ.get('DB1_PROJECT_ID')},
        name="db1check"
    )
    print("Firebase initialized:", app.name)
except Exception as e:
    print("Initialization failed:", e)
    raise

db = firestore.client()
gids = [c.id for c in db.collections() if re.fullmatch(r"-?\d+", c.id)]
print("Groups:", gids[:50])
