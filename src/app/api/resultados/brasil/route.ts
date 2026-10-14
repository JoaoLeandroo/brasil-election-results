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
        cache: "no-store",
      }
    );


    if (!response.ok) {

      throw new Error(
        `TSE retornou ${response.status}`
      );

    }


    const dados =
      (await response.json()) as TSEObjeto;


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
    // SEÇÕES
    // ==================================================

    const secoes =
      dados.s as TSESecoes | undefined;


    // ==================================================
    // ELEITORADO
    // ==================================================

    const eleitorado =
      dados.e as TSEEleitorado | undefined;


    // ==================================================
    // VOTOS
    // ==================================================

    const votos =
      dados.v as TSEVotos | undefined;


    // ==================================================
    // DATA / HORA OFICIAL DO TSE
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
    // RESULTADO NORMALIZADO
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