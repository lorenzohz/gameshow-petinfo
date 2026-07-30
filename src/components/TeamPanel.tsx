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
      className={`flex flex-col items-center gap-2 rounded-2xl p-4 min-w-[180px] bg-white transition-all ${
        active ? "scale-105 shadow-stage ring-4" : "shadow-card opacity-90"
      }`}
      style={active ? ({ "--tw-ring-color": team.color } as React.CSSProperties) : undefined}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold text-white"
          style={{ backgroundColor: team.color }}
        >
          {team.naipe}
        </span>
        {team.immuneNextDebuff && (
          <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full font-body">
            imune
          </span>
        )}
      </div>
      <p className="font-body text-ink text-sm font-semibold text-center truncate max-w-[160px]">
        {team.name}
      </p>
      <p className="font-display text-2xl text-center" style={{ color: team.color }}>
        {team.score} pts
      </p>
      <div className="flex justify-center gap-2 mt-1">
        {team.cards.map((c) => (
          <span
            key={c.type}
            title={CARD_LABELS[c.type]}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-body font-bold border-2 ${
              c.used
                ? "bg-offwhite border-ink/10 text-ink/20 line-through"
                : "text-white"
            }`}
            style={!c.used ? { backgroundColor: team.color, borderColor: team.color } : undefined}
          >
            {CARD_SHORT[c.type]}
          </span>
        ))}
      </div>
    </div>
  );
}
