import { NextResponse } from "next/server";

import {
  converterNumero,
  converterPercentual,
  criarUrlBrasil,
  encontrarCandidatos,
} from "@/lib/tse";

import type {
  Candidato,
  ResultadoBrasil,
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

const TEMPO_CACHE = 10;


// ======================================================
// API — RESULTADO BRASIL
// ======================================================

export async function GET() {

  try {

    const url =
      criarUrlBrasil();


    // ==================================================
    // CONSULTAR TSE
    // ==================================================

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
        `TSE retornou ${response.status}`
      );

    }


    const dados: TSEObjeto =
      await response.json();


    // ==================================================
    // CANDIDATOS
    // ==================================================

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


    // ==================================================
    // DADOS GERAIS
    // ==================================================

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


    // ==================================================
    // DATA E HORA
    // ==================================================

    const dataTSE =
      typeof dados.dt === "string"
        ? dados.dt
        : "";


    const horaTSE =
      typeof dados.ht === "string"
        ? dados.ht
        : "";


    // ==================================================
    // RESULTADO
    // ==================================================

    const resultado: ResultadoBrasil = {

      cargo:
        "Presidente da República",

      turno:
        2,

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


    return NextResponse.json(
      resultado
    );

  } catch (erro) {

    console.error(
      "Erro ao consultar resultado nacional:",
      erro
    );


    return NextResponse.json(
      {
        erro:
          "Não foi possível consultar os resultados nacionais.",
      },
      {
        status: 500,
      }
    );

  }

}