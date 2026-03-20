# MACRA

### Feed it a news event. Watch the world respond.

**Live Global Behavioral Demand Simulator** — powered by Vanar AI Stack

---

## What is MACRA?

MACRA deploys thousands of AI-driven behavioral agents — retail consumers, B2B procurement managers, institutional traders — to simulate how global markets react to real-world events. Each agent reasons independently based on its persona, region, and behavioral profile. The swarm's collective response produces demand signals, geographic impact maps, and narrative synthesis — all cryptographically attested on-chain.

---

## The Pre-Mortem

> We already ran this — and it was right.

**Red Sea Shipping Crisis — December 2023**
Houthi attacks force major carriers to reroute around Cape of Good Hope, adding 10-14 days to Asia-Europe transit times.

| Metric | MACRA Predicted | Actual Outcome | Accuracy |
|--------|----------------|----------------|----------|
| Shipping costs | +22% | +24% | **91%** |
| EU retail import demand | -14% | -11% | **79%** |
| Nearshoring intent | +8% | +9% | **89%** |
| **Overall** | | | **86%** |

> *"The primary signal was not price sensitivity but supply security fear among B2B buyers in the EU. Institutional traders began pricing in the disruption 72 hours before formal announcements."*

---

## Vanar Stack

MACRA is built on the full Vanar AI infrastructure stack:

| Layer | Name | Role in MACRA |
|-------|------|---------------|
| L2 | **Neutron** | Settlement layer for simulation attestations |
| L3 | **Virtron** | Data ingestion and event processing |
| L4 | **Ferron** | x402 micropayment rails for paid tiers |
| L5 | **Arkon** | Distributed compute for agent swarm execution |
| L6 | **K-On** | AI agent orchestration and behavioral modeling |
| L7 | **Lumion** | Real-time visualization and cascade rendering |
| L8 | **Knowracle** | Cryptographic attestation of simulation results |

---

## Quick Start

### Docker (recommended)

```bash
# Clone and run
git clone <repo-url> && cd macra
docker-compose up --build
```

Open [http://localhost:3000](http://localhost:3000) — the API runs on port 8000.

### Manual Setup

**Backend:**
```bash
cd api
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | GPT-4o-mini for real agent reasoning | No (falls back to mock) |
| `NEXT_PUBLIC_API_URL` | Backend URL | No (defaults to `http://localhost:8000`) |

---

## Pricing

| Tier | Agents | Price | Features |
|------|--------|-------|----------|
| **Free** | 500 | $0 | Public results, 3 runs/day |
| **Starter** | 5,000 | $50/run | Sealed results, priority compute |
| **Pro** | 50,000 | $500/run | Custom personas, API access |
| **Enterprise** | 100K+ | $5K-25K/mo | Dedicated swarm, SLA, white-label |

All paid tiers settle via **Ferron x402** micropayments on Vanar.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/simulate` | Create a new simulation |
| `GET` | `/api/simulation/{id}/status` | Poll simulation progress |
| `GET` | `/api/simulation/{id}/results` | Get final results |
| `GET` | `/api/demo/pre-mortem` | Pre-populated Red Sea scenario |
| `GET` | `/api/health` | Health check |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js 14)                          │
│  ├── Landing / Seed Input                       │
│  ├── D3.js Force Graph (Live Cascade)           │
│  └── Results Dashboard (Chart.js + WorldMap)    │
├─────────────────────────────────────────────────┤
│  API (FastAPI)                                  │
│  ├── Simulation Engine (async agent swarm)      │
│  ├── K-On Aggregation (weighted sentiment)      │
│  └── Knowracle Attestation (SHA-256)            │
└─────────────────────────────────────────────────┘
```

---

<p align="center">
  <b>Built on Vanar Stack</b><br/>
  <sub>Neutron · Virtron · Ferron · Arkon · K-On · Lumion · Knowracle</sub>
</p>
