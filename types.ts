export interface Premiacao {
  acertos: number;
  vencedores: number;
  premio: string;
}

export interface LastResult {
  concurso: number;
  data: string;
  numeros: string[];
  acumuladoProximoConcurso: string;
  premiacao: Premiacao[];
}

export interface GameConfig {
  numGames: string;
  fixedNumbers: string;
  groups: string;
  targetConcurso: string;
  ultraSystem: boolean;
  mirrorBet: boolean;
  advancedAnalysis: boolean;
}

export interface GeneratedGames {
  analysis: string;
  games: string[][];
}

export interface CheckedGame {
  game: string[];
  hits: number;
  hitNumbers: Set<string>;
  prize: number;
}
