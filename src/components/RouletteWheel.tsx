"use client";
import { useRef, useState } from "react";

export interface SpinnerItem {
  id: string;
  label: string;
  weight: number;
  color?: string;
}

const PALETTE = [
  "#1961a5",
  "#e0473f",
  "#3788d1",
  "#f2994a",
  "#10316b",
  "#1f9d55",
  "#214179",
  "#7c3aed",
];

function weightedPick<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, o) => s + o.weight, 0);
  let r = Math.random() * total;
  for (const o of items) {
    if (r < o.weight) return o;
    r -= o.weight;
  }
  return items[items.length - 1];
}

function polar(cx: number, cy: number, r: number, thetaDeg: number) {
  const rad = (thetaDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

type WheelPhase = "idle" | "spinning" | "done";

interface RouletteWheelProps {
  items: SpinnerItem[];
  onFinish: (item: SpinnerItem) => void;
  title?: string;
  size?: number; // coordenadas internas do SVG (não é o tamanho renderizado em tela)
  wrapperClassName?: string; // classes Tailwind que controlam o tamanho real na tela
  spinMs?: number;
  resultDisplayMs?: number; // quanto tempo o resultado fica exibido antes de avançar
}

export default function RouletteWheel({
  items,
  onFinish,
  title,
  size = 400,
  wrapperClassName = "w-64 h-64 sm:w-80 sm:h-80",
  spinMs = 4200,
  resultDisplayMs = 2800,
}: RouletteWheelProps) {
  const [phase, setPhase] = useState<WheelPhase>("idle");
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<SpinnerItem | null>(null);
  const finished = useRef(false);
  const r = size / 2;
  const total = items.reduce((s, o) => s + o.weight, 0);

  let cursor = 0;
  const sectors = items.map((item, i) => {
    const start = cursor;
    const angle = (item.weight / total) * 360;
    cursor += angle;
    const end = cursor;
    return {
      item,
      start,
      end,
      mid: (start + end) / 2,
      color: item.color || PALETTE[i % PALETTE.length],
    };
  });

  function startSpin() {
    if (phase !== "idle") return;
    const chosen = weightedPick(items);
    const sector = sectors.find((s) => s.item.id === chosen.id)!;
    const spins = 5;
    const target = spins * 360 + (360 - sector.mid);

    setPhase("spinning");
    requestAnimationFrame(() => setRotation(target));

    setTimeout(() => {
      setWinner(chosen);
      setPhase("done");
      setTimeout(() => {
        if (!finished.current) {
          finished.current = true;
          onFinish(chosen);
        }
      }, resultDisplayMs);
    }, spinMs + 100);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {title && <p className="font-display text-blue-deepest text-xl md:text-3xl text-center">{title}</p>}
      <div className={`relative ${wrapperClassName}`}>
        {/* Ponteiro fixo */}
        <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: "-4%" }}>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "16px solid transparent",
              borderRight: "16px solid transparent",
              borderTop: "26px solid #0b0d12",
              filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.4))",
            }}
          />
        </div>

        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${size} ${size}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: phase === "spinning" ? `transform ${spinMs}ms cubic-bezier(0.13, 0.66, 0.13, 1)` : "none",
          }}
        >
          <circle cx={r} cy={r} r={r - 4} fill="white" stroke="#0b0d12" strokeWidth={4} />
          {sectors.map((s) => {
            const p1 = polar(r, r, r - 8, s.start);
            const p2 = polar(r, r, r - 8, s.end);
            const largeArc = s.end - s.start > 180 ? 1 : 0;
            const labelPos = polar(r, r, r * 0.62, s.mid);
            let textRotate = s.mid;
            if (textRotate > 90 && textRotate < 270) textRotate += 180;
            return (
              <g key={s.item.id}>
                <path
                  d={`M ${r},${r} L ${p1.x},${p1.y} A ${r - 8},${r - 8} 0 ${largeArc} 1 ${p2.x},${p2.y} Z`}
                  fill={s.color}
                  stroke="white"
                  strokeWidth={2}
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fill="white"
                  fontSize={Math.max(10, size * 0.05)}
                  fontFamily="var(--font-body)"
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textRotate}, ${labelPos.x}, ${labelPos.y})`}
                >
                  {s.item.label.length > 16 ? s.item.label.slice(0, 15) + "…" : s.item.label}
                </text>
              </g>
            );
          })}
          <circle cx={r} cy={r} r={size * 0.06} fill="#0b0d12" />
        </svg>

        {phase === "idle" && (
          <button
            onClick={startSpin}
            className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-blue-primary text-white font-display text-sm shadow-stage hover:scale-110 transition-transform flex items-center justify-center"
          >
            GIRAR
          </button>
        )}
      </div>
      {phase === "done" && winner && (
        <p className="font-display text-blue-primary text-2xl animate-pulse">{winner.label}!</p>
      )}
    </div>
  );
}
