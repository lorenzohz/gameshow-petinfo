"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "../../context/GameContext";
import { getQuestionById } from "../../lib/gameReducer";
import { getYoutubeEmbedUrl } from "../../lib/youtube";

export default function QuestionPage() {
  const { state, dispatch, hydrated } = useGame();
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef(false);

  const question = state.currentQuestionId ? getQuestionById(state.currentQuestionId) : null;
  const youtubeEmbedUrl = question?.link ? getYoutubeEmbedUrl(question.link) : null;

  const isSteal = state.attemptedTeamIds.length > 0;
  const answeringTeam = state.answeringTeamId
    ? state.teams.find((t) => t.id === state.answeringTeamId)
    : null;
  const displayPoints = question ? (isSteal ? Math.round(question.points / 2) : question.points) : 0;
  const hasHint = Boolean(question?.extra && question.extra.trim().length > 0);

  useEffect(() => {
    if (!question || initializedRef.current) return;
    setTimeLeft(question.time);
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6">
        <p className="font-body text-ink text-xl">Nenhuma pergunta selecionada.</p>
        <button
          onClick={() => router.push("/board")}
          className="font-display bg-blue-primary text-white px-6 py-3 rounded-full"
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
    dispatch({ type: "ANSWER_RESULT", correct });
    router.push("/board");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <main className="w-full max-w-4xl flex flex-col gap-8 px-4 sm:px-6 pt-8 pb-10">
        <div className="stage-card bg-white flex flex-col justify-between min-h-[420px] w-full border-4 border-blue-primary/20">
          <div className="flex flex-col items-center gap-1 pt-8">
            <span className="font-body uppercase tracking-[0.25em] text-blue-primary text-xs">
              {question.category.toUpperCase()}
            </span>
            <h1 className="font-display text-blue-deepest text-3xl">{displayPoints} PTS</h1>
            {isSteal && answeringTeam && (
              <span className="font-body text-sm text-red-600 mt-1">
                Tentativa de roubo — {answeringTeam.naipe} {answeringTeam.name} (metade do valor)
              </span>
            )}
          </div>

          <p className="font-display text-ink text-2xl md:text-4xl p-8 md:p-10 text-center">
            {question.filled ? question.question : "⚠️ Pergunta ainda não cadastrada — edite data.json"}
          </p>

          {showHint && hasHint && (
            <div className="mx-6 sm:mx-10 mb-6 rounded-xl bg-amber-50 border-2 border-amber-300 px-6 py-4 text-center">
              <p className="font-body text-amber-700 text-lg">💡 {question.extra}</p>
            </div>
          )}

          {question.song && (
            <div className="text-center pb-8">
              <button
                onClick={togglePlay}
                className="font-display px-6 py-3 bg-blue-primary text-white rounded-full hover:bg-blue-light transition-colors"
              >
                {isPlaying ? "Pausar Música" : "Tocar Música"}
              </button>
              <audio ref={audioRef} src={question.song} />
            </div>
          )}

          <div className="bg-blue-deepest rounded-b-2xl py-6 px-8 text-center">
            <p className="font-display text-white text-3xl">
              TEMPO: {timeLeft ?? question.time} SEG
            </p>
          </div>

          {showAnswer && question.filled && (
            <div className="flex flex-col items-center gap-4 py-6 px-4 sm:px-8">
              <p className="font-display text-emerald-600 text-2xl text-center">
                Resposta: {question.answer}
              </p>

              {question.image && (
                <div className="w-full max-w-md rounded-xl overflow-hidden shadow-card flex justify-center">
                  <Image
                    src={question.image}
                    alt="Imagem da pergunta"
                    width={300}
                    height={300}
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}

              {question.answerImage && (
                <div className="w-full max-w-lg rounded-xl overflow-hidden shadow-card">
                  <Image
                    src={question.answerImage}
                    alt="Imagem da resposta"
                    width={600}
                    height={400}
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}

              {question.link && (
                youtubeEmbedUrl ? (
                  <div className="w-full max-w-lg aspect-video rounded-xl overflow-hidden shadow-card">
                    <iframe
                      className="w-full h-full"
                      src={youtubeEmbedUrl}
                      title="Vídeo da resposta"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a
                    href={question.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-primary underline text-lg"
                  >
                    {question.link}
                  </a>
                )
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {hasHint && (
            <button
              onClick={() => setShowHint((s) => !s)}
              className="font-body px-6 py-3 rounded-full border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors"
            >
              {showHint ? "Esconder dica" : "💡 Ver dica"}
            </button>
          )}
          <button
            onClick={() => setShowAnswer((s) => !s)}
            className="font-body px-6 py-3 rounded-full border-2 border-blue-primary text-blue-primary hover:bg-blue-primary hover:text-white transition-colors"
          >
            {showAnswer ? "Esconder resposta" : "Ver resposta na tela"}
          </button>
          <button
            onClick={() => resolve(true)}
            className="font-display px-8 py-3 rounded-full bg-emerald-600 text-white hover:scale-105 transition-transform"
          >
            Equipe acertou
          </button>
          <button
            onClick={() => resolve(false)}
            className="font-display px-8 py-3 rounded-full bg-red-600 text-white hover:scale-105 transition-transform"
          >
            Equipe errou
          </button>
        </div>

        {timeLeft === 0 && (
          <p className="text-center font-body text-red-600 text-lg">
            Tempo esgotado! Use os botões acima para confirmar o resultado.
          </p>
        )}

        <button
          onClick={() => router.push("/board")}
          className="self-center font-body text-xs text-ink/40 hover:text-ink/70 underline underline-offset-2 mt-2"
        >
          ← voltar ao tabuleiro
        </button>
      </main>
    </div>
  );
}