"use client";

import StatusAtualizacao from "@/components/eleicao/StatusAtualizacao";

import ResultadoNacional from "@/components/eleicao/ResultadoNacional";

import MapaBrasil from "@/components/eleicao/mapa/MapaBrasil";

import useResultadosEleicao from "@/hooks/useResultadosEleicao";

export default function DashboardEleicao() {
  const {
    resultados,

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

      {/* STATUS */}

      <div className="flex justify-end">
        <StatusAtualizacao
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

      {/* ERRO ESTADUAL */}

      {erroInicial && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">
            Não foi possível carregar os resultados estaduais
          </p>

          <p className="mt-1 text-sm text-red-600">
            {erroInicial}
          </p>

          <p className="mt-2 text-xs text-red-500">
            Novas tentativas de atualização serão realizadas automaticamente.
          </p>
        </div>
      )}

      {/* RESULTADO NACIONAL */}

      <ResultadoNacional />

      {/* MAPA */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <MapaBrasil
          resultados={
            resultados
          }
          carregando={
            carregando
          }
        />
      </div>

    </div>
  );
}