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
      {title && <p className="text-golden text-3xl">{title}</p>}
      <div
        className={`px-10 py-8 rounded-xl bg-darkbrown border-4 ${
          done ? "border-golden" : "border-beige/40"
        } text-beige text-4xl font-bold text-center min-w-[420px] transition-colors duration-300`}
      >
        {items[displayIndex]?.label}
      </div>
      {done && result && (
        <p className="text-golden text-2xl animate-pulse">Resultado sorteado!</p>
      )}
    </div>
  );
}
