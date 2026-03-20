const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SimulationRequest {
  event: string;
  marketFocus: string[];
  personaMix: { retail: number; b2b: number; institutional: number };
  swarmSize: number;
}

export interface AgentResult {
  id: string;
  type: string;
  region: string;
  status: "idle" | "thinking" | "bullish" | "bearish" | "neutral";
  sentiment: number | null;
}

export interface SimulationStatus {
  status: "initializing" | "running" | "complete";
  progress: number;
  total: number;
  sentiment: { bullish: number; bearish: number; neutral: number };
  topSignals: { signal: string; count: number; strength: number }[];
  agentResults: AgentResult[];
}

export interface DemandCurvePoint {
  day: number;
  value: number;
  upper: number;
  lower: number;
}

export interface GeoRegion {
  name: string;
  impact: number;
}

export interface SimulationResults {
  demandChange: number;
  metric: string;
  sentiment: { bullish: number; bearish: number; neutral: number };
  topSignals: { signal: string; count: number; strength: number }[];
  behavioral: { retail: number; b2b: number; institutional: number };
  demandCurve: DemandCurvePoint[];
  geoData: Record<string, GeoRegion>;
  narrative: string;
  attestation: {
    hash: string;
    timestamp: string;
    network: string;
    status: string;
    blockHeight: number;
  };
}

export interface PreMortemData {
  event: string;
  demandChange: number;
  metric: string;
  predictions: { category: string; predicted: string; actual: string; accuracy: number }[];
  overallAccuracy: number;
  sentiment: { bullish: number; bearish: number; neutral: number };
  behavioral: { retail: number; b2b: number; institutional: number };
  narrative: string;
  demandCurve: DemandCurvePoint[];
  geoData: Record<string, GeoRegion>;
  attestation: {
    hash: string;
    timestamp: string;
    network: string;
    status: string;
    blockHeight: number;
  };
}

export async function createSimulation(req: SimulationRequest): Promise<{ simulationId: string }> {
  const res = await fetch(`${API_URL}/api/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return res.json();
}

export async function getSimulationStatus(id: string): Promise<SimulationStatus> {
  const res = await fetch(`${API_URL}/api/simulation/${id}/status`);
  return res.json();
}

export async function getSimulationResults(id: string): Promise<SimulationResults> {
  const res = await fetch(`${API_URL}/api/simulation/${id}/results`);
  return res.json();
}

export async function getPreMortem(): Promise<PreMortemData> {
  const res = await fetch(`${API_URL}/api/demo/pre-mortem`);
  return res.json();
}
