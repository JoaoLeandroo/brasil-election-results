import {
  TSECandidato,
  TSEObjeto,
} from "@/types/tse";

import { TSE_CONFIG } from "@/lib/tse-config";


// ======================================================
// CONVERTER NÚMERO
// ======================================================

export function converterNumero(
  valor: string | undefined
): number {

  if (!valor) {
    return 0;
  }

  const numero = Number(valor);

  if (Number.isNaN(numero)) {
    return 0;
  }

  return numero;
}


// ======================================================
// CONVERTER PERCENTUAL
// ======================================================

export function converterPercentual(
  valor: string | undefined
): number {

  if (!valor) {
    return 0;
  }

  const numero = Number(
    valor.replace(",", ".")
  );

  if (Number.isNaN(numero)) {
    return 0;
  }

  return numero;
}


// ======================================================
// LOCALIZAR CANDIDATOS
// ======================================================

export function encontrarCandidatos(
  obj: unknown,
  encontrados: TSECandidato[] = []
): TSECandidato[] {

  if (
    obj === null ||
    typeof obj !== "object"
  ) {
    return encontrados;
  }

  const objeto = obj as TSEObjeto;

  if (Array.isArray(objeto.cand)) {

    encontrados.push(
      ...(objeto.cand as TSECandidato[])
    );

  }

  for (const valor of Object.values(objeto)) {

    if (
      valor !== null &&
      typeof valor === "object"
    ) {

      encontrarCandidatos(
        valor,
        encontrados
      );

    }

  }

  return encontrados;
}


// ======================================================
// FORMATAR CÓDIGO DA ELEIÇÃO
// ======================================================

function formatarEleicao(): string {

  return String(
    TSE_CONFIG.eleicao
  ).padStart(6, "0");

}


// ======================================================
// URL RESULTADO BRASIL
// ======================================================

export function criarUrlBrasil(): string {

  const eleicao =
    formatarEleicao();

  const cargo =
    TSE_CONFIG.cargo.presidente;

  return (
    `${TSE_CONFIG.baseUrl}/` +
    `${TSE_CONFIG.ambiente}/` +
    `${TSE_CONFIG.ciclo}/` +
    `${TSE_CONFIG.eleicao}/` +
    `dados/br/` +
    `br-c${cargo}-e${eleicao}-u.json`
  );

}


// ======================================================
// URL RESULTADO POR UF
// ======================================================

export function criarUrlEstado(
  uf: string
): string {

  const ufFormatada =
    uf.toLowerCase();

  const eleicao =
    formatarEleicao();

  const cargo =
    TSE_CONFIG.cargo.presidente;

  return (
    `${TSE_CONFIG.baseUrl}/` +
    `${TSE_CONFIG.ambiente}/` +
    `${TSE_CONFIG.ciclo}/` +
    `${TSE_CONFIG.eleicao}/` +
    `dados/${ufFormatada}/` +
    `${ufFormatada}-c${cargo}-e${eleicao}-u.json`
  );

}