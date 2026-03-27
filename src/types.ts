export interface Project {
  id: string;
  name: string;
  phase: string;
  pos: number; // Probability of Success (%)
  marketPotential: number; // eNPV ($B)
  budget: number; // $M
  strategicScore: number;
  toxicityRisk: boolean;
  confidence: number; // 0 to 1
  patentLife: number; // Years
  rdCost: number; // $M
  description: string;
  predictions: {
    year: number;
    phase: string;
    marketShare: number;
  }[];
}

export type StrategicTendency = 'commercial' | 'science' | 'balanced';
