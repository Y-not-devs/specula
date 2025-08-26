import json
import asyncio
from pathlib import Path
from bot_runner import BotRunner
from controller import BotController

CONFIG_PATH = Path(__file__).parent / "config" / "bots.json"

def load_bots():
    with open(CONFIG_PATH) as f:
        return json.load(f)


def main():
    controller = BotController()
    controller.start_bots()

    print("Commands:")
    print("  /list")
    print("  /send <bot> <user_id> <text>")
    print("  /exit")

    while True:
        try:
            cmd = input("> ").strip()
            if not cmd:
                continue

            if cmd == "/list":
                bots = controller.list_bots()
                print("Active bots:", ", ".join(bots) if bots else "None")

            elif cmd.startswith("/send "):
                parts = cmd.split(maxsplit=3)
                if len(parts) < 4:
                    print("Usage: /send <bot> <user_id> <text>")
                    continue
                _, bot_name, user_id, text = parts
                controller.send_message(bot_name, int(user_id), text)

            elif cmd.startswith("/send_username "):
                parts = cmd.split(maxsplit=3)
                if len(parts) < 4:
                    print("Usage: /send_username <bot> <username> <text>")
                    continue
                _, bot_name, username, text = parts
                controller.send_message_username(bot_name, username, text)

            elif cmd == "/exit":
                print("Exiting...")
                break

            else:
                print("Unknown command")

        except KeyboardInterrupt:
            print("\nExiting...")
            break


if __name__ == "__main__":
    main()
