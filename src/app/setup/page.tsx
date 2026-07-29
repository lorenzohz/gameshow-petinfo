"use client";
import { useRouter } from "next/navigation";
import { useGame } from "../../context/GameContext";
import "../globals.css";

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
    <div className="flex flex-col items-center justify-center h-full w-full gap-12 py-10">
      <h1 className="text-golden text-6xl text-center">Show do Quem Sabe Faz Ao Vivo</h1>
      <p className="text-beige text-xl">Configure os nomes das 4 equipes antes de começar</p>

      <div className="grid grid-cols-2 gap-8">
        {state.teams.map((team) => (
          <div
            key={team.id}
            className="flex flex-col items-center gap-3 bg-darkbrown/60 rounded-xl p-6 border-4"
            style={{ borderColor: team.color }}
          >
            <span className="text-6xl" style={{ color: team.color }}>
              {team.naipe}
            </span>
            <input
              value={team.name}
              onChange={(e) =>
                dispatch({ type: "RENAME_TEAM", teamId: team.id, name: e.target.value })
              }
              className="text-beige text-2xl text-center bg-transparent border-b-2 border-beige/40 focus:border-golden outline-none px-2 py-1 w-64"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        <button
          onClick={handleStart}
          className="bg-golden text-darkbrown font-bold text-2xl px-10 py-4 rounded-xl hover:scale-105 transition-transform"
        >
          Sortear equipe inicial e começar
        </button>
        <button
          onClick={handleReset}
          className="text-beige/70 border border-beige/40 px-6 py-4 rounded-xl hover:bg-beige/10"
        >
          Resetar jogo
        </button>
      </div>
    </div>
  );
}
