#include <Arduino.h>
#include <WiFi.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <SSD1306Wire.h>
#include <ArduinoJson.h>

// Configuration & Pins
#ifndef OLED_SDA
#define OLED_SDA 21
#endif
#ifndef OLED_SCL
#define OLED_SCL 22
#endif
#ifndef BTN_FETCH_PIN
#define BTN_FETCH_PIN 12
#endif
#ifndef BTN_STAR_PIN
#define BTN_STAR_PIN 14
#endif
#ifndef LED_PIN
#define LED_PIN 2
#endif

// Default MQTT Broker Address (Can be updated via Serial/Config)
const char* mqtt_broker = "192.168.1.100"; // Replace with your Server/Laptop IP or Broker Host
const int mqtt_port = 1883;

// Objects
SSD1306Wire display(0x3c, OLED_SDA, OLED_SCL);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// State Variables
String currentPaperID = "";
String currentPaperTitle = "No Alerts Yet";
int currentPaperScore = 0;
volatile bool btnFetchPressed = false;
volatile bool btnStarPressed = false;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 300;

// Interrupt Handlers
void IRAM_ATTR handleBtnFetchInterrupt() {
  if ((millis() - lastDebounceTime) > debounceDelay) {
    btnFetchPressed = true;
    lastDebounceTime = millis();
  }
}

void IRAM_ATTR handleBtnStarInterrupt() {
  if ((millis() - lastDebounceTime) > debounceDelay) {
    btnStarPressed = true;
    lastDebounceTime = millis();
  }
}

// Function Declarations
void updateOLEDDisplay(String statusHeader, String title, int score);
void mqttCallback(char* topic, byte* payload, unsigned int length);
void reconnectMQTT();

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  pinMode(BTN_FETCH_PIN, INPUT_PULLUP);
  pinMode(BTN_STAR_PIN, INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(BTN_FETCH_PIN), handleBtnFetchInterrupt, FALLING);
  attachInterrupt(digitalPinToInterrupt(BTN_STAR_PIN), handleBtnStarInterrupt, FALLING);

  // Initialize OLED
  display.init();
  display.flipScreenVertically();
  display.setFont(ArialMT_Plain_10);
  updateOLEDDisplay("RADAR BOOTING", "Connecting WiFi...", 0);

  // WiFiManager Setup
  WiFiManager wm;
  wm.setConnectTimeout(30);
  bool res = wm.autoConnect("PaperRadar-ESP32-AP");

  if (!res) {
    Serial.println("Failed to connect to WiFi. Restarting...");
    updateOLEDDisplay("WIFI ERROR", "Connection Failed", 0);
    delay(3000);
    ESP.restart();
  }

  Serial.println("WiFi Connected!");
  updateOLEDDisplay("WIFI CONNECTED", "Connecting MQTT...", 0);

  // MQTT Setup
  mqttClient.setServer(mqtt_broker, mqtt_port);
  mqttClient.setCallback(mqttCallback);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Handle Button 1 (Fetch Trigger)
  if (btnFetchPressed) {
    btnFetchPressed = false;
    Serial.println("[ESP32] Button 1 Pressed: Sending FETCH_NOW command");
    
    // LED Feedback
    digitalWrite(LED_PIN, HIGH);
    updateOLEDDisplay("ACTION TRIGGER", "Fetching arXiv...", currentPaperScore);

    StaticJsonDocument<128> doc;
    doc["action"] = "FETCH_NOW";
    doc["timestamp"] = millis();

    char buffer[128];
    serializeJson(doc, buffer);
    mqttClient.publish("radar/control/button_fetch", buffer);

    delay(500);
    digitalWrite(LED_PIN, LOW);
    updateOLEDDisplay("PAPER RADAR", currentPaperTitle, currentPaperScore);
  }

  // Handle Button 2 (Star Trigger)
  if (btnStarPressed) {
    btnStarPressed = false;
    Serial.println("[ESP32] Button 2 Pressed: Sending STAR_CURRENT command");

    digitalWrite(LED_PIN, HIGH);
    if (currentPaperID.length() > 0) {
      updateOLEDDisplay("ACTION TRIGGER", "Starring Paper...", currentPaperScore);

      StaticJsonDocument<128> doc;
      doc["action"] = "STAR_CURRENT";
      doc["paper_id"] = currentPaperID;

      char buffer[128];
      serializeJson(doc, buffer);
      mqttClient.publish("radar/control/button_star", buffer);
    } else {
      updateOLEDDisplay("ACTION NOTICE", "No Paper to Star", 0);
    }

    delay(500);
    digitalWrite(LED_PIN, LOW);
    updateOLEDDisplay("PAPER RADAR", currentPaperTitle, currentPaperScore);
  }
}

void updateOLEDDisplay(String statusHeader, String title, int score) {
  display.clear();
  
  // Header Bar
  display.setFont(ArialMT_Plain_10);
  display.drawString(0, 0, statusHeader);
  if (score > 0) {
    display.drawString(90, 0, "S:" + String(score));
  }
  display.drawLine(0, 13, 128, 13);

  // Content Area
  display.setFont(ArialMT_Plain_10);
  display.drawStringMaxWidth(0, 16, 128, title);

  // Footer Line
  display.drawLine(0, 52, 128, 52);
  display.drawString(0, 54, "B1:Fetch  B2:Star");

  display.display();
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("[MQTT Callback] Topic: ");
  Serial.println(topic);

  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) {
    Serial.print("JSON Parse error: ");
    Serial.println(error.c_str());
    return;
  }

  if (String(topic) == "radar/paper/high_relevance") {
    currentPaperID = doc["id"].as<String>();
    currentPaperTitle = doc["title"].as<String>();
    currentPaperScore = doc["score"].as<int>();

    Serial.printf("[ALERT] High Relevance Paper Received! ID: %s, Score: %d\n", currentPaperID.c_str(), currentPaperScore);

    // Blink LED 3 times for high relevance alert
    for (int i = 0; i < 3; i++) {
      digitalWrite(LED_PIN, HIGH);
      delay(100);
      digitalWrite(LED_PIN, LOW);
      delay(100);
    }

    updateOLEDDisplay("HIGH RELEVANCE", currentPaperTitle, currentPaperScore);
  }
}

void reconnectMQTT() {
  static unsigned long lastReconnectAttempt = 0;
  if (millis() - lastReconnectAttempt > 5000) {
    lastReconnectAttempt = millis();
    Serial.print("Connecting to MQTT Broker...");
    String clientId = "ESP32DeskAssistant-" + String(random(0xffff), HEX);
    
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println(" connected!");
      mqttClient.subscribe("radar/paper/high_relevance");
      updateOLEDDisplay("PAPER RADAR", currentPaperTitle, currentPaperScore);
    } else {
      Serial.print(" failed, rc=");
      Serial.println(mqttClient.state());
    }
  }
}
