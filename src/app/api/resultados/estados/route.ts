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
// TEMPO DE CACHE
// ======================================================

// Durante a apuração, cada resposta do TSE poderá
// ser reutilizada por até 10 segundos.
const TEMPO_CACHE = 10;


// ======================================================
// CONSULTAR UMA UF
// ======================================================

async function consultarEstado(
  uf: string,
  nome: string
): Promise<ResultadoEstado> {

  const url =
    criarUrlEstado(uf);


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
      `${uf}: TSE retornou ${response.status}`
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

    // As 27 consultas continuam acontecendo
    // paralelamente, mas agora cada fetch pode
    // aproveitar o cache de 10 segundos.

    const resultados =
      await Promise.all(

        estados.map(
          (estado) =>
            consultarEstado(
              estado.uf,
              estado.nome
            )
        )

      );


    return NextResponse.json({

      turno: 2,

      totalEstados:
        resultados.length,

      estados:
        resultados,

    });

  } catch (erro) {

    console.error(
      "Erro ao consultar estados:",
      erro
    );


    return NextResponse.json(
      {
        erro:
          "Não foi possível consultar os resultados estaduais.",
      },
      {
        status: 500,
      }
    );

  }

}