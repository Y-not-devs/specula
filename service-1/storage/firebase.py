import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore


class FirebaseStorage:
    def __init__(self, chunk_size=100):
        cred = credentials.Certificate("config/firebase.json")
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)

        self.db = firestore.client()
        self.chunk_size = chunk_size

    async def save_message(self, group_id, data):
        today = datetime.utcnow().strftime("%Y-%m-%d")
        now = datetime.utcnow().strftime("%H:%M:%S")

        # Path: /{group_id}/{YYYY-MM-DD}/chunks/{chunk_id}
        chunks_ref = (
            self.db.collection(str(group_id))
            .document(today)
            .collection("chunks")
        )

        # Get last chunk ordered by created_at
        last_chunk = list(
            chunks_ref.order_by("created_at", direction=firestore.Query.DESCENDING).limit(1).stream()
        )

        if last_chunk:
            chunk_doc = last_chunk[0]
            chunk_data = chunk_doc.to_dict()
            messages = chunk_data.get("messages", [])
            chunk_id = chunk_doc.id
        else:
            chunk_doc = None
            messages = []
            chunk_id = "00"  # will become "01" below

        # New message
        message = {
            "user_id": data.get("user_id"),
            "time": now,
            "text": data.get("text"),
        }
        messages.append(message)

        # If still room, update current chunk
        if chunk_doc and len(messages) < self.chunk_size:
            chunk_doc.reference.update({"messages": messages})
        else:
            # Calculate next chunk number
            next_chunk_number = str(int(chunk_id) + 1).zfill(2)
            chunks_ref.document(next_chunk_number).set({
                "created_at": firestore.SERVER_TIMESTAMP,
                "messages": [message]
            })
