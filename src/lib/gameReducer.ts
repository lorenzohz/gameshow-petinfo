import {
  ActiveEffect,
  BoardCell,
  CardMode,
  CardType,
  GameState,
  Team,
} from "./types";
import {
  CATEGORIES,
  DEFAULT_TEAMS,
  NAIPE_ORDER,
  POINTS_VALUES,
  makeInitialCards,
} from "./gameConfig";
import rawData from "../app/data.json";

function buildInitialBoard(): BoardCell[] {
  return (rawData.questions as any[]).map((q) => ({
    id: q.id,
    category: q.category,
    points: q.points,
    answered: false,
    winningTeamId: null,
  }));
}

export function buildInitialState(): GameState {
  return {
    initialized: true,
    phase: "setup",
    teams: DEFAULT_TEAMS.map((t) => ({
      ...t,
      score: 0,
      cards: makeInitialCards(),
      immuneNextDebuff: false,
      lastRestoredCard: null,
    })),
    order: [...NAIPE_ORDER],
    currentTeamIndex: 0,
    currentCategory: null,
    currentQuestionId: null,
    activeEffects: [],
    board: buildInitialBoard(),
    round: 0,
    log: [],
  };
}

export type Action =
  | { type: "RENAME_TEAM"; teamId: string; name: string }
  | { type: "START_GAME" }
  | { type: "DRAW_STARTING_TEAM"; teamId: string }
  | { type: "COMMIT_CATEGORY"; category: string }
  | { type: "PICK_QUESTION"; questionId: number }
  | {
      type: "PLAY_CARD";
      teamId: string;
      mode: CardMode;
      cardType: CardType;
      targetTeamId?: string;
      resolvedEffect?: Partial<ActiveEffect>; // for valete roulette result, or dama amplification target
      amplifyEffectId?: string; // for dama debuff
    }
  | { type: "LOCK_CARDS" }
  | {
      type: "ANSWER_RESULT";
      correct: boolean;
      secondsLeft: number;
      appliedTime: number;
      soloConfirmed?: boolean;
    }
  | { type: "BACK_TO_BOARD" }
  | { type: "RESET_GAME" }
  | { type: "HYDRATE"; payload: GameState };

