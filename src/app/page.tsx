"use client";
import { useRouter } from "next/navigation";
import { useGame } from "../context/GameContext";

export default function SetupPage() {
  const { state, dispatch, hydrated } = useGame();
  const router = useRouter();

  if (!hydrated) return null;

  const handleStart = () => {
    dispatch({ type: "START_GAME" });
    router.push("/board");
  };

  const handleReset = () => {
    if (confirm("Isso vai zerar todo o placar e as cartas. Continuar?")) {
      dispatch({ type: "RESET_GAME" });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-12 px-6 py-16 stage-gradient">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-white/70 font-body uppercase tracking-[0.3em] text-sm">
          PET Informática 2026
        </span>
        <h1 className="font-display text-white text-5xl md:text-6xl leading-tight max-w-3xl">
          Show do Quem Sabe Faz Ao Vivo
        </h1>
        <p className="text-white/80 font-body text-lg">
          Configure o nome das 4 equipes antes de começar
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        {state.teams.map((team) => (
          <div
            key={team.id}
            className="stage-card flex flex-col items-center gap-3 bg-white p-6"
            style={{ boxShadow: `0 12px 30px -10px ${team.color}66` }}
          >
            <span
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold text-white"
              style={{ backgroundColor: team.color }}
            >
              {team.naipe}
            </span>
            <input
              value={team.name}
              onChange={(e) =>
                dispatch({ type: "RENAME_TEAM", teamId: team.id, name: e.target.value })
              }
              className="font-display text-ink text-xl text-center bg-offwhite rounded-lg border-2 border-transparent focus:border-blue-primary outline-none px-3 py-2 w-full"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleStart}
          className="font-display text-xl bg-white text-blue-deepest px-10 py-4 rounded-full shadow-stage hover:scale-105 transition-transform"
        >
          Sortear equipe inicial e começar
        </button>
        <button
          onClick={handleReset}
          className="font-body text-white/80 border border-white/40 px-6 py-4 rounded-full hover:bg-white/10 transition-colors"
        >
          Resetar jogo
        </button>
      </div>
    </div>
  );
}
