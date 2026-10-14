import type {
  Candidato,
  ResultadoEstado,
} from "@/types/eleicao";

export const COR_NEUTRA = "#e5e7eb";

export const CORES_CANDIDATOS: Record<string, string> = {
  "13": "#ef4444",
  "22": "#3b82f6",
};


// ======================================================
// ORDENAR CANDIDATOS
// ======================================================

export function ordenarCandidatos(
  candidatos: Candidato[]
): Candidato[] {
  return [...candidatos].sort(
    (a, b) => b.votos - a.votos
  );
}


// ======================================================
// OBTER LÍDER
// ======================================================

export function obterCandidatoLider(
  candidatos: Candidato[]
): Candidato | null {
  const ordenados =
    ordenarCandidatos(candidatos);

  if (ordenados.length === 0) {
    return null;
  }

  if (
    ordenados.length > 1 &&
    ordenados[0].votos ===
      ordenados[1].votos
  ) {
    return null;
  }

  return ordenados[0];
}


// ======================================================
// COR DO CANDIDATO
// ======================================================

export function obterCorCandidato(
  numero: string
): string {
  return (
    CORES_CANDIDATOS[numero] ??
    COR_NEUTRA
  );
}


// ======================================================
// COR DO ESTADO
// ======================================================

export function obterCorEstado(
  resultado:
    | ResultadoEstado
    | undefined
): string {
  if (!resultado) {
    return COR_NEUTRA;
  }

  if (resultado.totalizado <= 0) {
    return COR_NEUTRA;
  }

  const lider =
    obterCandidatoLider(
      resultado.candidatos
    );

  if (!lider) {
    return COR_NEUTRA;
  }

  return obterCorCandidato(
    lider.numero
  );
}


// ======================================================
// FORMATAR PERCENTUAL
// ======================================================

export function formatarPercentual(
  valor: number
): string {
  return `${valor
    .toFixed(2)
    .replace(".", ",")}%`;
}


// ======================================================
// FORMATAR NÚMERO
// ======================================================

export function formatarNumero(
  valor: number
): string {
  return valor.toLocaleString(
    "pt-BR"
  );
}