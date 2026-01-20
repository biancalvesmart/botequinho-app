export enum AppRoute {
  LOBBY = 'lobby',
  HOME = 'home',
  SHOP = 'shop',
  BANK = 'bank',
  COOKBOOK = 'cookbook'
}

export interface Ingredient {
  code: string;
  name: string;
  score: number; 
  cost?: number; 
}

export interface Recipe {
  code: string;
  name: string;
  value: number;
  state?: string;        
  ingredients?: string[]; 
  inputs?: string[];      
  instructions?: string;  
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
  financialLog: LogEntry[];
}

export interface LogEntry {
  id: string;
  type: 'gain' | 'loss';
  amount: number;
  description: string;
  timestamp: number;
}
