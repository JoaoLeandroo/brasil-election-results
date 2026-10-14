"use client";

import ControleDados from "@/components/eleicao/ControleDados";

import StatusAtualizacao from "@/components/eleicao/StatusAtualizacao";

import ResultadoNacional from "@/components/eleicao/ResultadoNacional";

import MapaBrasil from "@/components/eleicao/mapa/MapaBrasil";

import useResultadosEleicao from "@/hooks/useResultadosEleicao";


export default function DashboardEleicao() {

  const {
    modoDados,

    ativarOficial,
    ativarSimulacao,

    resultadosExibidos,

    progressoSimulacao,

    carregando,
    atualizando,

    erroInicial,
    erroAtualizacao,

    dadosParciais,
    estadosComErro,

    totalEstados,
    totalEsperado,

    ultimaAtualizacao,
  } =
    useResultadosEleicao();


  return (

    <div className="space-y-6">


      {/* ================================================
          CONTROLE OFICIAL / SIMULAÇÃO
      ================================================= */}

      <ControleDados
        modoDados={
          modoDados
        }
        onOficial={
          ativarOficial
        }
        onSimulacao={
          ativarSimulacao
        }
      />


      {/* ================================================
          ERRO DA CONSULTA ESTADUAL
      ================================================= */}

      {erroInicial &&
        modoDados ===
          "oficial" && (

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

          <p className="font-semibold text-red-700">

            Não foi possível carregar os dados estaduais

          </p>

          <p className="mt-1 text-sm text-red-600">

            {erroInicial}

          </p>

          <p className="mt-2 text-xs text-red-500">

            O modo de simulação continua disponível para testes da interface.

          </p>

        </div>

      )}


      {/* ================================================
          STATUS GERAL
      ================================================= */}

      <div className="flex justify-end">

        <StatusAtualizacao
          modoDados={
            modoDados
          }
          progressoSimulacao={
            progressoSimulacao
          }
          carregando={
            carregando
          }
          atualizando={
            atualizando
          }
          erroAtualizacao={
            erroAtualizacao
          }
          dadosParciais={
            dadosParciais
          }
          estadosComErro={
            estadosComErro
          }
          totalEstados={
            totalEstados
          }
          totalEsperado={
            totalEsperado
          }
          ultimaAtualizacao={
            ultimaAtualizacao
          }
        />

      </div>


      {/* ================================================
          RESULTADO NACIONAL
      ================================================= */}

      <ResultadoNacional
        modoDados={
          modoDados
        }
        resultadosEstados={
          resultadosExibidos
        }
        progressoSimulacao={
          progressoSimulacao
        }
      />


      {/* ================================================
          MAPA DO BRASIL
      ================================================= */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6">

        <MapaBrasil
          resultados={
            resultadosExibidos
          }
          modoDados={
            modoDados
          }
          carregando={
            carregando
          }
        />

      </div>

    </div>

  );
}