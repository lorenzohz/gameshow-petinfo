"use client";
import { useState } from "react";
import { GameState, CardType } from "../lib/types";
import { Action } from "../lib/gameReducer";
import { CARD_LABELS, VALETE_BUFF_ROULETTE, VALETE_DEBUFF_ROULETTE } from "../lib/gameConfig";
import RouletteWheel, { SpinnerItem } from "./RouletteWheel";
import RouletteOverlay from "./RouletteOverlay";

interface Props {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  onProceed: () => void;
}

export default function CardPhasePanel({ state, dispatch, onProceed }: Props) {
  const answeringTeamId = state.order[state.currentTeamIndex];
  const answeringTeam = state.teams.find((t) => t.id === answeringTeamId)!;
  const otherTeams = state.teams.filter((t) => t.id !== answeringTeamId);

  const [played, setPlayed] = useState<Set<string>>(new Set());
  const [valeteRoulette, setValeteRoulette] = useState<{
    teamId: string;
    mode: "buff" | "debuff";
  } | null>(null);
  const [amplifyPicker, setAmplifyPicker] = useState<string | null>(null); // teamId choosing which effect to amplify

  const debuffTargets = state.activeEffects.filter((e) => e.mode === "debuff");

  function markPlayed(teamId: string) {
    setPlayed((prev) => new Set(prev).add(teamId));
  }

  function playSimple(teamId: string, mode: "buff" | "debuff", cardType: CardType) {
    dispatch({
      type: "PLAY_CARD",
      teamId,
      mode,
      cardType,
      targetTeamId: mode === "debuff" ? answeringTeamId : undefined,
    });
    markPlayed(teamId);
  }

  function playValete(teamId: string, mode: "buff" | "debuff", option: SpinnerItem) {
    const table = mode === "buff" ? VALETE_BUFF_ROULETTE : VALETE_DEBUFF_ROULETTE;
    const full = table.find((o) => o.id === option.id)!;
    dispatch({
      type: "PLAY_CARD",
      teamId,
      mode,
      cardType: "valete",
      targetTeamId: mode === "debuff" ? answeringTeamId : undefined,
      resolvedEffect: { label: option.label, ...full.effect },
    });
    markPlayed(teamId);
    setValeteRoulette(null);
  }

  function playDamaDebuff(teamId: string, effectId: string) {
    dispatch({
      type: "PLAY_CARD",
      teamId,
      mode: "debuff",
      cardType: "dama",
      targetTeamId: answeringTeamId,
      amplifyEffectId: effectId,
    });
    markPlayed(teamId);
    setAmplifyPicker(null);
  }

  function renderCardButtons(teamId: string, mode: "buff" | "debuff") {
    const team = state.teams.find((t) => t.id === teamId)!;
    const disabledTeam = played.has(teamId) || (mode === "debuff" && answeringTeam.immuneNextDebuff);
    return (
      <div className="flex justify-center gap-2 flex-wrap">
        {team.cards
          .filter((c) => !c.used)
          .map((c) => (
            <button
              key={c.type}
              disabled={disabledTeam}
              onClick={() => {
                if (c.type === "valete") {
                  setValeteRoulette({ teamId, mode });
                } else if (c.type === "dama" && mode === "debuff") {
                  setAmplifyPicker(teamId);
                } else {
                  playSimple(teamId, mode, c.type);
                }
              }}
              className={`px-3 py-2 rounded-full text-sm font-body font-semibold border-2 ${
                disabledTeam
                  ? "border-ink/10 text-ink/30 cursor-not-allowed"
                  : "border-blue-primary text-blue-primary hover:bg-blue-primary hover:text-white"
              }`}
            >
              {CARD_LABELS[c.type]}
            </button>
          ))}
        {team.cards.every((c) => c.used) && (
          <span className="text-ink/40 text-sm font-body">sem cartas</span>
        )}
        {disabledTeam && played.has(teamId) && (
          <span className="text-emerald-600 text-sm font-body">jogada feita</span>
        )}
        {mode === "debuff" && answeringTeam.immuneNextDebuff && (
          <span className="text-emerald-600 text-sm font-body">alvo imune</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 stage-card bg-white p-6 sm:p-8 w-full border-4 border-blue-primary/20">
      <div className="flex flex-col items-center gap-1">
        <span className="font-body uppercase tracking-[0.25em] text-blue-primary text-xs">
          Fase de cartas
        </span>
        <h3 className="font-display text-blue-deepest text-2xl text-center">
          {answeringTeam.name} vai responder
        </h3>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="font-body text-ink text-lg text-center">
          {answeringTeam.naipe} {answeringTeam.name} (pode jogar um BUFF em si mesma):
        </p>
        {renderCardButtons(answeringTeamId, "buff")}
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <p className="font-body text-ink text-lg text-center">
          Adversárias (podem jogar um DEBUFF contra {answeringTeam.name}):
        </p>
        {otherTeams.map((t) => (
          <div key={t.id} className="flex flex-col items-center gap-1">
            <p className="font-body text-ink/70 text-sm text-center">
              {t.naipe} {t.name}
            </p>
            {renderCardButtons(t.id, "debuff")}
          </div>
        ))}
      </div>

      {state.activeEffects.length > 0 && (
        <div className="bg-offwhite rounded-xl p-3 flex flex-col items-center gap-1 w-full">
          {state.activeEffects.map((e) => (
            <p key={e.id} className="font-body text-ink/70 text-sm text-center">
              • {e.label}
            </p>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          dispatch({ type: "LOCK_CARDS" });
          onProceed();
        }}
        className="self-center font-display bg-blue-primary text-white px-8 py-3 rounded-full hover:scale-105 transition-transform"
      >
        Avançar para a resposta
      </button>

      {valeteRoulette && (
        <RouletteOverlay>
          <RouletteWheel
            wrapperClassName="w-[70vmin] h-[70vmin] max-w-[560px] max-h-[560px]"
            title={`Roleta do Valete (${valeteRoulette.mode === "buff" ? "buff" : "debuff"})`}
            items={(valeteRoulette.mode === "buff"
              ? VALETE_BUFF_ROULETTE
              : VALETE_DEBUFF_ROULETTE
            ).map((o) => ({ id: o.id, label: o.label, weight: o.weight }))}
            onFinish={(opt) => playValete(valeteRoulette.teamId, valeteRoulette.mode, opt)}
          />
        </RouletteOverlay>
      )}

      {amplifyPicker && (
        <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-8 rounded-2xl shadow-stage flex flex-col gap-4 max-w-lg w-full">
            <h4 className="font-display text-blue-deepest text-xl text-center">
              Escolha o debuff que a Dama vai amplificar
            </h4>
            {debuffTargets.length === 0 && (
              <p className="font-body text-ink/60 text-center">
                Ainda não há nenhum debuff ativo nesta rodada para amplificar.
              </p>
            )}
            {debuffTargets.map((e) => (
              <button
                key={e.id}
                onClick={() => playDamaDebuff(amplifyPicker, e.id)}
                className="font-body text-ink text-left border border-blue-primary rounded-xl px-4 py-2 hover:bg-blue-primary hover:text-white transition-colors"
              >
                {e.label}
              </button>
            ))}
            <button
              onClick={() => setAmplifyPicker(null)}
              className="font-body text-ink/50 text-sm underline"
            >
              cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
