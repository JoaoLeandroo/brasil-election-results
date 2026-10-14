"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  ResultadoBrasil,
} from "@/types/eleicao";

import {
  formatarNumero,
  formatarPercentual,
  obterCorCandidato,
} from "@/lib/eleicao";

const INTERVALO_ATUALIZACAO =
  10_000;

export default function ResultadoNacional() {
  const [
    resultado,
    setResultado,
  ] =
    useState<ResultadoBrasil | null>(
      null
    );

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    erroAtualizacao,
    setErroAtualizacao,
  ] = useState(false);

  useEffect(() => {
    let componenteAtivo = true;
    let consultaEmAndamento = false;

    async function consultarBrasil() {
      if (consultaEmAndamento) {
        return;
      }

      consultaEmAndamento = true;

      try {
        const resposta =
          await fetch(
            "/api/resultados/brasil",
            {
              cache: "no-store",
            }
          );

        if (!resposta.ok) {
          throw new Error(
            `API Brasil retornou HTTP ${resposta.status}`
          );
        }

        const dados:
          ResultadoBrasil =
            await resposta.json();

        if (!componenteAtivo) {
          return;
        }

        setResultado(dados);
        setErroAtualizacao(false);
      } catch (error) {
        console.error(
          "Erro ao consultar resultado nacional:",
          error
        );

        if (!componenteAtivo) {
          return;
        }

        setErroAtualizacao(true);
      } finally {
        consultaEmAndamento = false;

        if (componenteAtivo) {
          setCarregando(false);
        }
      }
    }

    void consultarBrasil();

    const intervalo =
      window.setInterval(
        () => {
          void consultarBrasil();
        },
        INTERVALO_ATUALIZACAO
      );

    return () => {
      componenteAtivo = false;

      window.clearInterval(
        intervalo
      );
    };
  }, []);

  // ====================================================
  // CARREGAMENTO
  // ====================================================

  if (
    carregando &&
    !resultado
  ) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-80 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-700" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Consultando resultado nacional...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ====================================================
  // ERRO INICIAL
  // ====================================================

  if (
    erroAtualizacao &&
    !resultado
  ) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-800">
          Resultado nacional temporariamente indisponível
        </p>

        <p className="mt-1 text-sm text-red-600">
          Uma nova tentativa será realizada automaticamente.
        </p>
      </section>
    );
  }

  if (!resultado) {
    return null;
  }

  const lula =
    resultado.candidatos.find(
      (candidato) =>
        candidato.numero === "13"
    );

  const flavio =
    resultado.candidatos.find(
      (candidato) =>
        candidato.numero === "22"
    );

  if (!lula || !flavio) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">
          Aguardando dados dos candidatos.
        </p>
      </section>
    );
  }

  const diferencaVotos =
    Math.abs(
      lula.votos -
        flavio.votos
    );

  const lider =
    lula.votos ===
    flavio.votos
      ? null
      : lula.votos >
          flavio.votos
        ? lula
        : flavio;

  const apuracaoIniciada =
    resultado.totalizado > 0 ||
    resultado.votosValidos > 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* ==================================================
          TOPO
      ================================================== */}

      <div className="px-6 pb-5 pt-6 sm:px-8 sm:pt-7">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Brasil
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Resultado Nacional
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Presidente da República · 2º turno
            </p>
          </div>

          <div className="sm:text-right">
            <div className="flex items-baseline gap-2 sm:justify-end">
              <strong className="text-3xl font-bold tracking-tight text-slate-950">
                {formatarPercentual(
                  resultado.totalizado
                )}
              </strong>

              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                totalizado
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Atualização oficial do TSE
            </p>
          </div>
        </div>

        {/* TOTALIZAÇÃO */}

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-800 transition-all duration-700"
            style={{
              width: `${Math.min(
                resultado.totalizado,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* ==================================================
          PLACAR
      ================================================== */}

      <div className="border-y border-slate-100 bg-slate-50/60 px-6 py-7 sm:px-8">

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 sm:gap-8">

          {/* LULA */}

          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    obterCorCandidato(
                      lula.numero
                    ),
                }}
              />

              <span className="text-sm font-bold text-slate-400">
                {lula.numero}
              </span>
            </div>

            <h3 className="mt-3 text-base font-bold uppercase tracking-wide text-slate-800 sm:text-lg">
              {lula.nomeUrna ??
                lula.nome}
            </h3>

            <p className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              {formatarPercentual(
                lula.percentual
              )}
            </p>

            <p className="mt-2 text-xs text-slate-500 sm:text-sm">
              {formatarNumero(
                lula.votos
              )}{" "}
              votos
            </p>
          </div>

          {/* DIVISOR */}

          <div className="pb-5 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
              ×
            </span>
          </div>

          {/* FLAVIO */}

          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm font-bold text-slate-400">
                {flavio.numero}
              </span>

              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    obterCorCandidato(
                      flavio.numero
                    ),
                }}
              />
            </div>

            <h3 className="mt-3 text-base font-bold uppercase tracking-wide text-slate-800 sm:text-lg">
              {flavio.nomeUrna ??
                flavio.nome}
            </h3>

            <p className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              {formatarPercentual(
                flavio.percentual
              )}
            </p>

            <p className="mt-2 text-xs text-slate-500 sm:text-sm">
              {formatarNumero(
                flavio.votos
              )}{" "}
              votos
            </p>
          </div>

        </div>

        {/* ==================================================
            BARRA LULA × FLAVIO
        ================================================== */}

        <div className="mt-8">
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-200">
            {apuracaoIniciada && (
              <>
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      lula.percentual,
                      100
                    )}%`,
                    backgroundColor:
                      obterCorCandidato(
                        lula.numero
                      ),
                  }}
                />

                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      flavio.percentual,
                      100
                    )}%`,
                    backgroundColor:
                      obterCorCandidato(
                        flavio.numero
                      ),
                  }}
                />
              </>
            )}
          </div>

          {!apuracaoIniciada && (
            <p className="mt-3 text-center text-sm font-medium text-slate-400">
              Aguardando início da totalização
            </p>
          )}
        </div>

      </div>

      {/* ==================================================
          INDICADORES
      ================================================== */}

      <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

        <div className="px-6 py-5 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Votos válidos
          </p>

          <p className="mt-1.5 text-lg font-bold text-slate-800">
            {formatarNumero(
              resultado.votosValidos
            )}
          </p>
        </div>

        <div className="px-6 py-5 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Diferença
          </p>

          <p className="mt-1.5 text-lg font-bold text-slate-800">
            {formatarNumero(
              diferencaVotos
            )}{" "}
            votos
          </p>
        </div>

        <div className="px-6 py-5 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Liderança
          </p>

          <p className="mt-1.5 text-lg font-bold text-slate-800">
            {apuracaoIniciada
              ? lider
                ? lider.nomeUrna ??
                  lider.nome
                : "Empate"
              : "—"}
          </p>
        </div>

      </div>

      {/* ==================================================
          RODAPÉ
      ================================================== */}

      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">

        <span>
          Comparecimento{" "}
          <strong className="font-semibold text-slate-700">
            {formatarNumero(
              resultado.comparecimento
            )}
          </strong>
        </span>

        <span>
          Última atualização:{" "}
          <strong className="font-semibold text-slate-700">
            {resultado.atualizadoEm ||
              "aguardando"}
          </strong>
        </span>

      </div>

      {/* ERRO DE ATUALIZAÇÃO */}

      {erroAtualizacao && (
        <div className="border-t border-amber-200 bg-amber-50 px-6 py-3 text-xs text-amber-700 sm:px-8">
          Não foi possível obter a atualização mais recente. Os últimos dados recebidos permanecem em exibição.
        </div>
      )}

    </section>
  );
}