"use client";
import { Team } from "../lib/types";
import { CARD_LABELS } from "../lib/gameConfig";

const CARD_SHORT: Record<string, string> = {
  valete: "J",
  dama: "Q",
  rei: "K",
  coringa: "🃏",
};

export default function TeamPanel({
  team,
  active,
}: {
  team: Team;
  active: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-xl p-4 min-w-[220px] border-4 transition-all ${
        active ? "scale-105 shadow-lg" : "opacity-90"
      }`}
      style={{
        borderColor: active ? team.color : "transparent",
        backgroundColor: "#2a140a",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl" style={{ color: team.color }}>
          {team.naipe}
        </span>
        {team.immuneNextDebuff && (
          <span className="text-xs text-beige bg-emerald-800 px-2 py-1 rounded">
            imune
          </span>
        )}
      </div>
      <p className="text-beige text-lg font-semibold truncate">{team.name}</p>
      <p className="text-golden text-3xl font-bold">{team.score} pts</p>
      <div className="flex gap-2 mt-1">
        {team.cards.map((c) => (
          <span
            key={c.type}
            title={CARD_LABELS[c.type]}
            className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-bold border-2 ${
              c.used
                ? "bg-transparent border-beige/20 text-beige/20 line-through"
                : "bg-beige text-darkbrown border-golden"
            }`}
          >
            {CARD_SHORT[c.type]}
          </span>
        ))}
      </div>
    </div>
  );
}
