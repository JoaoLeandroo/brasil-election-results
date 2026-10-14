import type {
  Candidato,
  ResultadoEstado,
} from "@/types/eleicao";


// ======================================================
// CORES
// ======================================================

export const COR_NEUTRA =
  "#e5e7eb";

export const CORES_CANDIDATOS:
  Record<string, string> = {
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
    (a, b) =>
      b.votos - a.votos
  );
}


// ======================================================
// OBTER LÍDER
// ======================================================

export function obterCandidatoLider(
  candidatos: Candidato[]
): Candidato | null {

  const ordenados =
    ordenarCandidatos(
      candidatos
    );


  if (
    ordenados.length === 0
  ) {
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
    CORES_CANDIDATOS[
      numero
    ] ??
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


  if (
    resultado.totalizado <= 0
  ) {
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
    .replace(
      ".",
      ","
    )}%`;
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


// ======================================================
// RESULTADO NACIONAL AGREGADO
// ======================================================
//
// Usado principalmente no modo de simulação.
//
// Soma os resultados das UFs para gerar um resultado
// nacional coerente com o que está sendo exibido no mapa.
// ======================================================

export function calcularResultadoNacional(
  estados: ResultadoEstado[]
) {

  let votosLula =
    0;

  let votosFlavio =
    0;

  let votosValidos =
    0;

  let votosBrancos =
    0;

  let votosNulos =
    0;

  let comparecimento =
    0;

  let abstencoes =
    0;


  let somaTotalizacao =
    0;


  estados.forEach(
    (estado) => {

      votosValidos +=
        estado.votosValidos;

      votosBrancos +=
        estado.votosBrancos;

      votosNulos +=
        estado.votosNulos;

      comparecimento +=
        estado.comparecimento;

      abstencoes +=
        estado.abstencoes;

      somaTotalizacao +=
        estado.totalizado;


      estado.candidatos.forEach(
        (candidato) => {

          if (
            candidato.numero ===
            "13"
          ) {
            votosLula +=
              candidato.votos;
          }


          if (
            candidato.numero ===
            "22"
          ) {
            votosFlavio +=
              candidato.votos;
          }

        }
      );

    }
  );


  const totalizacao =
    estados.length > 0
      ? somaTotalizacao /
        estados.length
      : 0;


  const percentualLula =
    votosValidos > 0
      ? (
          votosLula /
          votosValidos
        ) *
        100
      : 0;


  const percentualFlavio =
    votosValidos > 0
      ? (
          votosFlavio /
          votosValidos
        ) *
        100
      : 0;


  return {
    totalizado:
      totalizacao,

    votosValidos,

    votosBrancos,

    votosNulos,

    comparecimento,

    abstencoes,

    candidatos: [
      {
        numero:
          "13",

        nome:
          "LUIZ INÁCIO LULA DA SILVA",

        nomeUrna:
          "LULA",

        votos:
          votosLula,

        percentual:
          percentualLula,
      },

      {
        numero:
          "22",

        nome:
          "FLAVIO NANTES BOLSONARO",

        nomeUrna:
          "FLAVIO BOLSONARO",

        votos:
          votosFlavio,

        percentual:
          percentualFlavio,
      },
    ] satisfies Candidato[],
  };
}