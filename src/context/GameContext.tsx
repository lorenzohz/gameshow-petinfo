"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { gameReducer, buildInitialState, Action } from "../lib/gameReducer";
import { GameState } from "../lib/types";

const STORAGE_KEY = "quem-sabe-faz-state-v1";

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  hydrated: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, buildInitialState);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;
        dispatch({ type: "HYDRATE", payload: parsed });
      }
    } catch (e) {
      console.warn("Falha ao carregar estado salvo", e);
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change (after hydration to avoid overwriting saved state with initial state)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Falha ao salvar estado", e);
    }
  }, [state, hydrated]);

  return (
    <GameContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame deve ser usado dentro de <GameProvider>");
  return ctx;
}
