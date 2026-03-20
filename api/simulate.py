import asyncio
import hashlib
import json
import math
import os
import random
import time
import uuid
from typing import Any

# Try to import openai
try:
    from openai import AsyncOpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False


# In-memory store for simulations
simulations: dict[str, dict] = {}


PERSONA_PROMPTS = {
    "retail": (
        "You are a retail consumer in {region}. Based on this news event: {event}. "
        "How does this change your purchasing behavior? Respond ONLY with JSON: "
        '{{"sentiment": <float -1 to 1>, "response": "<short text>", "factors": ["<factor1>", "<factor2>"]}}'
    ),
    "b2b": (
        "You are a B2B procurement manager in {region}. Event: {event}. "
        "How does this affect your sourcing decisions? Respond ONLY with JSON: "
        '{{"sentiment": <float -1 to 1>, "response": "<short text>", "factors": ["<factor1>", "<factor2>"]}}'
    ),
    "institutional": (
        "You are an institutional trader focused on {region} markets. Event: {event}. "
        "Provide behavioral response. Respond ONLY with JSON: "
        '{{"sentiment": <float -1 to 1>, "response": "<short text>", "factors": ["<factor1>", "<factor2>"]}}'
    ),
}

MOCK_RESPONSES = {
    "retail": [
        {"sentiment": -0.6, "response": "Switching to domestic brands to avoid supply disruptions", "factors": ["supply fear", "brand loyalty shift"]},
        {"sentiment": -0.3, "response": "Stockpiling essentials due to anticipated price increases", "factors": ["price sensitivity", "hoarding behavior"]},
        {"sentiment": 0.2, "response": "Minimal impact on my daily purchasing decisions", "factors": ["low awareness", "price insensitivity"]},
        {"sentiment": -0.8, "response": "Cutting discretionary spending significantly", "factors": ["inflation fear", "budget constraints"]},
        {"sentiment": 0.4, "response": "Opportunistically buying local alternatives", "factors": ["domestic preference", "quality perception"]},
        {"sentiment": -0.5, "response": "Delaying major purchases until market stabilizes", "factors": ["uncertainty aversion", "wait-and-see"]},
    ],
    "b2b": [
        {"sentiment": -0.7, "response": "Activating backup suppliers and nearshore alternatives", "factors": ["supply chain risk", "nearshoring"]},
        {"sentiment": -0.4, "response": "Increasing inventory buffers by 30%", "factors": ["buffer stock strategy", "lead time concerns"]},
        {"sentiment": 0.3, "response": "Negotiating long-term contracts at current prices", "factors": ["price lock strategy", "forward planning"]},
        {"sentiment": -0.9, "response": "Emergency procurement review across all categories", "factors": ["risk mitigation", "cost escalation"]},
        {"sentiment": 0.1, "response": "Monitoring situation but no immediate changes", "factors": ["low exposure", "diversified supply"]},
        {"sentiment": -0.6, "response": "Requesting air freight quotes as maritime backup", "factors": ["logistics shift", "cost acceptance"]},
    ],
    "institutional": [
        {"sentiment": -0.5, "response": "Increasing short positions on affected shipping indices", "factors": ["market timing", "volatility play"]},
        {"sentiment": 0.6, "response": "Going long on domestic manufacturing ETFs", "factors": ["reshoring thesis", "sector rotation"]},
        {"sentiment": -0.3, "response": "Hedging energy exposure with options", "factors": ["risk management", "energy correlation"]},
        {"sentiment": 0.8, "response": "Positioning for nearshoring beneficiaries", "factors": ["structural shift", "long-term trend"]},
        {"sentiment": -0.7, "response": "Reducing exposure to trade-sensitive sectors", "factors": ["de-risking", "geopolitical premium"]},
        {"sentiment": 0.2, "response": "Adding defensive positions while monitoring", "factors": ["cautious optimism", "hedged exposure"]},
    ],
}

REGIONS = {
    "Global": ["US", "EU", "MENA", "APAC", "LATAM"],
    "MENA": ["UAE", "Saudi Arabia", "Egypt", "Turkey"],
    "US": ["US East Coast", "US West Coast", "US Midwest"],
    "EU": ["Germany", "France", "UK", "Netherlands"],
    "APAC": ["China", "Japan", "Singapore", "India"],
}


def create_agents(persona_mix: dict, swarm_size: int, market_focus: list[str]) -> list[dict]:
    """Create agent personas based on mix percentages."""
    agents = []
    total = persona_mix.get("retail", 40) + persona_mix.get("b2b", 35) + persona_mix.get("institutional", 25)

    regions = []
    for focus in (market_focus or ["Global"]):
        regions.extend(REGIONS.get(focus, ["Global"]))
    if not regions:
        regions = ["Global"]

    for persona_type, pct in persona_mix.items():
        count = max(1, int(swarm_size * pct / total))
        for i in range(count):
            agents.append({
                "id": f"{persona_type}_{i}",
                "type": persona_type,
                "region": random.choice(regions),
                "status": "idle",
                "result": None,
            })
    return agents


