package mqtt

import (
	"encoding/json"
	"log"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type MQTTClient struct {
	client            mqtt.Client
	OnFetchTriggered  func()
	OnStarTriggered   func(paperID string)
}

type HighRelevancePayload struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Score int    `json:"score"`
}

type ControlPayload struct {
	Action    string `json:"action"`
	PaperID   string `json:"paper_id,omitempty"`
	Timestamp int64  `json:"timestamp,omitempty"`
}

func NewMQTTClient(brokerAddr string) *MQTTClient {
	opts := mqtt.NewClientOptions()
	opts.AddBroker("tcp://" + brokerAddr)
	opts.SetClientID("paper_radar_backend")
	opts.SetKeepAlive(60 * time.Second)
	opts.SetPingTimeout(10 * time.Second)
	opts.SetAutoReconnect(true)

	c := &MQTTClient{}

	opts.OnConnect = func(client mqtt.Client) {
		log.Printf("[MQTT] Connected to Mosquitto broker at: %s", brokerAddr)
		c.subscribeTopics()
	}

	opts.OnConnectionLost = func(client mqtt.Client, err error) {
		log.Printf("[MQTT] Connection lost: %v", err)
	}

	client := mqtt.NewClient(opts)
	c.client = client
	return c
}

func (m *MQTTClient) Connect() error {
	if token := m.client.Connect(); token.Wait() && token.Error() != nil {
		return token.Error()
	}
	return nil
}

func (m *MQTTClient) subscribeTopics() {
	// Subscribe to button fetch trigger
	m.client.Subscribe("radar/control/button_fetch", 1, func(client mqtt.Client, msg mqtt.Message) {
		log.Printf("[MQTT] Received button_fetch message: %s", string(msg.Payload()))
		if m.OnFetchTriggered != nil {
			go m.OnFetchTriggered()
		}
	})

	// Subscribe to button star trigger
	m.client.Subscribe("radar/control/button_star", 1, func(client mqtt.Client, msg mqtt.Message) {
		log.Printf("[MQTT] Received button_star message: %s", string(msg.Payload()))
		var payload ControlPayload
		if err := json.Unmarshal(msg.Payload(), &payload); err == nil && payload.PaperID != "" {
			if m.OnStarTriggered != nil {
				go m.OnStarTriggered(payload.PaperID)
			}
		}
	})
}

func (m *MQTTClient) PublishHighRelevanceAlert(paperID, title string, score int) {
	if !m.client.IsConnected() {
		log.Printf("[MQTT] Warning: Cannot publish alert, client not connected")
		return
	}

	payload := HighRelevancePayload{
		ID:    paperID,
		Title: title,
		Score: score,
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return
	}

	token := m.client.Publish("radar/paper/high_relevance", 1, false, jsonBytes)
	token.Wait()
	log.Printf("[MQTT] Published high relevance alert for paper [%s]: score %d", paperID, score)
}
