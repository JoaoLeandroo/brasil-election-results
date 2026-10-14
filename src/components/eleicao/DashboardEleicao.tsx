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
  } = useResultadosEleicao();

  return (
    <div className="space-y-7">

      {/* ==================================================
          STATUS
      ================================================== */}

      <div className="flex min-h-10 items-center justify-end">
        <StatusAtualizacao
          carregando={carregando}
          atualizando={atualizando}
          erroAtualizacao={erroAtualizacao}
          dadosParciais={dadosParciais}
          estadosComErro={estadosComErro}
          totalEstados={totalEstados}
          totalEsperado={totalEsperado}
          ultimaAtualizacao={ultimaAtualizacao}
        />
      </div>

      {/* ==================================================
          ERRO ESTADUAL
      ================================================== */}

      {erroInicial && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="font-semibold text-red-800">
            Os resultados estaduais estão temporariamente indisponíveis
          </p>

          <p className="mt-1 text-sm text-red-600">
            Novas tentativas de consulta serão realizadas automaticamente.
          </p>
        </div>
      )}

      {/* ==================================================
          RESULTADO NACIONAL
      ================================================== */}

      <ResultadoNacional />

      {/* ==================================================
          RESULTADO NOS ESTADOS
      ================================================== */}

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Visão territorial
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Resultado nos estados
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Acompanhe a liderança e a totalização em cada unidade da Federação.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <MapaBrasil
            resultados={resultados}
            carregando={carregando}
          />
        </div>
      </section>

    </div>
  );
}