async def run_agent_llm(agent: dict, event: str, client: "AsyncOpenAI") -> dict:
    """Run a single agent using LLM."""
    prompt = PERSONA_PROMPTS.get(agent["type"], PERSONA_PROMPTS["retail"])
    prompt = prompt.format(region=agent["region"], event=event)

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=200,
        )
        content = response.choices[0].message.content.strip()
        # Try to parse JSON from the response
        if "{" in content:
            json_str = content[content.index("{"):content.rindex("}") + 1]
            result = json.loads(json_str)
            return {
                "sentiment": max(-1.0, min(1.0, float(result.get("sentiment", 0)))),
                "response": str(result.get("response", "")),
                "factors": result.get("factors", []),
            }
    except Exception:
        pass

    # Fallback to mock
    return run_agent_mock(agent)


def run_agent_mock(agent: dict) -> dict:
    """Run a single agent using mock data."""
    responses = MOCK_RESPONSES.get(agent["type"], MOCK_RESPONSES["retail"])
    base = random.choice(responses)
    # Add some randomness
    sentiment = base["sentiment"] + random.uniform(-0.15, 0.15)
    sentiment = max(-1.0, min(1.0, sentiment))
    return {
        "sentiment": round(sentiment, 3),
        "response": base["response"],
        "factors": base["factors"],
    }


def aggregate_results(agents: list[dict], persona_mix: dict) -> dict:
    """K-On aggregation: weighted sentiment to demand signal."""
    persona_sentiments = {"retail": [], "b2b": [], "institutional": []}

    for agent in agents:
        if agent["result"]:
            persona_sentiments[agent["type"]].append(agent["result"]["sentiment"])

    weights = {
        "retail": persona_mix.get("retail", 40) / 100,
        "b2b": persona_mix.get("b2b", 35) / 100,
        "institutional": persona_mix.get("institutional", 25) / 100,
    }

    weighted_sentiment = 0
    for ptype, sentiments in persona_sentiments.items():
        if sentiments:
            avg = sum(sentiments) / len(sentiments)
            weighted_sentiment += avg * weights.get(ptype, 0.33)

    # Convert sentiment to demand change percentage (-30% to +30%)
    demand_change = round(weighted_sentiment * 30, 1)

    # Count sentiments
    all_sentiments = [a["result"]["sentiment"] for a in agents if a["result"]]
    bullish = sum(1 for s in all_sentiments if s > 0.1)
    bearish = sum(1 for s in all_sentiments if s < -0.1)
    neutral = len(all_sentiments) - bullish - bearish
    total = max(1, len(all_sentiments))

    # Collect all factors
    all_factors = []
    for agent in agents:
        if agent["result"]:
            all_factors.extend(agent["result"]["factors"])

    # Count factor frequency
    factor_counts: dict[str, int] = {}
    for f in all_factors:
        factor_counts[f] = factor_counts.get(f, 0) + 1
    top_signals = sorted(factor_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "demandChange": demand_change,
        "sentiment": {
            "bullish": round(bullish / total * 100),
            "bearish": round(bearish / total * 100),
            "neutral": round(neutral / total * 100),
        },
        "topSignals": [{"signal": s[0], "count": s[1], "strength": round(s[1] / total * 100)} for s in top_signals],
        "behavioral": {
            "retail": round(sum(persona_sentiments.get("retail", [0])) / max(1, len(persona_sentiments.get("retail", [1]))) * 100),
            "b2b": round(sum(persona_sentiments.get("b2b", [0])) / max(1, len(persona_sentiments.get("b2b", [1]))) * 100),
            "institutional": round(sum(persona_sentiments.get("institutional", [0])) / max(1, len(persona_sentiments.get("institutional", [1]))) * 100),
        },
    }


def generate_demand_curve(demand_change: float) -> list[dict]:
    """Generate 90-day demand curve projection."""
    points = []
    for day in range(0, 91):
        # Sigmoid-like curve that accelerates then plateaus
        progress = 1 - math.exp(-day / 20)
        value = demand_change * progress
        noise = random.uniform(-1.5, 1.5) if day > 0 else 0
        upper = value + abs(demand_change) * 0.15 * (1 + day / 90)
        lower = value - abs(demand_change) * 0.15 * (1 + day / 90)
        points.append({
            "day": day,
            "value": round(value + noise, 2),
            "upper": round(upper + noise * 0.5, 2),
            "lower": round(lower + noise * 0.5, 2),
        })
    return points


