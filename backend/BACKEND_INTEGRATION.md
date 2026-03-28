# 🛰️ Solar Sentinel: Backend Integration Guide (V1.1)

This document serves as the **Technical Architecture Blueprint** for backend enhancements required by the **Phase 12 (Elite Visuals)** and future operational features. 

---

## 🛠️ Required API Endpoints (Future)

### 1. Real-Time Risk Push (WebSockets)
**Purpose**: Replace polling for `riskScore` and `cmeEvents` with real-time pushes to the frontend HUD.
- **Protocol**: STOMP over WebSocket.
- **Topic**: `/topic/threat-matrix`
- **Data Shape**:
  ```json
  {
    "score": 85.4,
    "level": "CRITICAL",
    "active_anomalies": ["CME_2104", "GEO_STORM_X9"]
  }
  ```

### 2. Historical Trend Analytics
**Purpose**: Enable the "Mission Archive Search" to fetch data for specific dates.
- **Endpoint**: `GET /api/solar/archive`
- **Params**: `startDate`, `endDate`, `sensorType` (XRAY, MAG, KP).
- **Controller Logic**: Should query the PostgreSQL `solar_data` table with optimized indexing on `timestamp`.

---

## 🗄️ Database Schema Updates

### `mission_events` Table
To support the "Satellite SMS Relay" and "Sector Impact" features:
| Column | Type | Description |
|--------|------|-------------|
| `event_id` | UUID | Primary Key |
| `type` | VARCHAR | CME, FLARE, RADIO_BLACKOUT |
| `severity` | INT | scale 1-5 |
| `notified` | BOOLEAN | SMS relay success state |

---

## 🧠 AI Prediction (Advanced Hooks)

### Feature: Local LLM Chain of Thought
**Requirement**: Add a new service `LlamaDecisionService` that:
1.  Fetches `SwpcData`.
2.  Prompts Ollama (Llama 3.1 8B) with precise constraints.
3.  Returns a human-readable "Strategic Advice" for the Tactical Hub.

---

> [!IMPORTANT]
> **Implementation Note**: Do NOT modify the production Java code for these features until the Frontend VFX pass (Phase 12) is fully validated. Use the internal Java Simulation for testing.
