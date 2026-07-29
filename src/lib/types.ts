export type CardType = "valete" | "dama" | "rei" | "coringa";
export type CardMode = "buff" | "debuff";
export type Phase =
  | "setup"
  | "draw-start"
  | "spin-category"
  | "pick-question"
  | "card-phase"
  | "answering"
  | "resolve"
  | "finished";

export interface CardState {
  type: CardType;
  used: boolean;
}

// A resolved, ready-to-apply effect on the answering team for the current question
export interface ActiveEffect {
  id: string; // unique instance id
  ownerTeamId: string; // team whose card produced this effect
  mode: CardMode; // buff (owner used it on themselves) or debuff (owner used it on target)
  cardType: CardType;
  label: string; // human readable description
  timeMultiplier?: number; // multiplies time available
  scoreMultiplier?: number; // multiplies points earned on correct answer
  speedBonusPerSecondLeft?: number; // extra points per second left when correct
  speedPenaltyPerSecondUsed?: number; // points lost per second used, applied on correct too (only for debuff variant)
  soloKing?: boolean; // rei buff: only one player may answer, x3 if correct alone
  enemyKing?: boolean; // rei debuff: opposing team nominates one speaker, rest mimics
  jokerBuff?: boolean; // coringa buff: x3 correct / -points wrong
  jokerDebuff?: boolean; // coringa debuff: already encoded via multipliers above
  amplified?: boolean; // dama debuff: this effect was amplified
}

export interface Team {
  id: string; // paus | copas | espadas | ouros
  naipe: string; // display suit symbol
  name: string;
  color: string; // tailwind-safe hex
  score: number;
  cards: CardState[];
  immuneNextDebuff: boolean;
  lastRestoredCard?: CardType | null;
}

export interface BoardCell {
  id: number;
  category: string;
  points: number;
  answered: boolean;
  winningTeamId?: string | null;
}

export interface PendingCardPlay {
  teamId: string;
  mode: CardMode;
  cardType: CardType;
  targetTeamId?: string; // required for debuff
}

export interface GameState {
  initialized: boolean;
  phase: Phase;
  teams: Team[];
  order: string[]; // rotation order of team ids, fixed after draw
  currentTeamIndex: number; // index into order, whose turn it is to answer
  currentCategory: string | null;
  currentQuestionId: number | null;
  activeEffects: ActiveEffect[]; // effects queued up for the current question
  board: BoardCell[];
  round: number;
  log: string[];
}
