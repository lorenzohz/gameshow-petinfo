"use client";
import { CATEGORIES, POINTS_VALUES } from "../lib/gameConfig";
import { BoardCell } from "../lib/types";

export default function BoardGrid({
  board,
  activeCategory,
  clickable,
  onPick,
}: {
  board: BoardCell[];
  activeCategory: string | null;
  clickable: boolean;
  onPick?: (cell: BoardCell) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-3 w-full">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.slug;
        return (
          <div
            key={cat.slug}
            className={`flex flex-col items-center gap-3 p-3 rounded-lg transition-colors ${
              activeCategory
                ? isActive
                  ? "bg-golden/20"
                  : "opacity-40"
                : ""
            }`}
          >
            <h4 className="text-beige text-xl text-center">{cat.label}</h4>
            {POINTS_VALUES.map((pts) => {
              const cell = board.find(
                (c) => c.category === cat.slug && c.points === pts
              );
              if (!cell) return null;
              const disabled =
                cell.answered || !clickable || (activeCategory ? !isActive : false);
              return (
                <button
                  key={cell.id}
                  disabled={disabled}
                  onClick={() => onPick && onPick(cell)}
                  className={`w-24 h-14 clip-hexagon flex items-center justify-center font-bold text-lg transition-transform ${
                    cell.answered
                      ? "bg-darkbrown text-beige/20 cursor-not-allowed"
                      : disabled
                      ? "bg-gradient-to-b from-white to-beige text-darkbrown/50 cursor-default"
                      : "bg-gradient-to-b from-white to-beige text-darkbrown hover:scale-105 cursor-pointer"
                  }`}
                >
                  {cell.answered ? "✓" : pts}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
