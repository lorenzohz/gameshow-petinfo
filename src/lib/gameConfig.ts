import { CardType, Team } from "./types";
import rawData from "../app/data.json";

export const CATEGORIES: { slug: string; label: string }[] = rawData.categories;
export const POINTS_VALUES = [200, 400, 600, 800, 1000];

export const CARD_LABELS: Record<CardType, string> = {
  valete: "Valete (J)",
  dama: "Dama (Q)",
  rei: "Rei (K)",
  coringa: "Coringa",
};

export const DEFAULT_TEAMS: Omit<Team, "score" | "cards" | "immuneNextDebuff">[] = [
  { id: "paus", naipe: "♣", name: "Equipe Paus", color: "#1f9d55" },
  { id: "copas", naipe: "♥", name: "Equipe Copas", color: "#e0473f" },
  { id: "espadas", naipe: "♠", name: "Equipe Espadas", color: "#7c3aed" },
  { id: "ouros", naipe: "♦", name: "Equipe Ouros", color: "#f2994a" },
];

export function makeInitialCards() {
  return [
    { type: "valete" as CardType, used: false },
    { type: "dama" as CardType, used: false },
    { type: "rei" as CardType, used: false },
    { type: "coringa" as CardType, used: false },
  ];
}

// ----- Roleta do Valete (buff) -----
// Cada item tem um peso relativo (soma não precisa ser 100)
export interface RouletteOption {
  id: string;
  label: string;
  weight: number;
  effect: {
    timeMultiplier?: number;
    scoreMultiplier?: number;
    speedBonusPerSecondLeft?: number;
    rerollOtherCard?: "buff" | "debuff"; // pequena chance de virar efeito de outra carta
  };
}

export const VALETE_BUFF_ROULETTE: RouletteOption[] = [
  {
    id: "tempo",
    label: "+50% no tempo de resposta",
    weight: 30,
    effect: { timeMultiplier: 1.5 },
  },
  {
    id: "pontuacao",
    label: "+50% na pontuação da pergunta",
    weight: 30,
    effect: { scoreMultiplier: 1.5 },
  },
  {
    id: "velocidade",
    label: "Bônus de velocidade: +10 pontos por segundo restante",
    weight: 30,
    effect: { speedBonusPerSecondLeft: 10 },
  },
  {
    id: "outra-carta",
    label: "Sorteia o efeito de outra carta buff (Dama, Rei ou Coringa)",
    weight: 10,
    effect: { rerollOtherCard: "buff" },
  },
];

export const VALETE_DEBUFF_ROULETTE: RouletteOption[] = [
  {
    id: "tempo",
    label: "-50% no tempo de resposta",
    weight: 30,
    effect: { timeMultiplier: 0.5 },
  },
  {
    id: "pontuacao",
    label: "-50% na pontuação da pergunta",
    weight: 30,
    effect: { scoreMultiplier: 0.5 },
  },
  {
    id: "lentidao",
    label: "Penalidade de lentidão: -10 pontos por segundo usado",
    weight: 30,
    effect: { speedBonusPerSecondLeft: -10 },
  },
  {
    id: "outra-carta",
    label: "Sorteia o efeito de outra carta debuff (Dama, Rei ou Coringa)",
    weight: 10,
    effect: { rerollOtherCard: "debuff" },
  },
];

export function spinRoulette(options: RouletteOption[]): RouletteOption {
  const total = options.reduce((s, o) => s + o.weight, 0);
  let r = Math.random() * total;
  for (const o of options) {
    if (r < o.weight) return o;
    r -= o.weight;
  }
  return options[options.length - 1];
}

export const NAIPE_ORDER = ["paus", "copas", "espadas", "ouros"];
