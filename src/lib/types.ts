export type Phase =
  | "setup"
  | "draw-start"
  | "spin-category"
  | "pick-question"
  | "answering"
  | "resolve"
  | "finished";

export interface Team {
  id: string; // paus | copas | espadas | ouros
  naipe: string; // display suit symbol
  name: string;
  color: string; // tailwind-safe hex
  score: number;
}

export interface BoardCell {
  id: number;
  category: string;
  points: number;
  answered: boolean;
  winningTeamId?: string | null;
}

export interface GameState {
  initialized: boolean;
  phase: Phase;
  teams: Team[];
  order: string[]; // rotation order of team ids, fixed after draw
  currentTeamIndex: number; // index into order, whose turn it is to answer
  currentCategory: string | null;
  currentQuestionId: number | null;
  board: BoardCell[];
  round: number;
  log: string[];
}