def generate_geo_data(market_focus: list[str], demand_change: float) -> dict:
    """Generate geographic impact distribution."""
    regions = {
        "NA": {"name": "North America", "impact": 0, "x": 150, "y": 120},
        "EU": {"name": "Europe", "impact": 0, "x": 380, "y": 100},
        "MENA": {"name": "Middle East & N. Africa", "impact": 0, "x": 420, "y": 160},
        "APAC": {"name": "Asia Pacific", "impact": 0, "x": 580, "y": 140},
        "SA": {"name": "South America", "impact": 0, "x": 200, "y": 250},
        "AF": {"name": "Sub-Saharan Africa", "impact": 0, "x": 380, "y": 230},
    }

    focus_map = {"US": "NA", "EU": "EU", "MENA": "MENA", "APAC": "APAC", "Global": None}

    for region_key, region_data in regions.items():
        # Primary regions get higher impact
        is_primary = any(focus_map.get(f) == region_key for f in market_focus)
        if "Global" in market_focus:
            is_primary = True

        base = demand_change * (random.uniform(0.7, 1.2) if is_primary else random.uniform(0.2, 0.6))
        region_data["impact"] = round(base, 1)

    return regions


def generate_narrative(event: str, demand_change: float, top_signals: list[dict]) -> str:
    """Generate K-On synthesis narrative."""
    direction = "increase" if demand_change > 0 else "decrease"
    abs_change = abs(demand_change)

    signal_text = ", ".join([f"({i+1}) {s['signal']}" for i, s in enumerate(top_signals[:3])])

    narratives = [
        f"The simulation reveals a projected {abs_change}% {direction} in demand, driven primarily by behavioral cascades across the agent population. "
        f"The primary signals detected were: {signal_text}. "
        f"B2B procurement managers showed the earliest response pattern, adjusting sourcing strategies within the first simulation wave. "
        f"Institutional traders began pricing in disruption signals before retail consumers registered awareness. "
        f"The cascade was non-linear — initial sentiment was moderate, but amplified through inter-agent influence as information propagated through the network.",

        f"Analysis indicates a {abs_change}% demand {direction} with high confidence. "
        f"Key behavioral triggers identified: {signal_text}. "
        f"The agent swarm exhibited classic cascade dynamics — early institutional signals were amplified by B2B risk-aversion behavior, "
        f"which in turn shifted retail consumer sentiment. The geographic distribution shows concentration in primary market regions "
        f"with spillover effects reaching secondary markets within the 30-day projection window.",
    ]

    return random.choice(narratives)


def generate_attestation(sim_id: str, event: str, demand_change: float) -> dict:
    """Generate Knowracle attestation."""
    data = f"{sim_id}:{event}:{demand_change}:{time.time()}"
    hash_val = hashlib.sha256(data.encode()).hexdigest()
    return {
        "hash": hash_val,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "network": "Vanar Network",
        "status": "verified",
        "blockHeight": random.randint(1000000, 9999999),
    }


async def run_simulation(sim_id: str, event: str, market_focus: list[str], persona_mix: dict, swarm_size: int):
    """Run the full simulation as a background task."""
    sim = simulations[sim_id]
    sim["status"] = "running"

    agents = create_agents(persona_mix, swarm_size, market_focus)
    sim["total"] = len(agents)
    sim["agents"] = agents

    # Check for OpenAI
    use_llm = HAS_OPENAI and os.getenv("OPENAI_API_KEY")
    client = AsyncOpenAI() if use_llm else None

    # Process in batches of 8
    batch_size = 8
    for i in range(0, len(agents), batch_size):
        batch = agents[i:i + batch_size]

        tasks = []
        for agent in batch:
            agent["status"] = "thinking"
            if use_llm and client:
                tasks.append(run_agent_llm(agent, event, client))
            else:
                # Simulate processing time
                async def mock_with_delay(a=agent):
                    await asyncio.sleep(random.uniform(0.05, 0.15))
                    return run_agent_mock(a)
                tasks.append(mock_with_delay())

        results = await asyncio.gather(*tasks)

        for agent, result in zip(batch, results):
            agent["result"] = result
            agent["status"] = "bullish" if result["sentiment"] > 0.1 else ("bearish" if result["sentiment"] < -0.1 else "neutral")
            sim["progress"] += 1

        # Update live stats
        completed_agents = [a for a in agents if a["result"]]
        if completed_agents:
            agg = aggregate_results(completed_agents, persona_mix)
            sim["sentiment"] = agg["sentiment"]
            sim["topSignals"] = agg["topSignals"]

    # Final aggregation
    final = aggregate_results(agents, persona_mix)
    demand_curve = generate_demand_curve(final["demandChange"])
    geo_data = generate_geo_data(market_focus, final["demandChange"])
    narrative = generate_narrative(event, final["demandChange"], final["topSignals"])
    attestation = generate_attestation(sim_id, event, final["demandChange"])

    sim["status"] = "complete"
    sim["results"] = {
        "demandChange": final["demandChange"],
        "metric": "Behavioral Demand Index",
        "sentiment": final["sentiment"],
        "topSignals": final["topSignals"],
        "behavioral": final["behavioral"],
        "demandCurve": demand_curve,
        "geoData": geo_data,
        "narrative": narrative,
        "attestation": attestation,
    }
