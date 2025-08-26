from telethon import TelegramClient

def create_bot(api_id, api_hash, session_name):
    return TelegramClient(session_name, api_id, api_hash)
