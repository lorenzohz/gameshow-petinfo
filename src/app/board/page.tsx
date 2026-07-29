"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import BoardGrid from "../../components/BoardGrid";
import TeamPanel from "../../components/TeamPanel";
import CardPhasePanel from "../../components/CardPhasePanel";
import RouletteSpinner from "../../components/RouletteSpinner";
import { CATEGORIES } from "../../lib/gameConfig";
import { getAvailableCategories } from "../../lib/gameReducer";
import "../globals.css";

export default function BoardPage() {
  const { state, dispatch, hydrated } = useGame();
  const router = useRouter();
  const [drawing, setDrawing] = useState(false);
  const [spinningCategory, setSpinningCategory] = useState(false);

  useEffect(() => {
    if (hydrated && state.phase === "setup") {
      router.push("/setup");
    }
  }, [hydrated, state.phase, router]);

  if (!hydrated || state.phase === "setup") return null;

  const currentTeamId = state.order[state.currentTeamIndex];
  const currentTeam = state.teams.find((t) => t.id === currentTeamId);

  const handleReset = () => {
    if (confirm("Isso vai zerar todo o placar e as cartas. Continuar?")) {
      dispatch({ type: "RESET_GAME" });
      router.push("/setup");
    }
  };

  return (
    <div className="flex flex-col h-full w-full gap-6 py-6 px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-golden text-4xl">Show do Quem Sabe Faz Ao Vivo</h1>
        <button
          onClick={handleReset}
          className="text-beige/60 text-sm border border-beige/30 px-3 py-1 rounded hover:bg-beige/10"
        >
          Resetar jogo
        </button>
      </div>

      <div className="flex justify-center gap-6 flex-wrap">
        {state.order.map((id) => {
          const team = state.teams.find((t) => t.id === id)!;
          return <TeamPanel key={id} team={team} active={id === currentTeamId} />;
        })}
      </div>

      {state.phase === "draw-start" && (
        <div className="flex flex-col items-center gap-6 mt-10">
          <p className="text-beige text-2xl">Sorteando quem começa a partida...</p>
          {!drawing && (
            <button
              onClick={() => setDrawing(true)}
              className="bg-golden text-darkbrown font-bold text-xl px-8 py-3 rounded-xl hover:scale-105 transition-transform"
            >
              Girar sorteio
            </button>
          )}
          {drawing && (
            <RouletteSpinner
              items={state.teams.map((t) => ({ id: t.id, label: `${t.naipe} ${t.name}`, weight: 1 }))}
              onFinish={(opt) => dispatch({ type: "DRAW_STARTING_TEAM", teamId: opt.id })}
            />
          )}
        </div>
      )}

      {state.phase === "spin-category" && currentTeam && (
        <div className="flex flex-col items-center gap-6 mt-6">
          <p className="text-beige text-2xl">
            Vez de {currentTeam.naipe} {currentTeam.name} — girando a categoria...
          </p>
          {!spinningCategory && (
            <button
              onClick={() => setSpinningCategory(true)}
              className="bg-golden text-darkbrown font-bold text-xl px-8 py-3 rounded-xl hover:scale-105 transition-transform"
            >
              Girar roleta de tema
            </button>
          )}
          {spinningCategory && (
            <RouletteSpinner
              items={getAvailableCategories(state.board).map((slug) => ({
                id: slug,
                label: CATEGORIES.find((c) => c.slug === slug)?.label || slug,
                weight: 1,
              }))}
              onFinish={(opt) => {
                dispatch({ type: "COMMIT_CATEGORY", category: opt.id });
                setSpinningCategory(false);
              }}
            />
          )}
        </div>
      )}

      {state.phase === "pick-question" && currentTeam && (
        <div className="flex flex-col items-center gap-2 mt-6">
          <p className="text-beige text-2xl">
            {currentTeam.naipe} {currentTeam.name}, escolha o valor da pergunta em{" "}
            <span className="text-golden">
              {CATEGORIES.find((c) => c.slug === state.currentCategory)?.label}
            </span>
          </p>
        </div>
      )}

      {state.phase === "card-phase" && (
        <CardPhasePanel
          state={state}
          dispatch={dispatch}
          onProceed={() => router.push("/question")}
        />
      )}

      {state.phase === "answering" && (
        <div className="flex flex-col items-center gap-6 mt-10">
          <p className="text-beige text-2xl">A pergunta está em andamento.</p>
          <button
            onClick={() => router.push("/question")}
            className="bg-golden text-darkbrown font-bold text-xl px-8 py-3 rounded-xl hover:scale-105 transition-transform"
          >
            Ir para a pergunta
          </button>
        </div>
      )}

      {(state.phase === "spin-category" || state.phase === "pick-question") && (
        <BoardGrid
          board={state.board}
          activeCategory={state.phase === "pick-question" ? state.currentCategory : null}
          clickable={state.phase === "pick-question"}
          onPick={(cell) => dispatch({ type: "PICK_QUESTION", questionId: cell.id })}
        />
      )}

      {state.phase === "finished" && (
        <div className="flex flex-col items-center gap-6 mt-10">
          <h2 className="text-golden text-5xl">Fim de jogo!</h2>
          <div className="flex flex-col gap-2 text-beige text-2xl">
            {[...state.teams]
              .sort((a, b) => b.score - a.score)
              .map((t, idx) => (
                <p key={t.id}>
                  {idx + 1}º — {t.naipe} {t.name}: {t.score} pts
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
