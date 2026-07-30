"use client";
import { ReactNode } from "react";

export default function RouletteOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 bg-blue-deepest/95 backdrop-blur-sm flex items-center justify-center px-4">
      {children}
    </div>
  );
}
