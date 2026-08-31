import { Team } from "./types";
import rawData from "../app/data.json";

export const CATEGORIES: { slug: string; label: string }[] = rawData.categories;
export const POINTS_VALUES = [200, 400, 600, 800, 1000];

export const DEFAULT_TEAMS: Omit<Team, "score">[] = [
  { id: "paus", naipe: "♣", name: "Equipe Paus", color: "#1f9d55" },
  { id: "copas", naipe: "♥", name: "Equipe Copas", color: "#e0473f" },
  { id: "espadas", naipe: "♠", name: "Equipe Espadas", color: "#7c3aed" },
  { id: "ouros", naipe: "♦", name: "Equipe Ouros", color: "#f2994a" },
];

export const NAIPE_ORDER = ["paus", "copas", "espadas", "ouros"];
