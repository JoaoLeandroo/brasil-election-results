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

  if (
    carregando &&
    !resultado
  ) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex min-h-52 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />

            <p className="mt-4 text-sm font-medium text-gray-600">
              Carregando resultado nacional...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    erroAtualizacao &&
    !resultado
  ) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">
          Não foi possível carregar o resultado nacional.
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
        candidato.numero ===
        "13"
    );

  const flavio =
    resultado.candidatos.find(
      (candidato) =>
        candidato.numero ===
        "22"
    );

  if (!lula || !flavio) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
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

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* CABEÇALHO */}

      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Resultado Nacional
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Presidente · 2º turno
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatarPercentual(
                resultado.totalizado
              )}
            </p>

            <p className="text-xs text-gray-500">
              seções totalizadas
            </p>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gray-900 transition-all duration-700"
            style={{
              width: `${Math.min(
                resultado.totalizado,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* CANDIDATOS */}

      <div className="grid md:grid-cols-2">

        {/* LULA */}

        <div className="border-b border-gray-100 p-6 md:border-b-0 md:border-r">
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 rounded-full"
              style={{
                backgroundColor:
                  obterCorCandidato(
                    lula.numero
                  ),
              }}
            />

            <span className="text-sm font-bold text-gray-400">
              {lula.numero}
            </span>
          </div>

          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {lula.nomeUrna ??
              lula.nome}
          </p>

          <p className="mt-1 text-4xl font-bold tracking-tight text-gray-900">
            {formatarPercentual(
              lula.percentual
            )}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            <strong className="font-semibold text-gray-700">
              {formatarNumero(
                lula.votos
              )}
            </strong>{" "}
            votos
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all duration-700"
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
          </div>
        </div>

        {/* FLAVIO */}

        <div className="p-6 md:text-right">
          <div className="flex items-center gap-3 md:justify-end">
            <span className="text-sm font-bold text-gray-400">
              {flavio.numero}
            </span>

            <span
              className="h-4 w-4 rounded-full"
              style={{
                backgroundColor:
                  obterCorCandidato(
                    flavio.numero
                  ),
              }}
            />
          </div>

          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {flavio.nomeUrna ??
              flavio.nome}
          </p>

          <p className="mt-1 text-4xl font-bold tracking-tight text-gray-900">
            {formatarPercentual(
              flavio.percentual
            )}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            <strong className="font-semibold text-gray-700">
              {formatarNumero(
                flavio.votos
              )}
            </strong>{" "}
            votos
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="ml-auto h-full rounded-full transition-all duration-700"
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
          </div>
        </div>
      </div>

      {/* COMPARAÇÃO */}

      <div className="border-t border-gray-100 px-6 py-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Distribuição dos votos válidos
        </p>

        <div className="flex h-4 overflow-hidden rounded-full bg-gray-100">
          {resultado.votosValidos >
            0 && (
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

        <div className="mt-2 flex justify-between text-xs font-semibold text-gray-500">
          <span>
            {formatarPercentual(
              lula.percentual
            )}
          </span>

          <span>
            {formatarPercentual(
              flavio.percentual
            )}
          </span>
        </div>
      </div>

      {/* RESUMO */}

      <div className="grid gap-px border-t border-gray-100 bg-gray-100 sm:grid-cols-3">
        <div className="bg-white px-6 py-4">
          <p className="text-xs text-gray-400">
            Votos válidos
          </p>

          <p className="mt-1 font-bold text-gray-800">
            {formatarNumero(
              resultado.votosValidos
            )}
          </p>
        </div>

        <div className="bg-white px-6 py-4">
          <p className="text-xs text-gray-400">
            Diferença
          </p>

          <p className="mt-1 font-bold text-gray-800">
            {formatarNumero(
              diferencaVotos
            )}{" "}
            votos
          </p>
        </div>

        <div className="bg-white px-6 py-4">
          <p className="text-xs text-gray-400">
            Liderança atual
          </p>

          <p className="mt-1 font-bold text-gray-800">
            {lider
              ? lider.nomeUrna ??
                lider.nome
              : "Empate"}
          </p>
        </div>
      </div>

      {/* RODAPÉ */}

      <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Comparecimento:{" "}
            <strong className="font-semibold text-gray-700">
              {formatarNumero(
                resultado.comparecimento
              )}
            </strong>
          </span>

          <span>
            Atualização TSE:{" "}
            {resultado.atualizadoEm ||
              "aguardando"}
          </span>
        </div>
      </div>

      {erroAtualizacao && (
        <div className="border-t border-amber-200 bg-amber-50 px-6 py-3 text-xs text-amber-700">
          Não foi possível obter a atualização mais recente. Os últimos dados nacionais disponíveis permanecem sendo exibidos.
        </div>
      )}

    </section>
  );
}