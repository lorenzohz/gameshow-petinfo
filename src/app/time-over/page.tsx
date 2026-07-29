"use client"; // Adicione isso no topo do arquivo para usar hooks do Next.js

import { useRouter } from "next/navigation"; // Importe o useRouter

export default function TimeOver() {
  const router = useRouter(); // Inicialize o useRouter

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      {/* Botão de voltar */}
      <div
        className="absolute top-5 left-5 w-[100px] h-[50px] bg-[#800000] hexagon-button flex justify-center items-center cursor-pointer transition-transform duration-300 ease-in-out hover:scale-125 hover:shadow-xl active:scale-110"
        onClick={() => router.push("/board")}
      ></div>

      <div className="flex flex-col w-full justify-center items-center h-[600px] mx-60 bg-beige rounded-xl">
        <h1 className="w-full text-darkbrown text-7xl text-center">
          TEMPO ESGOTADO!!!
        </h1>
      </div>
    </div>
  );
}