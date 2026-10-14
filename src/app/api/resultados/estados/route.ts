import { NextResponse } from "next/server";

import { estados } from "@/data/estados";

import {
  converterNumero,
  converterPercentual,
  criarUrlEstado,
  encontrarCandidatos,
} from "@/lib/tse";

import type {
  Candidato,
  ResultadoEstado,
} from "@/types/eleicao";

import type {
  TSEEleitorado,
  TSEObjeto,
  TSESecoes,
  TSEVotos,
} from "@/types/tse";


// ======================================================
// CONFIGURAÇÃO
// ======================================================

const TEMPO_CACHE = 10;


// ======================================================
// CONSULTAR UMA UF
// ======================================================

async function consultarEstado(
  uf: string,
  nome: string
): Promise<ResultadoEstado> {

  const url = criarUrlEstado(uf);


  const response = await fetch(
    url,
    {
      next: {
        revalidate: TEMPO_CACHE,
      },
    }
  );


  if (!response.ok) {

    throw new Error(
      `${uf}: TSE retornou HTTP ${response.status}`
    );

  }


  const dados: TSEObjeto =
    await response.json();


  // ====================================================
  // CANDIDATOS
  // ====================================================

  const candidatosTSE =
    encontrarCandidatos(dados);


  const candidatos: Candidato[] =
    candidatosTSE

      .filter(
        (candidato) =>
          candidato.n &&
          candidato.nm
      )

      .map((candidato) => ({

        numero:
          candidato.n ?? "",

        nome:
          candidato.nm ?? "",

        nomeUrna:
          candidato.nmu,

        votos:
          converterNumero(
            candidato.vap
          ),

        percentual:
          converterPercentual(
            candidato.pvap
          ),

      }))

      .sort(
        (a, b) =>
          b.votos - a.votos
      );


  // ====================================================
  // DADOS GERAIS
  // ====================================================

  const secoes =
    dados.s as
      | TSESecoes
      | undefined;


  const eleitorado =
    dados.e as
      | TSEEleitorado
      | undefined;


  const votos =
    dados.v as
      | TSEVotos
      | undefined;


  // ====================================================
  // DATA E HORA DO TSE
  // ====================================================

  const dataTSE =
    typeof dados.dt === "string"
      ? dados.dt
      : "";


  const horaTSE =
    typeof dados.ht === "string"
      ? dados.ht
      : "";


  // ====================================================
  // RESULTADO NORMALIZADO
  // ====================================================

  return {

    uf,

    nome,

    totalizado:
      converterPercentual(
        secoes?.pst
      ),

    candidatos,

    votosValidos:
      converterNumero(
        votos?.vv
      ),

    votosBrancos:
      converterNumero(
        votos?.vb
      ),

    votosNulos:
      converterNumero(
        votos?.vn
      ),

    comparecimento:
      converterNumero(
        eleitorado?.c
      ),

    abstencoes:
      converterNumero(
        eleitorado?.a
      ),

    atualizadoEm:
      dataTSE && horaTSE
        ? `${dataTSE} ${horaTSE}`
        : "",

  };

}


// ======================================================
// API
// ======================================================

export async function GET() {

  try {

    // ==================================================
    // CONSULTAR AS 27 UFs
    // ==================================================
    //
    // Promise.allSettled permite que uma consulta falhe
    // sem derrubar todas as outras.
    // ==================================================

    const consultas =
      await Promise.allSettled(

        estados.map(
          (estado) =>
            consultarEstado(
              estado.uf,
              estado.nome
            )
        )

      );


    // ==================================================
    // RESULTADOS QUE FUNCIONARAM
    // ==================================================

    const resultados:
      ResultadoEstado[] = [];


    // ==================================================
    // UFs QUE FALHARAM
    // ==================================================

    const estadosComErro:
      string[] = [];


    // ==================================================
    // ANALISAR CADA RESPOSTA
    // ==================================================

    consultas.forEach(
      (consulta, indice) => {

        const estado =
          estados[indice];


        if (
          consulta.status ===
          "fulfilled"
        ) {

          resultados.push(
            consulta.value
          );

          return;

        }


        // A consulta desta UF falhou.

        estadosComErro.push(
          estado.uf
        );


        console.error(
          `Erro ao consultar ${estado.uf}:`,
          consulta.reason
        );

      }
    );


    // ==================================================
    // ORDENAR NOVAMENTE
    // ==================================================
    //
    // Mantém a mesma ordem definida em estados.ts.
    // ==================================================

const ordemEstados =
  new Map<string, number>(
    estados.map(
      (estado, indice) => [
        estado.uf,
        indice,
      ]
    )
  );


resultados.sort(
  (a, b) =>
    (ordemEstados.get(a.uf) ?? 999) -
    (ordemEstados.get(b.uf) ?? 999)
);


    // ==================================================
    // NENHUMA UF RESPONDEU
    // ==================================================
    //
    // Só consideramos a API completamente indisponível
    // quando nenhuma das 27 consultas funcionou.
    // ==================================================

    if (
      resultados.length === 0
    ) {

      return NextResponse.json(
        {

          erro:
            "Nenhum resultado estadual pôde ser consultado.",

          turno: 2,

          totalEstados: 0,

          totalEsperado: estados.length,

          estadosComErro:
            estados.map(
              (estado) =>
                estado.uf
            ),

          estados: [],

        },
        {
          status: 503,
        }
      );

    }


    // ==================================================
    // RESPOSTA
    // ==================================================

    return NextResponse.json({

      turno: 2,

      totalEstados:
        resultados.length,

      totalEsperado:
        estados.length,

      parcial:
        estadosComErro.length > 0,

      totalErros:
        estadosComErro.length,

      estadosComErro,

      estados:
        resultados,

    });


  } catch (erro) {

    // ==================================================
    // ERRO INESPERADO DA NOSSA PRÓPRIA API
    // ==================================================

    console.error(
      "Erro inesperado na API de estados:",
      erro
    );


    return NextResponse.json(
      {

        erro:
          "Ocorreu um erro inesperado ao processar os resultados estaduais.",

      },
      {
        status: 500,
      }
    );

  }

}