export interface Candidato {
  numero: string;
  nome: string;
  nomeUrna?: string;
  votos: number;
  percentual: number;
}

export interface ResultadoBrasil {
  cargo: string;
  turno: number;

  totalizado: number;

  candidatos: Candidato[];

  votosValidos: number;
  votosBrancos: number;
  votosNulos: number;

  comparecimento: number;
  abstencoes: number;

  atualizadoEm: string;
}

export interface ResultadoEstado {
  uf: string;
  nome: string;

  totalizado: number;

  candidatos: Candidato[];

  votosValidos: number;
  votosBrancos: number;
  votosNulos: number;

  comparecimento: number;
  abstencoes: number;

  atualizadoEm: string;
}

export interface ResultadoRegiao {
  regiao: string;

  candidatos: Candidato[];

  votosValidos: number;

  estados: ResultadoEstado[];
}