"use client";
import { Team } from "../lib/types";

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
      <span
        className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold text-white"
        style={{ backgroundColor: team.color }}
      >
        {team.naipe}
      </span>
      <p className="font-body text-ink text-sm font-semibold text-center truncate max-w-[160px]">
        {team.name}
      </p>
      <p className="font-display text-2xl text-center" style={{ color: team.color }}>
        {team.score} pts
      </p>
    </div>
  );
}
