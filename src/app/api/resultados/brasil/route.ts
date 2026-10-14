import { NextResponse } from "next/server";

import {
  converterNumero,
  converterPercentual,
  encontrarCandidatos,
} from "@/lib/tse";

import type { Candidato } from "@/types/eleicao";


// ======================================================
// TEMPORÁRIO
//
// Estamos usando o 1º turno apenas para validar
// nossa nova arquitetura.
//
// Depois substituiremos pela eleição do 2º turno.
// ======================================================

const URL_TSE =
  "https://resultados.tse.jus.br/oficial/ele2026/6257/dados/br/br-c0001-e006257-u.json";


export async function GET() {

  try {

    // ==================================================
    // CONSULTAR TSE
    // ==================================================

    const response = await fetch(
      URL_TSE,
      {
        cache: "no-store",
      }
    );


    if (!response.ok) {

      throw new Error(
        `TSE retornou ${response.status}`
      );

    }


    // ==================================================
    // JSON ORIGINAL
    // ==================================================

    const dados: unknown =
      await response.json();


    // ==================================================
    // LOCALIZAR CANDIDATOS
    // ==================================================

    const candidatosTSE =
      encontrarCandidatos(dados);


    // ==================================================
    // TRANSFORMAR PARA NOSSO FORMATO
    // ==================================================

    const candidatos: Candidato[] =
      candidatosTSE

        .filter(
          (candidato) =>
            candidato.n &&
            candidato.nm &&
            candidato.vap
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
    // RETORNO DA NOSSA API
    // ==================================================

    return NextResponse.json({

      teste: true,

      aviso:
        "Usando temporariamente dados oficiais do 1º turno para validar a arquitetura.",

      cargo:
        "Presidente da República",

      turno:
        1,

      candidatos,

      atualizadoEm:
        new Date().toISOString(),

    });


  } catch (erro) {

    console.error(
      "Erro ao consultar TSE:",
      erro
    );


    return NextResponse.json(
      {
        erro:
          "Não foi possível consultar os resultados do TSE.",
      },
      {
        status: 500,
      }
    );

  }

}