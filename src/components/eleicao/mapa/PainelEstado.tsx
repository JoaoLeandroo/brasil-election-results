import type {
  ResultadoEstado,
} from "@/types/eleicao";

import {
  formatarNumero,
  formatarPercentual,
  obterCorCandidato,
} from "@/lib/eleicao";

interface Props {
  resultado:
    | ResultadoEstado
    | null;

  carregando: boolean;
}

export default function PainelEstado({
  resultado,
  carregando,
}: Props) {
  if (carregando) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <div>
          <p className="font-semibold text-gray-700">
            Carregando resultados
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Aguarde enquanto os dados eleitorais são consultados.
          </p>
        </div>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <div>
          <p className="font-semibold text-gray-700">
            Selecione um estado
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Clique no mapa para visualizar os resultados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      {/* CABEÇALHO */}

      <div className="border-b border-gray-100 pb-5">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {resultado.uf}
          </p>

          <h3 className="mt-1 text-2xl font-bold text-gray-900">
            {resultado.nome}
          </h3>
        </div>
      </div>

      {/* TOTALIZAÇÃO */}

      <div className="py-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Seções totalizadas
          </span>

          <strong className="text-gray-900">
            {formatarPercentual(
              resultado.totalizado
            )}
          </strong>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gray-800 transition-all duration-700"
            style={{
              width: `${Math.min(
                resultado.totalizado,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* CANDIDATOS */}

      <div className="space-y-4">
        {resultado.candidatos.map(
          (candidato) => (
            <div
              key={
                candidato.numero
              }
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        obterCorCandidato(
                          candidato.numero
                        ),
                    }}
                  />

                  <div>
                    <p className="text-xs font-semibold text-gray-400">
                      {candidato.numero}
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {candidato.nomeUrna ??
                        candidato.nome}
                    </p>
                  </div>
                </div>

                <p className="text-xl font-bold text-gray-900">
                  {formatarPercentual(
                    candidato.percentual
                  )}
                </p>
              </div>

              <p className="mt-2 pl-6 text-sm text-gray-500">
                {formatarNumero(
                  candidato.votos
                )}{" "}
                votos
              </p>
            </div>
          )
        )}
      </div>

      {/* ELEITORADO */}

      <div className="mt-6 border-t border-gray-100 pt-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">
              Comparecimento
            </p>

            <p className="mt-1 font-semibold text-gray-700">
              {formatarNumero(
                resultado.comparecimento
              )}
            </p>
          </div>

          <div>
            <p className="text-gray-400">
              Abstenções
            </p>

            <p className="mt-1 font-semibold text-gray-700">
              {formatarNumero(
                resultado.abstencoes
              )}
            </p>
          </div>
        </div>
      </div>

      {/* FONTE */}

      {resultado.atualizadoEm && (
        <p className="mt-5 text-xs text-gray-400">
          Dados oficiais atualizados em{" "}
          {resultado.atualizadoEm}
        </p>
      )}
    </div>
  );
}