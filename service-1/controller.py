import threading
import asyncio
import json
from bots.bot_instance import create_bot  # if still needed
from bot_runner import BotRunner

class BotController:
    def __init__(self, config_path="config/bots.json"):  # <-- fix here
        self.config_path = config_path
        self.bots = {}


    def load_bots(self):
        with open(self.config_path, "r") as f:
            return json.load(f)

    def start_bots(self):
        configs = self.load_bots()
        for bot_name, creds in configs.items():
            runner = BotRunner(
                bot_name,
                creds["api_id"],
                creds["api_hash"],
                creds["session"]
            )
            self.bots[bot_name] = runner
            t = threading.Thread(target=runner.run, daemon=True)
            t.start()
            print(f"✅ Started bot {bot_name}")

    def list_bots(self):
        return list(self.bots.keys())

    def send_message(self, bot_name, user_id, text):
        bot = self.bots.get(bot_name)
        if not bot:
            print(f"❌ No such bot: {bot_name}")
            return

        async def _safe_send():
            try:
                await bot.send_message(user_id, text)
                print(f"✅ Message sent to {user_id} via {bot_name}")
            except Exception as e:
                print(f"❌ Failed to send message via {bot_name}: {e}")

        try:
            asyncio.run_coroutine_threadsafe(_safe_send(), bot.loop)
        except Exception as e:
            print(f"❌ Could not schedule message for {bot_name}: {e}")

    def send_message_username(self, bot_name, username, text):
        bot = self.bots.get(bot_name)
        if not bot:
            print(f"❌ No such bot: {bot_name}")
            return

        async def _safe_send_username():
            try:
                # Telethon automatically resolves username to entity
                await bot.client.send_message(username, text)
                print(f"✅ Message sent to @{username} via {bot_name}")
            except Exception as e:
                print(f"❌ Failed to send message via {bot_name}: {e}")

        try:
            asyncio.run_coroutine_threadsafe(_safe_send_username(), bot.loop)
        except Exception as e:
            print(f"❌ Could not schedule message for {bot_name}: {e}")