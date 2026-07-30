"use client";
import { CATEGORIES, POINTS_VALUES } from "../lib/gameConfig";
import { BoardCell } from "../lib/types";

export default function BoardGrid({
  board,
  activeCategory,
  clickable,
  spotlight,
  onPick,
}: {
  board: BoardCell[];
  activeCategory: string | null;
  clickable: boolean;
  spotlight?: boolean;
  onPick?: (cell: BoardCell) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.slug;
        const emphasize = spotlight && isActive;
        return (
          <div
            key={cat.slug}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 ${
              activeCategory
                ? isActive
                  ? emphasize
                    ? "bg-white stage-card border-4 border-blue-primary scale-110 z-10"
                    : "bg-blue-primary/10 stage-card"
                  : `opacity-30 ${spotlight ? "scale-90 blur-[1px]" : ""}`
                : ""
            }`}
          >
            <h4
              className={`font-display text-blue-deepest text-center ${
                emphasize ? "text-lg md:text-xl" : "text-sm md:text-base"
              }`}
            >
              {cat.label}
            </h4>
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
                  className={`w-full rounded-xl font-display transition-all ${
                    emphasize ? "h-16 text-2xl" : "h-12 text-base"
                  } ${
                    cell.answered
                      ? "bg-ink/5 text-ink/20 cursor-not-allowed"
                      : disabled
                      ? "bg-blue-primary/40 text-white/70 cursor-default"
                      : "bg-blue-primary text-white shadow-card hover:scale-105 hover:bg-blue-light cursor-pointer"
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
