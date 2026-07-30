"use client";
import { useEffect, useRef, useState } from "react";

export interface SpinnerItem {
  id: string;
  label: string;
  weight: number;
}

interface RouletteSpinnerProps {
  items: SpinnerItem[];
  spinMs?: number;
  onFinish: (item: SpinnerItem) => void;
  title?: string;
}

function weightedPick<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, o) => s + o.weight, 0);
  let r = Math.random() * total;
  for (const o of items) {
    if (r < o.weight) return o;
    r -= o.weight;
  }
  return items[items.length - 1];
}

export default function RouletteSpinner({
  items,
  spinMs = 1800,
  onFinish,
  title,
}: RouletteSpinnerProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<SpinnerItem | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    const chosen = weightedPick(items);
    let speed = 60;
    let elapsed = 0;

    function tick() {
      setDisplayIndex((i) => (i + 1) % items.length);
      elapsed += speed;
      speed = Math.min(speed * 1.08, 260);
      if (elapsed >= spinMs) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const finalIndex = items.findIndex((i) => i.id === chosen.id);
        setDisplayIndex(finalIndex === -1 ? 0 : finalIndex);
        setResult(chosen);
        setDone(true);
        if (!finished.current) {
          finished.current = true;
          setTimeout(() => onFinish(chosen), 400);
        }
        return;
      }
      intervalRef.current = setTimeout(tick, speed);
    }
    intervalRef.current = setTimeout(tick, speed);
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {title && <p className="font-display text-blue-deepest text-2xl text-center">{title}</p>}
      <div
        className={`px-8 py-7 rounded-2xl bg-blue-deepest border-4 ${
          done ? "border-blue-light shadow-stage" : "border-blue-dark"
        } text-white text-2xl md:text-3xl font-display text-center min-w-[280px] md:min-w-[420px] transition-colors duration-300`}
      >
        {items[displayIndex]?.label}
      </div>
      {done && result && (
        <p className="font-display text-blue-primary text-xl animate-pulse">Resultado sorteado!</p>
      )}
    </div>
  );
}
