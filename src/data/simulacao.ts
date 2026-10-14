import type {
  Candidato,
  ResultadoEstado,
} from "@/types/eleicao";


// ======================================================
// SIMULAÇÃO ELEITORAL
// ======================================================
//
// TODOS OS DADOS DESTE ARQUIVO SÃO FICTÍCIOS.
//
// Finalidade exclusiva:
// testar o funcionamento técnico do monitor.
//
// NÃO representam:
// - pesquisa eleitoral;
// - projeção;
// - previsão;
// - resultado oficial.
// ======================================================


interface ConfiguracaoEstado {
  uf: string;
  nome: string;

  votosLulaFinal: number;
  votosFlavioFinal: number;

  comparecimentoFinal: number;
  abstencoesFinal: number;

  // Se true, o estado terá troca de liderança
  // durante a simulação.
  trocaLideranca?: boolean;
}


// ======================================================
// CONFIGURAÇÃO FINAL FICTÍCIA
// ======================================================

const estadosSimulados:
  ConfiguracaoEstado[] = [

  {
    uf: "AC",
    nome: "Acre",
    votosLulaFinal: 118000,
    votosFlavioFinal: 171000,
    comparecimentoFinal: 310000,
    abstencoesFinal: 72000,
  },

  {
    uf: "AL",
    nome: "Alagoas",
    votosLulaFinal: 610000,
    votosFlavioFinal: 342000,
    comparecimentoFinal: 1020000,
    abstencoesFinal: 250000,
  },

  {
    uf: "AP",
    nome: "Amapá",
    votosLulaFinal: 126000,
    votosFlavioFinal: 98000,
    comparecimentoFinal: 241000,
    abstencoesFinal: 61000,
  },

  {
    uf: "AM",
    nome: "Amazonas",
    votosLulaFinal: 620000,
    votosFlavioFinal: 490000,
    comparecimentoFinal: 1190000,
    abstencoesFinal: 310000,
  },

  {
    uf: "BA",
    nome: "Bahia",
    votosLulaFinal: 2910000,
    votosFlavioFinal: 1160000,
    comparecimentoFinal: 4310000,
    abstencoesFinal: 890000,
  },

  {
    uf: "CE",
    nome: "Ceará",
    votosLulaFinal: 1730000,
    votosFlavioFinal: 780000,
    comparecimentoFinal: 2660000,
    abstencoesFinal: 610000,
  },

  {
    uf: "DF",
    nome: "Distrito Federal",
    votosLulaFinal: 620000,
    votosFlavioFinal: 720000,
    comparecimentoFinal: 1420000,
    abstencoesFinal: 310000,
  },

  {
    uf: "ES",
    nome: "Espírito Santo",
    votosLulaFinal: 830000,
    votosFlavioFinal: 910000,
    comparecimentoFinal: 1840000,
    abstencoesFinal: 390000,
  },

  {
    uf: "GO",
    nome: "Goiás",
    votosLulaFinal: 1050000,
    votosFlavioFinal: 1320000,
    comparecimentoFinal: 2500000,
    abstencoesFinal: 570000,
  },

  {
    uf: "MA",
    nome: "Maranhão",
    votosLulaFinal: 1130000,
    votosFlavioFinal: 490000,
    comparecimentoFinal: 1740000,
    abstencoesFinal: 430000,
  },

  {
    uf: "MT",
    nome: "Mato Grosso",
    votosLulaFinal: 580000,
    votosFlavioFinal: 790000,
    comparecimentoFinal: 1450000,
    abstencoesFinal: 340000,
  },

  {
    uf: "MS",
    nome: "Mato Grosso do Sul",
    votosLulaFinal: 530000,
    votosFlavioFinal: 610000,
    comparecimentoFinal: 1210000,
    abstencoesFinal: 280000,
  },

  {
    uf: "MG",
    nome: "Minas Gerais",
    votosLulaFinal: 4210000,
    votosFlavioFinal: 3970000,
    comparecimentoFinal: 8610000,
    abstencoesFinal: 1720000,
    trocaLideranca: true,
  },

  {
    uf: "PA",
    nome: "Pará",
    votosLulaFinal: 1410000,
    votosFlavioFinal: 860000,
    comparecimentoFinal: 2410000,
    abstencoesFinal: 590000,
  },

  {
    uf: "PB",
    nome: "Paraíba",
    votosLulaFinal: 790000,
    votosFlavioFinal: 390000,
    comparecimentoFinal: 1260000,
    abstencoesFinal: 300000,
  },

  {
    uf: "PR",
    nome: "Paraná",
    votosLulaFinal: 2210000,
    votosFlavioFinal: 2670000,
    comparecimentoFinal: 5120000,
    abstencoesFinal: 1030000,
  },

  {
    uf: "PE",
    nome: "Pernambuco",
    votosLulaFinal: 2050000,
    votosFlavioFinal: 1010000,
    comparecimentoFinal: 3260000,
    abstencoesFinal: 720000,
  },

  {
    uf: "PI",
    nome: "Piauí",
    votosLulaFinal: 660000,
    votosFlavioFinal: 250000,
    comparecimentoFinal: 970000,
    abstencoesFinal: 220000,
  },

  {
    uf: "RJ",
    nome: "Rio de Janeiro",
    votosLulaFinal: 3180000,
    votosFlavioFinal: 3440000,
    comparecimentoFinal: 6970000,
    abstencoesFinal: 1540000,
    trocaLideranca: true,
  },

  {
    uf: "RN",
    nome: "Rio Grande do Norte",
    votosLulaFinal: 690000,
    votosFlavioFinal: 330000,
    comparecimentoFinal: 1090000,
    abstencoesFinal: 260000,
  },

  {
    uf: "RS",
    nome: "Rio Grande do Sul",
    votosLulaFinal: 2180000,
    votosFlavioFinal: 2450000,
    comparecimentoFinal: 4890000,
    abstencoesFinal: 1050000,
  },

  {
    uf: "RO",
    nome: "Rondônia",
    votosLulaFinal: 290000,
    votosFlavioFinal: 410000,
    comparecimentoFinal: 745000,
    abstencoesFinal: 175000,
  },

  {
    uf: "RR",
    nome: "Roraima",
    votosLulaFinal: 85000,
    votosFlavioFinal: 121000,
    comparecimentoFinal: 220000,
    abstencoesFinal: 52000,
  },

  {
    uf: "SC",
    nome: "Santa Catarina",
    votosLulaFinal: 1410000,
    votosFlavioFinal: 2030000,
    comparecimentoFinal: 3620000,
    abstencoesFinal: 770000,
  },

  {
    uf: "SP",
    nome: "São Paulo",
    votosLulaFinal: 8240000,
    votosFlavioFinal: 8110000,
    comparecimentoFinal: 17200000,
    abstencoesFinal: 3510000,
    trocaLideranca: true,
  },

  {
    uf: "SE",
    nome: "Sergipe",
    votosLulaFinal: 430000,
    votosFlavioFinal: 260000,
    comparecimentoFinal: 735000,
    abstencoesFinal: 170000,
  },

  {
    uf: "TO",
    nome: "Tocantins",
    votosLulaFinal: 270000,
    votosFlavioFinal: 290000,
    comparecimentoFinal: 595000,
    abstencoesFinal: 140000,
    trocaLideranca: true,
  },

];


