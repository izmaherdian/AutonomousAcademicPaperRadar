class WebSocketClient {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectTimer = null;
    this.isConnected = false;
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsURL = `${protocol}//${window.location.host}/ws`;

    console.log('[WebSocket] Connecting to:', wsURL);
    this.ws = new WebSocket(wsURL);

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected');
      this.isConnected = true;
      this.notifyListeners('STATUS_CHANGE', { connected: true });
    };

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('[WebSocket] Event received:', payload.event, payload.data);
        this.notifyListeners(payload.event, payload.data);
      } catch (err) {
        console.error('[WebSocket] Message parse error:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('[WebSocket] Connection closed. Reconnecting in 3s...');
      this.isConnected = false;
      this.notifyListeners('STATUS_CHANGE', { connected: false });
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('[WebSocket] Error:', err);
    };
  }

  scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
      }
    };
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => cb(data));
    }
  }
}

export const wsClient = new WebSocketClient();
