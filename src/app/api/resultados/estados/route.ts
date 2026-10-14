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
      cache: "no-store",
    }
  );


  if (!response.ok) {

    throw new Error(
      `${uf}: TSE retornou ${response.status}`
    );

  }


  const dados =
    (await response.json()) as TSEObjeto;


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
    dados.s as TSESecoes | undefined;

  const eleitorado =
    dados.e as TSEEleitorado | undefined;

  const votos =
    dados.v as TSEVotos | undefined;


  const dataTSE =
    typeof dados.dt === "string"
      ? dados.dt
      : "";

  const horaTSE =
    typeof dados.ht === "string"
      ? dados.ht
      : "";


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