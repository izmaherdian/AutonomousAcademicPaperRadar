#!/usr/bin/env python3
"""
Autonomous Academic Paper Radar - ESP32 Hardware Simulator
Simulates the ESP32 Desk Assistant via MQTT + HTTP in terminal without physical hardware.

Usage:
    python3 esp32/simulator.py [MQTT_BROKER_HOST]

Environment Variables:
    MQTT_BROKER_HOST  - MQTT broker address (default: localhost)
    MQTT_BROKER_PORT  - MQTT broker port (default: 1883)
    BACKEND_URL       - Backend REST API base URL (default: http://localhost/api/v1)

Example (from Windows laptop):
    set BACKEND_URL=https://your-cloudflare-domain.com/api/v1
    python esp32/simulator.py <IP_SERVER_AZURE>
"""

import json
import os
import sys
import time
import threading
import urllib.request
import urllib.error

try:
    import paho.mqtt.client as mqtt
except ImportError:
    print("[Simulator Notice] 'paho-mqtt' library is not installed.")
    try:
        import subprocess
        print("Attempting automatic installation of paho-mqtt...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "paho-mqtt"])
        import paho.mqtt.client as mqtt
    except Exception:
        print("\n[ERROR] Could not auto-install 'paho-mqtt'.")
        print("Please run: pip install paho-mqtt")
        sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────
if len(sys.argv) > 1:
    BROKER_HOST = sys.argv[1]
else:
    BROKER_HOST = os.environ.get("MQTT_BROKER_HOST", "localhost")

BROKER_PORT  = int(os.environ.get("MQTT_BROKER_PORT", 1883))
BACKEND_URL  = os.environ.get("BACKEND_URL", "http://localhost/api/v1")

# ── State ─────────────────────────────────────────────────────────────────────
current_paper = {
    "id": "",
    "title": "Waiting for arXiv Paper Alerts...",
    "score": 0
}
running = True

# ── HTTP helpers ──────────────────────────────────────────────────────────────
def http_trigger_fetch(base_url):
    """POST /trigger-fetch to start arXiv scraping."""
    try:
        url = f"{base_url}/trigger-fetch"
        data = json.dumps({"keywords": ""}).encode("utf-8")
        req = urllib.request.Request(
            url, data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return f"OK: {body.get('message', 'triggered')} (HTTP {resp.status})"
    except urllib.error.URLError as e:
        return f"FAIL: {e.reason}"
    except Exception as e:
        return f"FAIL: {e}"

def http_star_paper(base_url, paper_id):
    """PATCH /papers/{id}/star to star a paper."""
    try:
        url = f"{base_url}/papers/{paper_id}/star"
        data = json.dumps({"is_starred": True}).encode("utf-8")
        req = urllib.request.Request(
            url, data=data,
            headers={"Content-Type": "application/json"},
            method="PATCH"
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            return f"OK: Paper {paper_id} starred (HTTP {resp.status})"
    except urllib.error.URLError as e:
        return f"FAIL: {e.reason}"
    except Exception as e:
        return f"FAIL: {e}"

# ── OLED Display ──────────────────────────────────────────────────────────────
def print_oled_screen(status="ONLINE"):
    os.system('cls' if os.name == 'nt' else 'clear')
    title_truncated = (current_paper["title"][:45] + "...") if len(current_paper["title"]) > 48 else current_paper["title"]
    score_str = f"SCORE: {current_paper['score']}/100" if current_paper['score'] > 0 else "IDLE"

    print("=========================================================")
    print("     ESP32 DESK ASSISTANT - MQTT + HTTP SIMULATOR        ")
    print("=========================================================")
    print("+-------------------------------------------------------+")
    print(f"| STATUS: {status:<12}             {score_str:>17} |")
    print("|-------------------------------------------------------|")
    print(f"| TITLE: {title_truncated:<46} |")
    print(f"| ID:    {current_paper['id']:<46} |")
    print("|-------------------------------------------------------|")
    print("| [F] FETCH NOW              | [S] STAR PAPER           |")
    print("+-------------------------------------------------------+")
    print(f"\nMQTT  Broker : {BROKER_HOST}:{BROKER_PORT}")
    print(f"Backend URL  : {BACKEND_URL}")
    print("\nCommands: f = Fetch Papers | s = Star Paper | q = Quit")
    print("> ", end="", flush=True)

# ── MQTT Callbacks ────────────────────────────────────────────────────────────
def on_connect(client, userdata, flags, rc, *args):
    if rc == 0:
        print_oled_screen("CONNECTED")
        client.subscribe("radar/paper/high_relevance")
    else:
        print_oled_screen(f"MQTT ERR ({rc})")

def on_message(client, userdata, msg):
    global current_paper
    try:
        data = json.loads(msg.payload.decode("utf-8"))
        current_paper["id"]    = data.get("id", "")
        current_paper["title"] = data.get("title", "")
        current_paper["score"] = data.get("score", 0)
        print_oled_screen("ALERT!")
    except Exception:
        pass

# ── Input Handler ─────────────────────────────────────────────────────────────
def input_thread_func(client):
    global running, current_paper
    while running:
        try:
            cmd = input().strip().lower()

            if cmd == 'f':
                # Path 1: MQTT (mimics physical ESP32 button)
                print("\n[F] Sending FETCH_NOW via MQTT...")
                payload = json.dumps({"action": "FETCH_NOW", "timestamp": int(time.time())})
                client.publish("radar/control/button_fetch", payload)
                print("[MQTT] Published → radar/control/button_fetch")

                # Path 2: HTTP direct call (reliable fallback from outside Docker)
                print(f"[HTTP] Calling {BACKEND_URL}/trigger-fetch ...")
                result = http_trigger_fetch(BACKEND_URL)
                print(f"[HTTP] {result}")

                time.sleep(0.5)
                print_oled_screen("F: FETCH SENT")

            elif cmd == 's':
                if current_paper["id"]:
                    # Path 1: MQTT
                    print(f"\n[S] Starring paper {current_paper['id']} via MQTT...")
                    payload = json.dumps({"action": "STAR_CURRENT", "paper_id": current_paper["id"]})
                    client.publish("radar/control/button_star", payload)
                    print("[MQTT] Published → radar/control/button_star")

                    # Path 2: HTTP
                    print(f"[HTTP] Calling star API...")
                    result = http_star_paper(BACKEND_URL, current_paper["id"])
                    print(f"[HTTP] {result}")

                    time.sleep(0.5)
                    print_oled_screen("S: STARRED")
                else:
                    print("\n[S] No active paper to star!")
                    time.sleep(0.5)
                    print_oled_screen("NO PAPER")

            elif cmd == 'q':
                running = False
                print("Exiting simulator...")
                sys.exit(0)

        except (EOFError, KeyboardInterrupt):
            running = False
            sys.exit(0)

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    try:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="esp32_terminal_simulator")
    except AttributeError:
        client = mqtt.Client(client_id="esp32_terminal_simulator")

    client.on_connect = on_connect
    client.on_message = on_message

    print(f"Connecting to MQTT Broker at {BROKER_HOST}:{BROKER_PORT}...")
    print(f"Backend URL: {BACKEND_URL}")
    print("(Tip: set BACKEND_URL env var to your server URL, e.g. https://yourdomain.com/api/v1)\n")

    try:
        client.connect(BROKER_HOST, BROKER_PORT, 60)
    except Exception as e:
        print(f"[WARN] MQTT connect failed ({BROKER_HOST}:{BROKER_PORT}): {e}")
        print("[INFO] Continuing in HTTP-only mode...")

    client.loop_start()

    t = threading.Thread(target=input_thread_func, args=(client,), daemon=True)
    t.start()

    while running:
        time.sleep(0.5)

    client.loop_stop()
    client.disconnect()

if __name__ == "__main__":
    main()
