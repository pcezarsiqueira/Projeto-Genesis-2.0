/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CalorDimension {
  nome: string;
  pontuacao: number;
  percentual: number;
}

export interface TemperaturaResult {
  grau: string;       // e.g. "37°"
  nome: string;       // e.g. "Temperatura Real"
  status: string;     // e.g. "Limbic Balance"
  descricao: string;  // Detailed explanation
}

export interface EnneagramProfile {
  tipo: number;       // 2, 3, 4, 5, 6
  nome: string;       // "O Ajudante", etc.
  vicioInconsciente: string; // Orgulho, Vaidade, etc.
  irradia: string;
  vazaSemPerceber: string;
  perfilComunicacao: string;
}

export interface DeepAnalysis {
  analise_profunda: string;
  incongruencia_principal: string;
  situacao_de_risco: string;
  proxima_consciencia: string;
}

export interface RadarDimension {
  nome: string;
  pontuacao: number;
  percentual: number;
}

export interface DiagnosisResult {
  temperatura: TemperaturaResult;
  eneagrama: EnneagramProfile;
  radarDimensoes: RadarDimension[]; // 9 dimensions
  calorDimensoes: CalorDimension[];   // 7 dimensions
  calorEmocional: number; // 0-100
  magnetismo: number; // 0-100
  sinalCorporal: string; // Leaking physical leak
  deepAnalysis: DeepAnalysis;
}

export interface Lesson {
  id: string;
  title: string;
  body: string;
  exemploReal: string;
  exercicioPratico: string;
}

export interface Module {
  id: string;
  title: string;
  icon: string;
  description: string;
  lessonsCount: number;
}

export interface Question {
  id: number;
  scenario: string;
  imageUrl?: string;
  options: {
    letter: "A" | "B" | "C" | "D";
    text: string;
    points: {
      leitura: number;
      influencia: number;
      resistencia: number;
      presenca: number;
    };
  }[];
}

export interface GenesisLeadData {
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  linkedin?: string;
  interestTag?: string;
  privacyConsent: boolean;
  communicationConsent: boolean;
}

export interface GenesisDimensionScore {
  key: "clareza" | "identidade" | "energia" | "estrutura" | "acao";
  nome: string;
  score: number; // 0 to 100
}

export interface GenesisDiagnosticResult {
  diagnosticId: string;
  firstName: string;
  indiceGenesis: number; // 0 to 100
  estagio: "Bloqueio" | "Reorganização" | "Movimento" | "Consolidação" | "Expansão";
  estagioCor: string;
  estagioDescricao: string;
  dimensionScores: GenesisDimensionScore[];
  strongestDimensions: string[];
  weakestDimensions: string[];
  weakestDimensionKey: string;
  interestTag?: string;
  recommendations: {
    titulo: string;
    passos: string[];
  };
  projections: {
    hoje: GenesisDimensionScore[];
    dia3: GenesisDimensionScore[];
    dia7: GenesisDimensionScore[];
    dia21: GenesisDimensionScore[];
  };
}

export interface UserProgress {
  uid: string;
  name: string;
  email: string;
  isPro: boolean;
  proType?: "mensal" | "vitalicio";
  paymentStatus?: "unpaid" | "paid" | "freemium";
  completedLessons: string[]; // lessonIds like "lc_1"
  activeDays: number;
  profileType?: string;
  interestTag?: string;
  genesisResult?: GenesisDiagnosticResult;
  diagnosisResult?: DiagnosisResult;
}
