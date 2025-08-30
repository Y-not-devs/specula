import asyncio
import threading
from telethon import TelegramClient, events
from storage.firebase import FirebaseStorage
from pathlib import Path

class BotRunner:
    def __init__(self, name, api_id, api_hash, session_name):
        self.name = name
        self.api_id = api_id
        self.api_hash = api_hash
        sessions_dir = Path("config/sessions")
        self.firebase = FirebaseStorage()
        sessions_dir.mkdir(parents=True, exist_ok=True)

        self.session_path = str(sessions_dir / f"{session_name}.session")
        self.client = TelegramClient(self.session_path, api_id, api_hash)
        self.thread = threading.Thread(target=self.run, daemon=True)

    async def _start(self):
        await self.client.start()
        me = await self.client.get_me()
        print(f"[{self.name}] started as {me.username or me.first_name}")
        async for dialog in self.client.iter_dialogs():
            print(dialog.name, dialog.id)

        self.client.add_event_handler(self.on_message, events.NewMessage)

    async def on_message(self, event):
        sender = await event.get_sender()
        sender_id = sender.id if sender else None
        text = event.raw_text  # always safe
        print(f"[{self.name}] {sender_id}: {text}")
        if not (event.is_group or event.is_channel):
            return  # только группы и каналы

        data = {
            "user_id": event.sender_id,
            "text": event.raw_text or "[Media]"
        }
        await self.firebase.save_message(event.chat_id, data)

    async def send_message(self, user_id, text):
        print(f"[{self.name}] Attempting to send to {user_id}: {text}")
        await self.client.send_message(user_id, text)
        print(f"[{self.name}] Successfully sent to {user_id}")


    def run(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        self.loop.run_until_complete(self._start())
        self.loop.run_forever()