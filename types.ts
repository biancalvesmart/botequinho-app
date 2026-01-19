
export interface Ingredient {
  name: string;
  code: string; // Format: I-[score]-0-[id]
  score: number;
}

export interface Recipe {
  name: string;
  code: string; // Format: R-[value]-[state]-[id]
  value: number;
  state: string;
  ingredients: string[];
  instructions: string;
}

export interface FinancialEvent {
  id: string;
  type: 'gain' | 'loss';
  amount: number;
  description: string;
  timestamp: number;
}

export interface Pot {
  id: number;
  recipeCode: string | null;
  startTime: number | null;
}

export interface PlayerData {
  name: string;
  coins: number;
  inventory: string[];
  pots: Pot[];
  hasTransactedThisRound: boolean;
}

export interface GameState {
  isStarted: boolean;
  players: PlayerData[];
  financialLog: FinancialEvent[];
}

export enum AppRoute {
  LOBBY = 'lobby',
  HOME = 'home',
  SHOP = 'shop',
  BANK = 'bank',
  COOKBOOK = 'cookbook'
}
