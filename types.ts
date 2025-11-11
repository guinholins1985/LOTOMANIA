export interface GameConfig {
  numGames: string;
  fixedNumbers: string;
  groups: string;
  targetConcurso: string;
  ultraSystem: boolean;
  mirrorBet: boolean;
  advancedAnalysis: boolean;
}

export interface PremiacaoItem {
  acertos: number;
  vencedores: number;
  premio: string;
}

export interface LastResult {
  concurso: number;
  data: string;
  numeros: string[];
  acumuladoProximoConcurso: string;
  premiacao: PremiacaoItem[];
}

export interface GeneratedGames {
  analysis: string;
  games: string[][];
}

export interface CheckedGame {
  gameNumbers: string[];
  hitCount: number;
  hits: Set<string>;
}
