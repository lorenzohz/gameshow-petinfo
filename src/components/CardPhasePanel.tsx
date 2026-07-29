"use client";
import { useState } from "react";
import { GameState, CardType } from "../lib/types";
import { Action } from "../lib/gameReducer";
import { CARD_LABELS, VALETE_BUFF_ROULETTE, VALETE_DEBUFF_ROULETTE } from "../lib/gameConfig";
import RouletteSpinner, { SpinnerItem } from "./RouletteSpinner";

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
      <div className="flex gap-2 flex-wrap">
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
              className={`px-3 py-2 rounded-lg text-sm font-semibold border-2 ${
                disabledTeam
                  ? "border-beige/20 text-beige/30 cursor-not-allowed"
                  : "border-golden text-golden hover:bg-golden hover:text-darkbrown"
              }`}
            >
              {CARD_LABELS[c.type]}
            </button>
          ))}
        {team.cards.every((c) => c.used) && (
          <span className="text-beige/40 text-sm">sem cartas</span>
        )}
        {disabledTeam && played.has(teamId) && (
          <span className="text-emerald-400 text-sm">jogada feita</span>
        )}
        {mode === "debuff" && answeringTeam.immuneNextDebuff && (
          <span className="text-emerald-400 text-sm">alvo imune</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 bg-darkbrown/60 rounded-xl p-6">
      <h3 className="text-golden text-2xl text-center">
        Fase de cartas — {answeringTeam.name} vai responder
      </h3>

      <div className="flex flex-col gap-2">
        <p className="text-beige text-lg">
          {answeringTeam.naipe} {answeringTeam.name} (pode jogar um BUFF em si mesma):
        </p>
        {renderCardButtons(answeringTeamId, "buff")}
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-beige text-lg">Adversárias (podem jogar um DEBUFF contra {answeringTeam.name}):</p>
        {otherTeams.map((t) => (
          <div key={t.id} className="flex flex-col gap-1">
            <p className="text-beige/80 text-sm">
              {t.naipe} {t.name}
            </p>
            {renderCardButtons(t.id, "debuff")}
          </div>
        ))}
      </div>

      {state.activeEffects.length > 0 && (
        <div className="bg-black/20 rounded-lg p-3 flex flex-col gap-1">
          {state.activeEffects.map((e) => (
            <p key={e.id} className="text-beige/80 text-sm">
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
        className="self-center bg-golden text-darkbrown font-bold px-8 py-3 rounded-lg hover:scale-105 transition-transform"
      >
        Avançar para a resposta
      </button>

      {valeteRoulette && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1c0d05] p-10 rounded-2xl">
            <RouletteSpinner
              title={`Roleta do Valete (${valeteRoulette.mode === "buff" ? "buff" : "debuff"})`}
              items={(valeteRoulette.mode === "buff"
                ? VALETE_BUFF_ROULETTE
                : VALETE_DEBUFF_ROULETTE
              ).map((o) => ({ id: o.id, label: o.label, weight: o.weight }))}
              onFinish={(opt) => playValete(valeteRoulette.teamId, valeteRoulette.mode, opt)}
            />
          </div>
        </div>
      )}

      {amplifyPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1c0d05] p-8 rounded-2xl flex flex-col gap-4 max-w-lg">
            <h4 className="text-golden text-xl text-center">
              Escolha o debuff que a Dama vai amplificar
            </h4>
            {debuffTargets.length === 0 && (
              <p className="text-beige/70 text-center">
                Ainda não há nenhum debuff ativo nesta rodada para amplificar.
              </p>
            )}
            {debuffTargets.map((e) => (
              <button
                key={e.id}
                onClick={() => playDamaDebuff(amplifyPicker, e.id)}
                className="text-beige text-left border border-golden rounded-lg px-4 py-2 hover:bg-golden hover:text-darkbrown"
              >
                {e.label}
              </button>
            ))}
            <button
              onClick={() => setAmplifyPicker(null)}
              className="text-beige/60 text-sm underline"
            >
              cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
