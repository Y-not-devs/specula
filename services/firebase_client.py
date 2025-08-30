import os, json 
from google.cloud import firestore 

def init_firestore() -> firestore.Client:
    creds_json = json.loads(os.environ["FIREBASE_CREDENTIALS_JSON"])
    project_id = os.environ["FIREBASE_PROJECT_ID"]
    return firestore.Client(project=project_id, credentials=firestore.Credentials.from_service_account_info(creds_json))


class FirebaseClient:
    def __init__(self):
        self.client = init_firestore()

    def fetch_processed_messages(self, limit: int = 1000):
        # читаем коллекцию 'processed_messages'
        docs = self.client.collection('processed_messages').limit(limit).stream()
        for doc in docs:
            data = doc.to_dict()
            text = data.get('text', '')
            if text:
                yield {"id": doc.id, "text": text}

