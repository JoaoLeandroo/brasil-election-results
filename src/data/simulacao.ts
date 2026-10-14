import type {
  Candidato,
  ResultadoEstado,
} from "@/types/eleicao";


// ======================================================
// ATENÇÃO
// ======================================================
//
// TODOS OS NÚMEROS DESTE ARQUIVO SÃO FICTÍCIOS.
//
// Eles existem exclusivamente para testar:
//
// - cores do mapa;
// - percentuais;
// - votos;
// - totalização;
// - troca de liderança;
// - painel estadual.
//
// NÃO são projeções eleitorais.
// NÃO são pesquisas.
// NÃO são resultados oficiais.
// ======================================================


// ======================================================
// TIPO AUXILIAR
// ======================================================

interface ConfiguracaoSimulacao {
  uf: string;
  nome: string;

  totalizado: number;

  votosLula: number;
  votosFlavio: number;

  comparecimento: number;
  abstencoes: number;
}


// ======================================================
// CONFIGURAÇÃO DAS 27 UFs
// ======================================================

const configuracaoSimulada:
  ConfiguracaoSimulacao[] = [

  {
    uf: "AC",
    nome: "Acre",
    totalizado: 38.4,
    votosLula: 118000,
    votosFlavio: 171000,
    comparecimento: 310000,
    abstencoes: 72000,
  },

  {
    uf: "AL",
    nome: "Alagoas",
    totalizado: 45.7,
    votosLula: 610000,
    votosFlavio: 342000,
    comparecimento: 1020000,
    abstencoes: 250000,
  },

  {
    uf: "AP",
    nome: "Amapá",
    totalizado: 31.8,
    votosLula: 126000,
    votosFlavio: 98000,
    comparecimento: 241000,
    abstencoes: 61000,
  },

  {
    uf: "AM",
    nome: "Amazonas",
    totalizado: 42.6,
    votosLula: 620000,
    votosFlavio: 490000,
    comparecimento: 1190000,
    abstencoes: 310000,
  },

  {
    uf: "BA",
    nome: "Bahia",
    totalizado: 52.3,
    votosLula: 2910000,
    votosFlavio: 1160000,
    comparecimento: 4310000,
    abstencoes: 890000,
  },

  {
    uf: "CE",
    nome: "Ceará",
    totalizado: 48.9,
    votosLula: 1730000,
    votosFlavio: 780000,
    comparecimento: 2660000,
    abstencoes: 610000,
  },

  {
    uf: "DF",
    nome: "Distrito Federal",
    totalizado: 64.2,
    votosLula: 620000,
    votosFlavio: 720000,
    comparecimento: 1420000,
    abstencoes: 310000,
  },

  {
    uf: "ES",
    nome: "Espírito Santo",
    totalizado: 55.4,
    votosLula: 830000,
    votosFlavio: 910000,
    comparecimento: 1840000,
    abstencoes: 390000,
  },

  {
    uf: "GO",
    nome: "Goiás",
    totalizado: 43.8,
    votosLula: 1050000,
    votosFlavio: 1320000,
    comparecimento: 2500000,
    abstencoes: 570000,
  },

  {
    uf: "MA",
    nome: "Maranhão",
    totalizado: 36.1,
    votosLula: 1130000,
    votosFlavio: 490000,
    comparecimento: 1740000,
    abstencoes: 430000,
  },

  {
    uf: "MT",
    nome: "Mato Grosso",
    totalizado: 59.7,
    votosLula: 580000,
    votosFlavio: 790000,
    comparecimento: 1450000,
    abstencoes: 340000,
  },

  {
    uf: "MS",
    nome: "Mato Grosso do Sul",
    totalizado: 62.5,
    votosLula: 530000,
    votosFlavio: 610000,
    comparecimento: 1210000,
    abstencoes: 280000,
  },

  {
    uf: "MG",
    nome: "Minas Gerais",
    totalizado: 57.3,
    votosLula: 4210000,
    votosFlavio: 3970000,
    comparecimento: 8610000,
    abstencoes: 1720000,
  },

  {
    uf: "PA",
    nome: "Pará",
    totalizado: 39.5,
    votosLula: 1410000,
    votosFlavio: 860000,
    comparecimento: 2410000,
    abstencoes: 590000,
  },

  {
    uf: "PB",
    nome: "Paraíba",
    totalizado: 46.8,
    votosLula: 790000,
    votosFlavio: 390000,
    comparecimento: 1260000,
    abstencoes: 300000,
  },

  {
    uf: "PR",
    nome: "Paraná",
    totalizado: 61.4,
    votosLula: 2210000,
    votosFlavio: 2670000,
    comparecimento: 5120000,
    abstencoes: 1030000,
  },

  {
    uf: "PE",
    nome: "Pernambuco",
    totalizado: 58.7,
    votosLula: 2050000,
    votosFlavio: 1010000,
    comparecimento: 3260000,
    abstencoes: 720000,
  },

  {
    uf: "PI",
    nome: "Piauí",
    totalizado: 41.3,
    votosLula: 660000,
    votosFlavio: 250000,
    comparecimento: 970000,
    abstencoes: 220000,
  },

  {
    uf: "RJ",
    nome: "Rio de Janeiro",
    totalizado: 66.9,
    votosLula: 3180000,
    votosFlavio: 3440000,
    comparecimento: 6970000,
    abstencoes: 1540000,
  },

  {
    uf: "RN",
    nome: "Rio Grande do Norte",
    totalizado: 49.2,
    votosLula: 690000,
    votosFlavio: 330000,
    comparecimento: 1090000,
    abstencoes: 260000,
  },

  {
    uf: "RS",
    nome: "Rio Grande do Sul",
    totalizado: 63.1,
    votosLula: 2180000,
    votosFlavio: 2450000,
    comparecimento: 4890000,
    abstencoes: 1050000,
  },

  {
    uf: "RO",
    nome: "Rondônia",
    totalizado: 44.6,
    votosLula: 290000,
    votosFlavio: 410000,
    comparecimento: 745000,
    abstencoes: 175000,
  },

  {
    uf: "RR",
    nome: "Roraima",
    totalizado: 35.9,
    votosLula: 85000,
    votosFlavio: 121000,
    comparecimento: 220000,
    abstencoes: 52000,
  },

  {
    uf: "SC",
    nome: "Santa Catarina",
    totalizado: 68.4,
    votosLula: 1410000,
    votosFlavio: 2030000,
    comparecimento: 3620000,
    abstencoes: 770000,
  },

  {
    uf: "SP",
    nome: "São Paulo",
    totalizado: 72.6,
    votosLula: 8240000,
    votosFlavio: 8110000,
    comparecimento: 17200000,
    abstencoes: 3510000,
  },

  {
    uf: "SE",
    nome: "Sergipe",
    totalizado: 47.5,
    votosLula: 430000,
    votosFlavio: 260000,
    comparecimento: 735000,
    abstencoes: 170000,
  },

  {
    uf: "TO",
    nome: "Tocantins",
    totalizado: 40.2,
    votosLula: 270000,
    votosFlavio: 290000,
    comparecimento: 595000,
    abstencoes: 140000,
  },

];


