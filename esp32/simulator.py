#!/usr/bin/env python3
"""
Autonomous Academic Paper Radar - ESP32 Hardware Simulator
Simulates the ESP32 Desk Assistant via MQTT in terminal without needing physical hardware.
"""

import json
import os
import sys
import time
import threading

try:
    import paho.mqtt.client as mqtt
except ImportError:
    print("[Simulator Error] 'paho-mqtt' library is not installed locally.")
    print("Installing paho-mqtt via pip...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paho-mqtt"])
    import paho.mqtt.client as mqtt

BROKER_HOST = os.environ.get("MQTT_BROKER_HOST", "localhost")
BROKER_PORT = int(os.environ.get("MQTT_BROKER_PORT", 1883))

current_paper = {
    "id": "",
    "title": "Waiting for arXiv Paper Alerts...",
    "score": 0
}
running = True

def print_oled_screen(status="ONLINE"):
    os.system('cls' if os.name == 'nt' else 'clear')
    title_truncated = (current_paper["title"][:45] + "...") if len(current_paper["title"]) > 48 else current_paper["title"]
    score_str = f"SCORE: {current_paper['score']}/100" if current_paper['score'] > 0 else "IDLE"

    print("=========================================================")
    print("     ESP32 DESK ASSISTANT - MQTT HARDWARE SIMULATOR      ")
    print("=========================================================")
    print("+-------------------------------------------------------+")
    print(f"| status: {status:<12}            {score_str:>18} |")
    print("|-------------------------------------------------------|")
    print(f"| TITLE: {title_truncated:<46} |")
    print(f"| ID:    {current_paper['id']:<46} |")
    print("|-------------------------------------------------------|")
    print("| [F] Button 1: FETCH NOW    | [S] Button 2: STAR PAPER |")
    print("+-------------------------------------------------------+")
    print("\nCommands: Type 'f' + Enter to Fetch | 's' + Enter to Star | 'q' to Quit")
    print("> ", end="", flush=True)

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print_oled_screen("CONNECTED")
        client.subscribe("radar/paper/high_relevance")
    else:
        print_oled_screen(f"ERROR ({rc})")

def on_message(client, userdata, msg):
    global current_paper
    try:
        data = json.loads(msg.payload.decode("utf-8"))
        current_paper["id"] = data.get("id", "")
        current_paper["title"] = data.get("title", "")
        current_paper["score"] = data.get("score", 0)
        print_oled_screen("ALERT RECEIVED!")
    except Exception as e:
        pass

def input_thread_func(client):
    global running, current_paper
    while running:
        try:
            cmd = input().strip().lower()
            if cmd == 'f':
                print("[ESP32 Simulator] Sending BUTTON 1 (FETCH_NOW) signal...")
                payload = json.dumps({"action": "FETCH_NOW", "timestamp": int(time.time())})
                client.publish("radar/control/button_fetch", payload)
                time.sleep(1)
                print_oled_screen("FETCH TRIGGERED")
            elif cmd == 's':
                if current_paper["id"]:
                    print(f"[ESP32 Simulator] Sending BUTTON 2 (STAR_CURRENT) for paper {current_paper['id']}...")
                    payload = json.dumps({"action": "STAR_CURRENT", "paper_id": current_paper["id"]})
                    client.publish("radar/control/button_star", payload)
                    time.sleep(1)
                    print_oled_screen("PAPER STARRED")
                else:
                    print("[ESP32 Simulator] No active paper to star!")
                    time.sleep(1)
                    print_oled_screen("NO PAPER")
            elif cmd == 'q':
                running = False
                print("[ESP32 Simulator] Exiting...")
                sys.exit(0)
        except (EOFError, KeyboardInterrupt):
            running = False
            sys.exit(0)

def main():
    client = mqtt.Client(client_id="esp32_terminal_simulator")
    client.on_connect = on_connect
    client.on_message = on_message

    print(f"Connecting to MQTT Broker at {BROKER_HOST}:{BROKER_PORT}...")
    try:
        client.connect(BROKER_HOST, BROKER_PORT, 60)
    except Exception as e:
        print(f"Failed to connect to MQTT broker ({BROKER_HOST}:{BROKER_PORT}): {e}")
        print("Tip: Make sure Mosquitto broker container is running (docker compose up -d broker)")

    client.loop_start()

    t = threading.Thread(target=input_thread_func, args=(client,), daemon=True)
    t.start()

    while running:
        time.sleep(0.5)

    client.loop_stop()
    client.disconnect()

if __name__ == "__main__":
    main()
