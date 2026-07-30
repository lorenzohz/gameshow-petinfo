"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import BoardGrid from "../../components/BoardGrid";
import TeamPanel from "../../components/TeamPanel";
import CardPhasePanel from "../../components/CardPhasePanel";
import RouletteWheel from "../../components/RouletteWheel";
import RouletteOverlay from "../../components/RouletteOverlay";
import { CATEGORIES } from "../../lib/gameConfig";
import { getAvailableCategories } from "../../lib/gameReducer";

const BIG_WHEEL = "w-[78vmin] h-[78vmin] max-w-[620px] max-h-[620px]";

export default function BoardPage() {
  const { state, dispatch, hydrated } = useGame();
  const router = useRouter();
  const [drawing, setDrawing] = useState(false);
  const [spinningCategory, setSpinningCategory] = useState(false);

  useEffect(() => {
    if (hydrated && state.phase === "setup") {
      router.push("/");
    }
  }, [hydrated, state.phase, router]);

  if (!hydrated || state.phase === "setup") return null;

  const currentTeamId = state.order[state.currentTeamIndex];
  const currentTeam = state.teams.find((t) => t.id === currentTeamId);

  const handleReset = () => {
    if (confirm("Isso vai zerar todo o placar e as cartas. Continuar?")) {
      dispatch({ type: "RESET_GAME" });
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <main className="w-full max-w-6xl flex flex-col items-center gap-6 px-4 sm:px-6 pt-8 pb-10">
        <div className="flex justify-center gap-4 flex-wrap w-full">
          {state.order.map((id) => {
            const team = state.teams.find((t) => t.id === id)!;
            return <TeamPanel key={id} team={team} active={id === currentTeamId} />;
          })}
        </div>

        {state.phase === "draw-start" && (
          <section className="w-full max-w-2xl flex flex-col items-center gap-6 stage-card bg-white p-8 sm:p-12 border-4 border-blue-primary/20">
            <span className="font-body uppercase tracking-[0.25em] text-blue-primary text-xs">
              Sorteio inicial
            </span>
            <p className="font-display text-blue-deepest text-2xl text-center">
              Quem começa a partida?
            </p>
            <button
              onClick={() => setDrawing(true)}
              className="font-display bg-blue-primary text-white text-xl px-10 py-4 rounded-full hover:scale-105 transition-transform shadow-card"
            >
              Girar roleta
            </button>
          </section>
        )}

        {drawing && (
          <RouletteOverlay>
            <RouletteWheel
              wrapperClassName={BIG_WHEEL}
              items={state.teams.map((t) => ({
                id: t.id,
                label: `${t.naipe} ${t.name}`,
                weight: 1,
                color: t.color,
              }))}
              onFinish={(opt) => {
                dispatch({ type: "DRAW_STARTING_TEAM", teamId: opt.id });
                setDrawing(false);
              }}
            />
          </RouletteOverlay>
        )}

        {state.phase === "spin-category" && currentTeam && (
          <section
            className="w-full max-w-2xl flex flex-col items-center gap-6 stage-card bg-white p-8 sm:p-12 border-4"
            style={{ borderColor: `${currentTeam.color}40` }}
          >
            <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: currentTeam.color }}>
              Vez de {currentTeam.naipe} {currentTeam.name}
            </span>
            <p className="font-display text-blue-deepest text-2xl text-center">
              Qual será a categoria?
            </p>
            <button
              onClick={() => setSpinningCategory(true)}
              className="font-display bg-blue-primary text-white text-xl px-10 py-4 rounded-full hover:scale-105 transition-transform shadow-card"
            >
              Girar roleta de tema
            </button>
          </section>
        )}

        {spinningCategory && (
          <RouletteOverlay>
            <RouletteWheel
              wrapperClassName={BIG_WHEEL}
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
          </RouletteOverlay>
        )}

        {state.phase === "pick-question" && currentTeam && (
          <section className="w-full flex flex-col items-center gap-2">
            <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: currentTeam.color }}>
              {currentTeam.naipe} {currentTeam.name}
            </span>
            <p className="font-display text-blue-deepest text-2xl md:text-3xl text-center">
              Escolha o valor em{" "}
              <span className="text-blue-primary">
                {CATEGORIES.find((c) => c.slug === state.currentCategory)?.label}
              </span>
            </p>
          </section>
        )}

        {state.phase === "card-phase" && (
          <CardPhasePanel
            state={state}
            dispatch={dispatch}
            onProceed={() => router.push("/question")}
          />
        )}

        {state.phase === "answering" && (
          <section className="w-full max-w-2xl flex flex-col items-center gap-6 stage-card bg-white p-10">
            <p className="font-body text-ink text-xl text-center">A pergunta está em andamento.</p>
            <button
              onClick={() => router.push("/question")}
              className="font-display bg-blue-primary text-white text-xl px-8 py-3 rounded-full hover:scale-105 transition-transform"
            >
              Ir para a pergunta
            </button>
          </section>
        )}

        {(state.phase === "spin-category" || state.phase === "pick-question") && (
          <BoardGrid
            board={state.board}
            activeCategory={state.phase === "pick-question" ? state.currentCategory : null}
            clickable={state.phase === "pick-question"}
            spotlight={state.phase === "pick-question"}
            onPick={(cell) => dispatch({ type: "PICK_QUESTION", questionId: cell.id })}
          />
        )}

        {state.phase === "finished" && (
          <section className="w-full max-w-2xl flex flex-col items-center gap-6 stage-card bg-white p-10">
            <h2 className="font-display text-blue-deepest text-4xl text-center">Fim de jogo!</h2>
            <div className="flex flex-col gap-3 w-full">
              {[...state.teams]
                .sort((a, b) => b.score - a.score)
                .map((t, idx) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center rounded-xl px-5 py-3"
                    style={{ backgroundColor: `${t.color}1a` }}
                  >
                    <span className="font-display text-lg" style={{ color: t.color }}>
                      {idx + 1}º — {t.naipe} {t.name}
                    </span>
                    <span className="font-display text-xl text-ink">{t.score} pts</span>
                  </div>
                ))}
            </div>
          </section>
        )}

        <button
          onClick={handleReset}
          className="font-body text-xs text-ink/40 hover:text-ink/70 underline underline-offset-2 mt-4"
        >
          resetar jogo
        </button>
      </main>
    </div>
  );
}
