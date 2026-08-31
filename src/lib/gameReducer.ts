import { BoardCell, GameState, Team } from "./types";
import {
  CATEGORIES,
  DEFAULT_TEAMS,
  NAIPE_ORDER,
  POINTS_VALUES,
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
    })),
    order: [...NAIPE_ORDER],
    currentTeamIndex: 0,
    currentCategory: null,
    currentQuestionId: null,
    answeringTeamId: null,
    attemptedTeamIds: [],
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
  | { type: "ANSWER_RESULT"; correct: boolean }
  | { type: "SELECT_STEAL_TEAM"; teamId: string }
  | { type: "SKIP_STEAL" }
  | { type: "BACK_TO_BOARD" }
  | { type: "RESET_GAME" }
  | { type: "HYDRATE"; payload: GameState };

// Metade do valor da pergunta, arredondada, usada quando uma equipe tenta "roubar"
// a pergunta depois que outra equipe errou.
function stealValue(points: number): number {
  return Math.round(points / 2);
}

function closeQuestion(
  state: GameState,
  winningTeamId: string | null
): GameState {
  const nextIndex = (state.currentTeamIndex + 1) % state.order.length;
  const newBoard = state.board.map((c) =>
    c.id === state.currentQuestionId
      ? { ...c, answered: true, winningTeamId }
      : c
  );
  const allAnswered = newBoard.every((c) => c.answered);
  return {
    ...state,
    board: newBoard,
    currentCategory: null,
    currentQuestionId: null,
    answeringTeamId: null,
    attemptedTeamIds: [],
    currentTeamIndex: nextIndex,
    round: state.round + 1,
    phase: allAnswered ? "finished" : "spin-category",
  };
}

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
      const answeringTeamId = state.order[state.currentTeamIndex];
      return {
        ...state,
        currentQuestionId: action.questionId,
        answeringTeamId,
        attemptedTeamIds: [],
        phase: "answering",
      };
    }

    case "ANSWER_RESULT": {
      const answeringTeamId = state.answeringTeamId ?? state.order[state.currentTeamIndex];
      const team = findTeam(state, answeringTeamId);
      const cell = (rawData.questions as any[]).find(
        (q) => q.id === state.currentQuestionId
      );
      const basePoints = cell ? cell.points : 0;
      const isSteal = state.attemptedTeamIds.length > 0;
      const awardedPoints = isSteal ? stealValue(basePoints) : basePoints;

      if (action.correct) {
        const closed = closeQuestion(state, team.id);
        return {
          ...closed,
          teams: state.teams.map((t) =>
            t.id === team.id ? { ...t, score: t.score + awardedPoints } : t
          ),
          log: [
            ...state.log,
            isSteal
              ? `${team.name} roubou a pergunta e ganhou ${awardedPoints} pontos.`
              : `${team.name} acertou e ganhou ${awardedPoints} pontos.`,
          ],
        };
      }

      // Resposta errada: verifica se sobra alguma equipe que ainda não tentou
      const newAttempted = [...state.attemptedTeamIds, team.id];
      const eligibleTeams = state.teams.filter((t) => !newAttempted.includes(t.id));

      if (eligibleTeams.length === 0) {
        const closed = closeQuestion(state, null);
        return {
          ...closed,
          log: [
            ...state.log,
            `${team.name} errou. Nenhuma equipe pontuou nesta pergunta.`,
          ],
        };
      }

      return {
        ...state,
        attemptedTeamIds: newAttempted,
        answeringTeamId: null,
        phase: "steal-select",
        log: [
          ...state.log,
          isSteal ? `${team.name} errou a tentativa de roubo.` : `${team.name} errou.`,
        ],
      };
    }

    case "SELECT_STEAL_TEAM": {
      return {
        ...state,
        answeringTeamId: action.teamId,
        phase: "answering",
      };
    }

    case "SKIP_STEAL": {
      const closed = closeQuestion(state, null);
      return {
        ...closed,
        log: [...state.log, "Pergunta encerrada sem tentativa de roubo."],
      };
    }

    case "BACK_TO_BOARD": {
      return { ...state, phase: "spin-category" };
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
