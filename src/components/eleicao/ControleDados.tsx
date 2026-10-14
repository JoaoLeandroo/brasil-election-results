"use client";

import type {
  ModoDados,
} from "@/hooks/useResultadosEleicao";


interface Props {
  modoDados: ModoDados;

  onOficial: () => void;
  onSimulacao: () => void;
}


export default function ControleDados({
  modoDados,
  onOficial,
  onSimulacao,
}: Props) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-semibold text-gray-900">
            Dados exibidos
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Alterne entre os dados oficiais e o ambiente de teste.
          </p>
        </div>


        <div className="inline-flex w-fit rounded-xl border border-gray-200 bg-white p-1 shadow-sm">

          <button
            type="button"
            onClick={onOficial}
            className={
              modoDados === "oficial"
                ? "rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
            }
          >
            Oficial
          </button>


          <button
            type="button"
            onClick={onSimulacao}
            className={
              modoDados === "simulacao"
                ? "rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
            }
          >
            Simulação
          </button>

        </div>
      </div>


      {modoDados ===
        "simulacao" && (

        <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-4">

          <div className="flex gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">
              !
            </div>

            <div>
              <p className="font-bold text-amber-900">
                MODO DE SIMULAÇÃO
              </p>

              <p className="mt-1 text-sm text-amber-800">
                Os números exibidos são fictícios e servem exclusivamente para testar o funcionamento do monitor. Não representam pesquisa, projeção ou resultado eleitoral oficial.
              </p>
            </div>

          </div>

        </div>

      )}
    </>
  );
}