function findTeam(state: GameState, teamId: string): Team {
  const t = state.teams.find((tm) => tm.id === teamId);
  if (!t) throw new Error("time nao encontrado: " + teamId);
  return t;
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "RENAME_TEAM": {
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.teamId ? { ...t, name: action.name } : t
        ),
      };
    }

    case "START_GAME": {
      return { ...state, phase: "draw-start" };
    }

    case "DRAW_STARTING_TEAM": {
      const startIdx = NAIPE_ORDER.indexOf(action.teamId);
      const order = [
        ...NAIPE_ORDER.slice(startIdx),
        ...NAIPE_ORDER.slice(0, startIdx),
      ];
      return {
        ...state,
        order,
        currentTeamIndex: 0,
        phase: "spin-category",
        round: 1,
        log: [...state.log, `Equipe sorteada para começar: ${action.teamId}`],
      };
    }

    case "COMMIT_CATEGORY": {
      return {
        ...state,
        currentCategory: action.category,
        phase: "pick-question",
      };
    }

    case "PICK_QUESTION": {
      return {
        ...state,
        currentQuestionId: action.questionId,
        phase: "card-phase",
        activeEffects: [],
      };
    }

    case "PLAY_CARD": {
      const team = findTeam(state, action.teamId);
      if (action.mode === "debuff") {
        if (!action.targetTeamId) return state;
        const target = findTeam(state, action.targetTeamId);
        if (target.immuneNextDebuff) {
          return {
            ...state,
            log: [
              ...state.log,
              `${target.name} está imune a debuffs nesta rodada — jogada bloqueada.`,
            ],
          };
        }
      }

      // Dama buff: prevent a debuff (consume card, set immunity, no active effect entry)
      if (action.cardType === "dama" && action.mode === "buff") {
        return {
          ...state,
          teams: state.teams.map((t) =>
            t.id === team.id
              ? {
                  ...t,
                  cards: t.cards.map((c) =>
                    c.type === "dama" ? { ...c, used: true } : c
                  ),
                  immuneNextDebuff: true,
                }
              : t
          ),
          log: [...state.log, `${team.name} jogou Dama (buff): imune a debuff.`],
        };
      }

      // Dama debuff: amplify an existing active effect
      if (action.cardType === "dama" && action.mode === "debuff") {
        const targetId = action.amplifyEffectId;
        const effects = state.activeEffects.map((e) => {
          if (e.id !== targetId) return e;
          return {
            ...e,
            timeMultiplier: e.timeMultiplier ? e.timeMultiplier * 0.7 : e.timeMultiplier,
            scoreMultiplier: e.scoreMultiplier ? e.scoreMultiplier * 0.7 : e.scoreMultiplier,
            speedBonusPerSecondLeft: e.speedBonusPerSecondLeft
              ? e.speedBonusPerSecondLeft * 2
              : e.speedBonusPerSecondLeft,
            amplified: true,
          };
        });
        return {
          ...state,
          activeEffects: effects,
          teams: state.teams.map((t) =>
            t.id === team.id
              ? {
                  ...t,
                  cards: t.cards.map((c) =>
                    c.type === "dama" ? { ...c, used: true } : c
                  ),
                }
              : t
          ),
          log: [...state.log, `${team.name} jogou Dama (debuff): amplificou um debuff.`],
        };
      }

      // Rei buff: solo answer, x3 if correct
      if (action.cardType === "rei" && action.mode === "buff") {
        const effect: ActiveEffect = {
          id: `${team.id}-rei-buff-${Date.now()}`,
          ownerTeamId: team.id,
          mode: "buff",
          cardType: "rei",
          label: `${team.name}: Rei — só uma pessoa responde, x3 se acertar sozinha`,
          soloKing: true,
        };
        return {
          ...state,
          activeEffects: [...state.activeEffects, effect],
          teams: state.teams.map((t) =>
            t.id === team.id
              ? { ...t, cards: t.cards.map((c) => (c.type === "rei" ? { ...c, used: true } : c)) }
              : t
          ),
          log: [...state.log, `${team.name} jogou Rei (buff).`],
        };
      }

      // Rei debuff: enemy nominates a speaker on the answering team
      if (action.cardType === "rei" && action.mode === "debuff" && action.targetTeamId) {
        const effect: ActiveEffect = {
          id: `${team.id}-rei-debuff-${Date.now()}`,
          ownerTeamId: team.id,
          mode: "debuff",
          cardType: "rei",
          label: `${team.name} escolheu um "Rei" adversário: só ele fala, resto só mímica`,
          enemyKing: true,
        };
        return {
          ...state,
          activeEffects: [...state.activeEffects, effect],
          teams: state.teams.map((t) =>
            t.id === team.id
              ? { ...t, cards: t.cards.map((c) => (c.type === "rei" ? { ...c, used: true } : c)) }
              : t
          ),
          log: [...state.log, `${team.name} jogou Rei (debuff) contra ${action.targetTeamId}.`],
        };
      }

      // Coringa buff: x3 correct / -pontos errado
      if (action.cardType === "coringa" && action.mode === "buff") {
        const effect: ActiveEffect = {
          id: `${team.id}-coringa-buff-${Date.now()}`,
          ownerTeamId: team.id,
          mode: "buff",
          cardType: "coringa",
          label: `${team.name}: Coringa — x3 se acertar, perde os pontos da pergunta se errar`,
          jokerBuff: true,
        };
        return {
          ...state,
          activeEffects: [...state.activeEffects, effect],
          teams: state.teams.map((t) =>
            t.id === team.id
              ? { ...t, cards: t.cards.map((c) => (c.type === "coringa" ? { ...c, used: true } : c)) }
              : t
          ),
          log: [...state.log, `${team.name} jogou Coringa (buff).`],
        };
      }

      // Coringa debuff: pontuação x2, tempo x0.5 para quem vai responder
      if (action.cardType === "coringa" && action.mode === "debuff" && action.targetTeamId) {
        const effect: ActiveEffect = {
          id: `${team.id}-coringa-debuff-${Date.now()}`,
          ownerTeamId: team.id,
          mode: "debuff",
          cardType: "coringa",
          label: `${team.name} jogou Coringa (debuff): pontuação x2, tempo pela metade`,
          scoreMultiplier: 2,
          timeMultiplier: 0.5,
        };
        return {
          ...state,
          activeEffects: [...state.activeEffects, effect],
          teams: state.teams.map((t) =>
            t.id === team.id
              ? { ...t, cards: t.cards.map((c) => (c.type === "coringa" ? { ...c, used: true } : c)) }
              : t
          ),
          log: [...state.log, `${team.name} jogou Coringa (debuff) contra ${action.targetTeamId}.`],
        };
      }

      // Valete buff/debuff: resolved value comes from the roulette component
      if (action.cardType === "valete" && action.resolvedEffect) {
        const effect: ActiveEffect = {
          id: `${team.id}-valete-${action.mode}-${Date.now()}`,
          ownerTeamId: team.id,
          mode: action.mode,
          cardType: "valete",
          label: action.resolvedEffect.label || "Valete",
          timeMultiplier: action.resolvedEffect.timeMultiplier,
          scoreMultiplier: action.resolvedEffect.scoreMultiplier,
          speedBonusPerSecondLeft: action.resolvedEffect.speedBonusPerSecondLeft,
        };
        return {
          ...state,
          activeEffects: [...state.activeEffects, effect],
          teams: state.teams.map((t) =>
            t.id === team.id
              ? { ...t, cards: t.cards.map((c) => (c.type === "valete" ? { ...c, used: true } : c)) }
              : t
          ),
          log: [...state.log, `${team.name} jogou Valete (${action.mode}): ${effect.label}`],
        };
      }

      return state;
    }

    case "LOCK_CARDS": {
      return { ...state, phase: "answering" };
    }

    case "ANSWER_RESULT": {
      const currentTeamId = state.order[state.currentTeamIndex];
      const team = findTeam(state, currentTeamId);
      const cell = (rawData.questions as any[]).find(
        (q) => q.id === state.currentQuestionId
      );
      const basePoints = cell ? cell.points : 0;

      const timeMultiplier = state.activeEffects.reduce(
        (m, e) => m * (e.timeMultiplier ?? 1),
        1
      );
      const scoreMultiplier = state.activeEffects.reduce(
        (m, e) => m * (e.scoreMultiplier ?? 1),
        1
      );
      const speedRate = state.activeEffects.reduce(
        (s, e) => s + (e.speedBonusPerSecondLeft ?? 0),
        0
      );
      const jokerBuffActive = state.activeEffects.some((e) => e.jokerBuff);
      const soloKingActive = state.activeEffects.some((e) => e.soloKing);

      let scoreDelta = 0;
      let restoredCard: CardType | null = null;

      if (action.correct) {
        let score = basePoints * scoreMultiplier;
        if (speedRate > 0) {
          score += speedRate * action.secondsLeft;
        } else if (speedRate < 0) {
          const secondsUsed = Math.max(action.appliedTime - action.secondsLeft, 0);
          score += speedRate * secondsUsed;
        }
        if (jokerBuffActive) {
          score = basePoints * 3;
        }
        if (soloKingActive && action.soloConfirmed) {
          score = score * 3;
        }
        scoreDelta = Math.round(score);

        const usedCards = team.cards.filter((c) => c.used);
        if (usedCards.length > 0) {
          restoredCard =
            usedCards[Math.floor(Math.random() * usedCards.length)].type;
        }
      } else {
        if (jokerBuffActive) {
          scoreDelta = -basePoints;
        }
      }

      const newOrder = state.order;
      const nextIndex = (state.currentTeamIndex + 1) % newOrder.length;

      const newBoard = state.board.map((c) =>
        c.id === state.currentQuestionId
          ? { ...c, answered: true, winningTeamId: action.correct ? team.id : null }
          : c
      );
      const allAnswered = newBoard.every((c) => c.answered);

      return {
        ...state,
        board: newBoard,
        teams: state.teams.map((t) => {
          if (t.id !== team.id) return { ...t, immuneNextDebuff: false };
          return {
            ...t,
            score: t.score + scoreDelta,
            immuneNextDebuff: false,
            cards: restoredCard
              ? (() => {
                  let restored = false;
                  return t.cards.map((c) => {
                    if (!restored && c.used && c.type === restoredCard) {
                      restored = true;
                      return { ...c, used: false };
                    }
                    return c;
                  });
                })()
              : t.cards,
            lastRestoredCard: restoredCard,
          };
        }),
        activeEffects: [],
        currentCategory: null,
        currentQuestionId: null,
        currentTeamIndex: nextIndex,
        round: state.round + 1,
        phase: allAnswered ? "finished" : "spin-category",
        log: [
          ...state.log,
          action.correct
            ? `${team.name} acertou e ganhou ${scoreDelta} pontos.`
            : `${team.name} errou.${jokerBuffActive ? ` Perdeu ${basePoints} pontos (Coringa).` : ""}`,
        ],
      };
    }

    case "BACK_TO_BOARD": {
      return { ...state, phase: "spin-category", activeEffects: [] };
    }

    case "RESET_GAME": {
      return buildInitialState();
    }

    case "HYDRATE": {
      return action.payload;
    }

    default:
      return state;
  }
}

export { buildInitialBoard };
export const ALL_CATEGORIES = CATEGORIES.map((c) => c.slug);
export const ALL_POINTS = POINTS_VALUES;

export function getAvailableCategories(board: BoardCell[]): string[] {
  return ALL_CATEGORIES.filter((cat) =>
    board.some((c) => c.category === cat && !c.answered)
  );
}

export function getAvailableCells(board: BoardCell[], category: string): BoardCell[] {
  return board
    .filter((c) => c.category === category && !c.answered)
    .sort((a, b) => a.points - b.points);
}

export function getQuestionById(id: number) {
  return (rawData.questions as any[]).find((q) => q.id === id) || null;
}
