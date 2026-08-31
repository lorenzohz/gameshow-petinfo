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
        phase: "answering",
      };
    }

    case "ANSWER_RESULT": {
      const currentTeamId = state.order[state.currentTeamIndex];
      const team = findTeam(state, currentTeamId);
      const cell = (rawData.questions as any[]).find(
        (q) => q.id === state.currentQuestionId
      );
      const basePoints = cell ? cell.points : 0;
      const scoreDelta = action.correct ? basePoints : 0;

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
        teams: state.teams.map((t) =>
          t.id === team.id ? { ...t, score: t.score + scoreDelta } : t
        ),
        currentCategory: null,
        currentQuestionId: null,
        currentTeamIndex: nextIndex,
        round: state.round + 1,
        phase: allAnswered ? "finished" : "spin-category",
        log: [
          ...state.log,
          action.correct
            ? `${team.name} acertou e ganhou ${scoreDelta} pontos.`
            : `${team.name} errou.`,
        ],
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
