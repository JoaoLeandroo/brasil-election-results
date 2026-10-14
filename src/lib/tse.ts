import { TSECandidato, TSEObjeto } from "@/types/tse";


// ======================================================
// CONVERTER NÚMERO DO TSE
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
// CONVERTER PERCENTUAL DO TSE
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