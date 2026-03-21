import uuid
import asyncio
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from simulate import simulations, run_simulation, create_agents

app = FastAPI(title="MACRA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationRequest(BaseModel):
    event: str
    marketFocus: list[str] = ["Global"]
    personaMix: dict = {"retail": 40, "b2b": 35, "institutional": 25}
    swarmSize: int = 500


@app.post("/api/simulate")
async def create_simulation(req: SimulationRequest, background_tasks: BackgroundTasks):
    sim_id = str(uuid.uuid4())[:8]
    # Pre-create all agents immediately so the ForceGraph renders on first poll
    agents = create_agents(req.personaMix, req.swarmSize, req.marketFocus)
    simulations[sim_id] = {
        "id": sim_id,
        "event": req.event,
        "status": "initializing",
        "progress": 0,
        "total": len(agents),
        "agents": agents,
        "sentiment": {"bullish": 0, "bearish": 0, "neutral": 100},
        "topSignals": [],
        "results": None,
    }
    background_tasks.add_task(run_simulation, sim_id, req.event, req.marketFocus, req.personaMix, req.swarmSize)
    return {"simulationId": sim_id}


@app.get("/api/simulation/{sim_id}/status")
async def get_simulation_status(sim_id: str):
    sim = simulations.get(sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")

    agent_results = []
    for agent in sim.get("agents", []):
        agent_results.append({
            "id": agent["id"],
            "type": agent["type"],
            "region": agent["region"],
            "status": agent["status"],
            "sentiment": agent["result"]["sentiment"] if agent["result"] else None,
            "response": agent["result"]["response"] if agent["result"] else None,
        })

    return {
        "status": sim["status"],
        "progress": sim["progress"],
        "total": sim["total"],
        "sentiment": sim["sentiment"],
        "topSignals": sim["topSignals"],
        "agentResults": agent_results,
        "recentResponses": sim.get("recentResponses", []),
    }


@app.get("/api/simulation/{sim_id}/results")
async def get_simulation_results(sim_id: str):
    sim = simulations.get(sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    if sim["status"] != "complete":
        raise HTTPException(status_code=202, detail="Simulation not yet complete")
    return sim["results"]


@app.get("/api/demo/pre-mortem")
async def get_pre_mortem():
    return {
        "event": "Red Sea shipping crisis — Houthi attacks force major carriers to reroute around Cape of Good Hope, adding 10-14 days to Asia-Europe transit times",
        "demandChange": 22,
        "metric": "Shipping Cost Index",
        "predictions": [
            {"category": "Shipping costs", "predicted": "+22%", "actual": "+24%", "accuracy": 91},
            {"category": "EU retail import demand", "predicted": "-14%", "actual": "-11%", "accuracy": 79},
            {"category": "Nearshoring intent", "predicted": "+8%", "actual": "+9%", "accuracy": 89},
        ],
        "overallAccuracy": 86,
        "sentiment": {"bullish": 18, "bearish": 64, "neutral": 18},
        "behavioral": {"retail": -42, "b2b": -68, "institutional": 24},
        "narrative": "The primary signal was not price sensitivity but supply security fear among B2B buyers in the EU. Institutional traders began pricing in the disruption 72 hours before formal announcements. The cascade was triggered by three interdependent signals: (1) war risk advisory language matching historical patterns, (2) B2B procurement managers switching to air freight quotes, (3) retail consumer sentiment in Germany shifting to domestic-brand preference.",
        "demandCurve": [
            {"day": 0, "value": 0, "upper": 3.3, "lower": -3.3},
            {"day": 7, "value": 7.2, "upper": 10.8, "lower": 3.6},
            {"day": 14, "value": 12.8, "upper": 17.0, "lower": 8.6},
            {"day": 21, "value": 17.1, "upper": 22.1, "lower": 12.1},
            {"day": 30, "value": 19.4, "upper": 25.2, "lower": 13.6},
            {"day": 45, "value": 21.0, "upper": 27.5, "lower": 14.5},
            {"day": 60, "value": 21.6, "upper": 28.8, "lower": 14.4},
            {"day": 90, "value": 22.0, "upper": 29.8, "lower": 14.2},
        ],
        "geoData": {
            "NA": {"name": "North America", "impact": 8.2},
            "EU": {"name": "Europe", "impact": 22.4},
            "MENA": {"name": "Middle East & N. Africa", "impact": 26.1},
            "APAC": {"name": "Asia Pacific", "impact": 18.7},
            "SA": {"name": "South America", "impact": 5.3},
            "AF": {"name": "Sub-Saharan Africa", "impact": 11.8},
        },
        "attestation": {
            "hash": "a3f8c2d1e9b74a0e5c6d8f2a1b3e7c9d4f6a8b0c2e4d6f8a0b2c4e6d8f0a2b4",
            "timestamp": "2023-12-18T14:32:00Z",
            "network": "Vanar Network",
            "status": "verified",
            "blockHeight": 4287651,
        },
    }


@app.get("/api/health")
async def health():
    import os, importlib
    has_openai = importlib.util.find_spec("openai") is not None
    key_set = bool(os.getenv("OPENROUTER_API_KEY"))
    return {
        "status": "ok",
        "service": "macra-api",
        "has_openai": has_openai,
        "key_set": key_set,
        "llm_ready": has_openai and key_set,
    }
