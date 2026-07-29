"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "../../context/GameContext";
import { getQuestionById } from "../../lib/gameReducer";
import "../globals.css";

export default function QuestionPage() {
  const { state, dispatch, hydrated } = useGame();
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [appliedTime, setAppliedTime] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [soloConfirmed, setSoloConfirmed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef(false);

  const question = state.currentQuestionId ? getQuestionById(state.currentQuestionId) : null;

  const timeMultiplier = state.activeEffects.reduce((m, e) => m * (e.timeMultiplier ?? 1), 1);
  const scoreMultiplier = state.activeEffects.reduce((m, e) => m * (e.scoreMultiplier ?? 1), 1);
  const soloKingActive = state.activeEffects.some((e) => e.soloKing);
  const jokerBuffActive = state.activeEffects.some((e) => e.jokerBuff);

  useEffect(() => {
    if (!question || initializedRef.current) return;
    const t = Math.max(1, Math.round(question.time * timeMultiplier));
    setAppliedTime(t);
    setTimeLeft(t);
    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  if (!hydrated) return null;

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <p className="text-beige text-2xl">Nenhuma pergunta selecionada.</p>
        <button
          onClick={() => router.push("/board")}
          className="bg-golden text-darkbrown font-bold px-6 py-3 rounded-lg"
        >
          Voltar ao tabuleiro
        </button>
      </div>
    );
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const resolve = (correct: boolean) => {
    dispatch({
      type: "ANSWER_RESULT",
      correct,
      secondsLeft: timeLeft ?? 0,
      appliedTime: appliedTime ?? question.time,
      soloConfirmed,
    });
    router.push("/board");
  };

  return (
    <div className="flex flex-col gap-8 py-6">
      <div
        className="absolute top-5 left-5 w-[100px] h-[50px] bg-[#800000] hexagon-button flex justify-center items-center cursor-pointer transition-transform duration-300 ease-in-out hover:scale-125 hover:shadow-xl active:scale-110"
        onClick={() => router.push("/board")}
      ></div>

      <h1 className="text-golden p-6 text-6xl text-center">
        {question.points} PTS — {question.category.toUpperCase()}
      </h1>

      <div className="flex flex-col justify-between min-h-[500px] bg-beige mx-40 rounded-xl">
        <p className="text-brown font-semibold text-4xl p-10 text-center">
          {question.filled ? question.question : "⚠️ Pergunta ainda não cadastrada — edite data.json"}
        </p>

        {question.link && (
          <p className="text-center text-blue-800 underline text-2xl pb-4">
            <a href={question.link} target="_blank" rel="noreferrer">
              {question.link}
            </a>
          </p>
        )}

        {question.image && (
          <div className="flex justify-center pb-6">
            <Image src={question.image} alt="Imagem da pergunta" width={300} height={300} />
          </div>
        )}

        {question.song && (
          <div className="text-brown text-3xl p-10 text-center">
            <button
              onClick={togglePlay}
              className="px-6 py-3 bg-golden text-white rounded-lg hover:bg-yellow-600"
            >
              {isPlaying ? "Pausar Música" : "Tocar Música"}
            </button>
            <audio ref={audioRef} src={question.song} />
          </div>
        )}

        <p className="text-brown text-3xl p-8 text-center">
          TEMPO: {timeLeft ?? question.time} SEG
          {timeMultiplier !== 1 && (
            <span className="text-lg block text-brown/70">
              (base {question.time}s × {timeMultiplier.toFixed(2)})
            </span>
          )}
        </p>

        {showAnswer && question.filled && (
          <p className="text-emerald-700 text-3xl text-center pb-8 font-bold">
            Resposta: {question.answer}
          </p>
        )}
      </div>

      {state.activeEffects.length > 0 && (
        <div className="mx-40 bg-darkbrown/60 rounded-lg p-4 flex flex-col gap-1">
          {state.activeEffects.map((e) => (
            <p key={e.id} className="text-beige text-sm">
              • {e.label}
            </p>
          ))}
          {scoreMultiplier !== 1 && (
            <p className="text-golden text-sm">Multiplicador de pontuação total: x{scoreMultiplier.toFixed(2)}</p>
          )}
          {jokerBuffActive && (
            <p className="text-golden text-sm">Coringa ativo: acerto vale x3, erro custa os pontos da pergunta.</p>
          )}
        </div>
      )}

      {soloKingActive && (
        <div className="mx-40 flex items-center gap-3 justify-center">
          <input
            id="solo"
            type="checkbox"
            checked={soloConfirmed}
            onChange={(e) => setSoloConfirmed(e.target.checked)}
            className="w-5 h-5"
          />
          <label htmlFor="solo" className="text-beige text-lg">
            O &quot;Rei&quot; respondeu sozinho, sem ajuda (aplica x3 se acertar)
          </label>
        </div>
      )}

      <div className="flex justify-center gap-6">
        <button
          onClick={() => setShowAnswer((s) => !s)}
          className="px-6 py-3 rounded-lg border border-golden text-golden hover:bg-golden hover:text-darkbrown"
        >
          {showAnswer ? "Esconder resposta" : "Mostrar resposta ao host"}
        </button>
        <button
          onClick={() => resolve(true)}
          className="px-8 py-3 rounded-lg bg-emerald-700 text-beige font-bold hover:scale-105 transition-transform"
        >
          Equipe acertou
        </button>
        <button
          onClick={() => resolve(false)}
          className="px-8 py-3 rounded-lg bg-red-800 text-beige font-bold hover:scale-105 transition-transform"
        >
          Equipe errou
        </button>
      </div>

      {timeLeft === 0 && (
        <p className="text-center text-red-400 text-2xl">
          Tempo esgotado! Use os botões acima para confirmar o resultado.
        </p>
      )}
    </div>
  );
}