// ======================================================
// CALCULAR PERCENTUAL
// ======================================================

function calcularPercentual(
  votos: number,
  total: number
): number {

  if (total === 0) {

    return 0;

  }


  return (
    votos /
    total *
    100
  );

}


// ======================================================
// CRIAR CANDIDATOS
// ======================================================

function criarCandidatos(
  votosLula: number,
  votosFlavio: number
): Candidato[] {

  const votosValidos =
    votosLula +
    votosFlavio;


  const percentualLula =
    calcularPercentual(
      votosLula,
      votosValidos
    );


  const percentualFlavio =
    calcularPercentual(
      votosFlavio,
      votosValidos
    );


  return [

    {
      numero: "13",

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
      numero: "22",

      nome:
        "FLAVIO NANTES BOLSONARO",

      nomeUrna:
        "FLAVIO BOLSONARO",

      votos:
        votosFlavio,

      percentual:
        percentualFlavio,
    },

  ];

}


// ======================================================
// GERAR RESULTADOS SIMULADOS
// ======================================================

export function gerarResultadosSimulados():
  ResultadoEstado[] {

  return configuracaoSimulada.map(
    (estado) => {

      const candidatos =
        criarCandidatos(
          estado.votosLula,
          estado.votosFlavio
        );


      const votosValidos =
        estado.votosLula +
        estado.votosFlavio;


      return {

        uf:
          estado.uf,

        nome:
          estado.nome,

        totalizado:
          estado.totalizado,

        candidatos,

        votosValidos,

        votosBrancos:
          Math.round(
            estado.comparecimento *
            0.015
          ),

        votosNulos:
          Math.round(
            estado.comparecimento *
            0.025
          ),

        comparecimento:
          estado.comparecimento,

        abstencoes:
          estado.abstencoes,

        atualizadoEm:
          "SIMULAÇÃO",

      };

    }
  );

}


// ======================================================
// RESULTADOS PRONTOS
// ======================================================
//
// Também exportamos diretamente o array caso seja útil
// em outras partes da aplicação.
// ======================================================

export const resultadosSimulados =
  gerarResultadosSimulados();