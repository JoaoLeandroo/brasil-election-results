"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ResultadoBrasil,
  ResultadoEstado,
} from "@/types/eleicao";

import type {
  ModoDados,
} from "@/hooks/useResultadosEleicao";

import {
  calcularResultadoNacional,
  formatarNumero,
  formatarPercentual,
  obterCorCandidato,
} from "@/lib/eleicao";


// ======================================================
// PROPS
// ======================================================

interface Props {

  modoDados:
    ModoDados;

  resultadosEstados:
    ResultadoEstado[];

  progressoSimulacao:
    number;

}


// ======================================================
// COMPONENTE
// ======================================================

export default function ResultadoNacional({
  modoDados,
  resultadosEstados,
  progressoSimulacao,
}: Props) {

  // ====================================================
  // RESULTADO OFICIAL
  // ====================================================

  const [
    resultadoOficial,
    setResultadoOficial,
  ] =
    useState<ResultadoBrasil | null>(
      null
    );


  // ====================================================
  // STATUS DA CONSULTA NACIONAL
  // ====================================================

  const [
    carregandoOficial,
    setCarregandoOficial,
  ] =
    useState(true);


  const [
    erroOficial,
    setErroOficial,
  ] =
    useState(false);


  // ====================================================
  // BUSCAR RESULTADO NACIONAL OFICIAL
  // ====================================================

  useEffect(() => {

    let componenteAtivo =
      true;


    let consultaEmAndamento =
      false;


    async function consultarBrasil() {

      if (
        consultaEmAndamento
      ) {
        return;
      }


      consultaEmAndamento =
        true;


      try {

        const resposta =
          await fetch(
            "/api/resultados/brasil",
            {
              cache:
                "no-store",
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


        setResultadoOficial(
          dados
        );


        setErroOficial(
          false
        );


      } catch (error) {

        console.error(
          "Erro ao consultar resultado nacional:",
          error
        );


        if (!componenteAtivo) {
          return;
        }


        setErroOficial(
          true
        );


      } finally {

        consultaEmAndamento =
          false;


        if (
          componenteAtivo
        ) {

          setCarregandoOficial(
            false
          );

        }

      }

    }


    void consultarBrasil();


    const intervalo =
      window.setInterval(
        () => {

          void consultarBrasil();

        },
        10_000
      );


    return () => {

      componenteAtivo =
        false;


      window.clearInterval(
        intervalo
      );

    };

  }, []);


  // ====================================================
  // RESULTADO SIMULADO
  // ====================================================

  const resultadoSimulado =
    useMemo(() => {

      return calcularResultadoNacional(
        resultadosEstados
      );

    }, [
      resultadosEstados,
    ]);


  // ====================================================
  // DADOS EXIBIDOS
  // ====================================================

  const dados =
    useMemo(() => {

      if (
        modoDados ===
        "simulacao"
      ) {

        return {
          totalizado:
            progressoSimulacao,

          votosValidos:
            resultadoSimulado
              .votosValidos,

          votosBrancos:
            resultadoSimulado
              .votosBrancos,

          votosNulos:
            resultadoSimulado
              .votosNulos,

          comparecimento:
            resultadoSimulado
              .comparecimento,

          abstencoes:
            resultadoSimulado
              .abstencoes,

          candidatos:
            resultadoSimulado
              .candidatos,

          atualizadoEm:
            "SIMULAÇÃO",
        };

      }


      if (
        !resultadoOficial
      ) {
        return null;
      }


      return {
        totalizado:
          resultadoOficial
            .totalizado,

        votosValidos:
          resultadoOficial
            .votosValidos,

        votosBrancos:
          resultadoOficial
            .votosBrancos,

        votosNulos:
          resultadoOficial
            .votosNulos,

        comparecimento:
          resultadoOficial
            .comparecimento,

        abstencoes:
          resultadoOficial
            .abstencoes,

        candidatos:
          resultadoOficial
            .candidatos,

        atualizadoEm:
          resultadoOficial
            .atualizadoEm,
      };

    }, [
      modoDados,
      progressoSimulacao,
      resultadoSimulado,
      resultadoOficial,
    ]);


  // ====================================================
  // CANDIDATOS
  // ====================================================

  const lula =
    dados?.candidatos.find(
      (candidato) =>
        candidato.numero ===
        "13"
    );


  const flavio =
    dados?.candidatos.find(
      (candidato) =>
        candidato.numero ===
        "22"
    );


  // ====================================================
  // CARREGANDO
  // ====================================================

  if (
    modoDados ===
      "oficial" &&
    carregandoOficial &&
    !resultadoOficial
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


  // ====================================================
  // ERRO SEM DADOS
  // ====================================================

  if (
    modoDados ===
      "oficial" &&
    erroOficial &&
    !resultadoOficial
  ) {

    return (

      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">

        <p className="font-semibold text-red-700">

          Não foi possível carregar o resultado nacional.

        </p>

        <p className="mt-1 text-sm text-red-600">

          O mapa estadual continua disponível e uma nova tentativa será realizada automaticamente.

        </p>

      </section>

    );

  }


  if (
    !dados ||
    !lula ||
    !flavio
  ) {

    return null;

  }


  // ====================================================
  // DIFERENÇA DE VOTOS
  // ====================================================

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


  // ====================================================
  // INTERFACE
  // ====================================================

  return (

    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">


      {/* ==================================================
          CABEÇALHO
      ================================================== */}

      <div className="border-b border-gray-100 px-6 py-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h2 className="text-xl font-bold text-gray-900">

                Resultado Nacional

              </h2>


              {modoDados ===
                "simulacao" && (

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">

                  SIMULAÇÃO

                </span>

              )}

            </div>


            <p className="mt-1 text-sm text-gray-500">

              Presidente · 2º turno

            </p>

          </div>


          <div className="text-left sm:text-right">

            <p className="text-2xl font-bold text-gray-900">

              {formatarPercentual(
                dados.totalizado
              )}

            </p>

            <p className="text-xs text-gray-500">

              seções totalizadas

            </p>

          </div>

        </div>


        {/* BARRA DE TOTALIZAÇÃO */}

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">

          <div
            className="h-full rounded-full bg-gray-900 transition-all duration-700"
            style={{
              width:
                `${Math.min(
                  dados.totalizado,
                  100
                )}%`,
            }}
          />

        </div>

      </div>


      {/* ==================================================
          CANDIDATOS
      ================================================== */}

      <div className="grid md:grid-cols-2">


        {/* ==================================================
            LULA
        ================================================== */}

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
                width:
                  `${lula.percentual}%`,

                backgroundColor:
                  obterCorCandidato(
                    lula.numero
                  ),
              }}
            />

          </div>

        </div>


        {/* ==================================================
            FLAVIO
        ================================================== */}

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
                width:
                  `${flavio.percentual}%`,

                backgroundColor:
                  obterCorCandidato(
                    flavio.numero
                  ),
              }}
            />

          </div>

        </div>

      </div>


      {/* ==================================================
          BARRA COMPARATIVA
      ================================================== */}

      <div className="border-t border-gray-100 px-6 py-5">

        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">

          Distribuição dos votos válidos

        </p>


        <div className="flex h-4 overflow-hidden rounded-full bg-gray-100">

          <div
            className="h-full transition-all duration-700"
            style={{
              width:
                `${lula.percentual}%`,

              backgroundColor:
                obterCorCandidato(
                  lula.numero
                ),
            }}
          />

          <div
            className="h-full transition-all duration-700"
            style={{
              width:
                `${flavio.percentual}%`,

              backgroundColor:
                obterCorCandidato(
                  flavio.numero
                ),
            }}
          />

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


      {/* ==================================================
          RESUMO
      ================================================== */}

      <div className="grid gap-px border-t border-gray-100 bg-gray-100 sm:grid-cols-3">

        <div className="bg-white px-6 py-4">

          <p className="text-xs text-gray-400">

            Votos válidos

          </p>

          <p className="mt-1 font-bold text-gray-800">

            {formatarNumero(
              dados.votosValidos
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


      {/* ==================================================
          RODAPÉ
      ================================================== */}

      <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">

        <div className="flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">

          <span>

            Comparecimento:{" "}

            <strong className="font-semibold text-gray-700">

              {formatarNumero(
                dados.comparecimento
              )}

            </strong>

          </span>


          {modoDados ===
            "simulacao" ? (

            <span className="font-medium text-amber-600">

              Dados fictícios para teste da interface

            </span>

          ) : (

            <span>

              Atualização TSE:{" "}

              {dados.atualizadoEm ||
                "aguardando"}

            </span>

          )}

        </div>

      </div>


      {/* ERRO DE ATUALIZAÇÃO */}

      {modoDados ===
        "oficial" &&
        erroOficial &&
        resultadoOficial && (

        <div className="border-t border-amber-200 bg-amber-50 px-6 py-3 text-xs text-amber-700">

          Não foi possível obter a atualização mais recente. Os últimos dados nacionais disponíveis permanecem sendo exibidos.

        </div>

      )}

    </section>

  );
}