// ======================================================
// PERCENTUAL
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
        calcularPercentual(
          votosLula,
          votosValidos
        ),
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
        calcularPercentual(
          votosFlavio,
          votosValidos
        ),
    },

  ];
}


// ======================================================
// GERAR RESULTADOS PARA UM ESTÁGIO DA APURAÇÃO
// ======================================================
//
// progresso deve variar entre:
//
// 0 e 100
//
// Exemplos:
//
// 5
// 18
// 37
// 59
// 76
// 91
// 100
//
// ======================================================

export function gerarResultadosSimulados(
  progresso: number
): ResultadoEstado[] {

  const progressoSeguro =
    Math.max(
      0,
      Math.min(
        100,
        progresso
      )
    );


  const fator =
    progressoSeguro /
    100;


  return estadosSimulados.map(
    (estado) => {

      // ================================================
      // PARTICIPAÇÃO DOS CANDIDATOS
      // ================================================

      const totalFinal =
        estado.votosLulaFinal +
        estado.votosFlavioFinal;


      const percentualFinalLula =
        estado.votosLulaFinal /
        totalFinal;


      let participacaoLula =
        percentualFinalLula;


      // ================================================
      // TROCA DE LIDERANÇA
      // ================================================
      //
      // Em alguns estados fazemos a composição dos
      // votos mudar durante a totalização.
      //
      // No início Lula recebe uma vantagem fictícia.
      //
      // Conforme a apuração avança, a participação
      // converge para o resultado final configurado.
      //
      // Isso permite testar mudanças de cor no mapa.
      // ================================================

      if (
        estado.trocaLideranca
      ) {

        const participacaoInicialLula =
          percentualFinalLula >= 0.5
            ? 0.46
            : 0.54;


        participacaoLula =
          participacaoInicialLula +
          (
            percentualFinalLula -
            participacaoInicialLula
          ) *
          fator;
      }


      const participacaoFlavio =
        1 -
        participacaoLula;


      // ================================================
      // VOTOS TOTALIZADOS ATÉ O MOMENTO
      // ================================================

      const votosValidosMomento =
        Math.round(
          totalFinal *
          fator
        );


      const votosLula =
        Math.round(
          votosValidosMomento *
          participacaoLula
        );


      const votosFlavio =
        Math.max(
          0,
          votosValidosMomento -
          votosLula
        );


      // ================================================
      // COMPARECIMENTO
      // ================================================

      const comparecimento =
        Math.round(
          estado.comparecimentoFinal *
          fator
        );


      const abstencoes =
        Math.round(
          estado.abstencoesFinal *
          fator
        );


      const votosValidos =
        votosLula +
        votosFlavio;


      return {

        uf:
          estado.uf,

        nome:
          estado.nome,

        totalizado:
          progressoSeguro,

        candidatos:
          criarCandidatos(
            votosLula,
            votosFlavio
          ),

        votosValidos,

        votosBrancos:
          Math.round(
            comparecimento *
            0.015
          ),

        votosNulos:
          Math.round(
            comparecimento *
            0.025
          ),

        comparecimento,

        abstencoes,

        atualizadoEm:
          "SIMULAÇÃO",

      };

    }
  );
}