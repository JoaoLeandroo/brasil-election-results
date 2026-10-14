import type {
  ResultadoEstado,
} from "@/types/eleicao";

import {
  formatarNumero,
  formatarPercentual,
  obterCorCandidato,
} from "@/lib/eleicao";

interface Props {
  resultado: ResultadoEstado | null;
  carregando: boolean;
}

export default function PainelEstado({
  resultado,
  carregando,
}: Props) {
  // ====================================================
  // CARREGAMENTO
  // ====================================================

  if (carregando) {
    return (
      <div className="flex min-h-[470px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-8">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-700" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Carregando resultados...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // NENHUM ESTADO SELECIONADO
  // ====================================================

  if (!resultado) {
    return (
      <div className="flex min-h-[470px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8">
        <div className="max-w-xs text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-5 w-5 text-slate-500"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z"
              />

              <circle
                cx="12"
                cy="10"
                r="2"
              />
            </svg>
          </div>

          <p className="mt-4 font-semibold text-slate-700">
            Selecione um estado
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Clique em uma unidade da Federação no mapa para
            visualizar os resultados detalhados.
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // CANDIDATOS
  // ====================================================

  const lula = resultado.candidatos.find(
    (candidato) => candidato.numero === "13"
  );

  const flavio = resultado.candidatos.find(
    (candidato) => candidato.numero === "22"
  );

  const apuracaoIniciada =
    resultado.totalizado > 0 ||
    resultado.votosValidos > 0;

  const lider =
    lula && flavio
      ? lula.votos === flavio.votos
        ? null
        : lula.votos > flavio.votos
          ? lula
          : flavio
      : null;

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* CABEÇALHO */}

      <div className="px-6 pb-5 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold tracking-wider text-white">
                {resultado.uf}
              </span>

              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Resultado estadual
              </span>
            </div>

            <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              {resultado.nome}
            </h3>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold text-slate-900">
              {formatarPercentual(
                resultado.totalizado
              )}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              totalizado
            </p>
          </div>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-800 transition-all duration-700"
            style={{
              width: `${Math.min(
                resultado.totalizado,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* PLACAR */}

      {lula && flavio ? (
        <div className="border-y border-slate-100 bg-slate-50/70 px-6 py-6">
          <div className="grid grid-cols-2 gap-5">
            {/* LULA */}

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      obterCorCandidato(
                        lula.numero
                      ),
                  }}
                />

                <span className="text-xs font-bold text-slate-400">
                  {lula.numero}
                </span>
              </div>

              <p className="mt-2 text-sm font-bold uppercase tracking-wide text-slate-700">
                {lula.nomeUrna ?? lula.nome}
              </p>

              <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">
                {formatarPercentual(
                  lula.percentual
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {formatarNumero(
                  lula.votos
                )}{" "}
                votos
              </p>
            </div>

            {/* FLAVIO */}

            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs font-bold text-slate-400">
                  {flavio.numero}
                </span>

                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      obterCorCandidato(
                        flavio.numero
                      ),
                  }}
                />
              </div>

              <p className="mt-2 text-sm font-bold uppercase tracking-wide text-slate-700">
                {flavio.nomeUrna ??
                  flavio.nome}
              </p>

              <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">
                {formatarPercentual(
                  flavio.percentual
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {formatarNumero(
                  flavio.votos
                )}{" "}
                votos
              </p>
            </div>
          </div>

          {/* BARRA COMPARATIVA */}

          <div className="mt-6">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-200">
              {apuracaoIniciada && (
                <>
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        lula.percentual,
                        100
                      )}%`,
                      backgroundColor:
                        obterCorCandidato(
                          lula.numero
                        ),
                    }}
                  />

                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        flavio.percentual,
                        100
                      )}%`,
                      backgroundColor:
                        obterCorCandidato(
                          flavio.numero
                        ),
                    }}
                  />
                </>
              )}
            </div>

            {!apuracaoIniciada && (
              <p className="mt-3 text-center text-xs font-medium text-slate-400">
                Aguardando início da totalização
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="border-y border-slate-100 bg-slate-50 px-6 py-8 text-center">
          <p className="text-sm text-slate-500">
            Aguardando dados dos candidatos.
          </p>
        </div>
      )}

      {/* INDICADORES */}

      <div className="grid grid-cols-2 gap-px bg-slate-100">
        <div className="bg-white px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Votos válidos
          </p>

          <p className="mt-1 font-bold text-slate-800">
            {formatarNumero(
              resultado.votosValidos
            )}
          </p>
        </div>

        <div className="bg-white px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Liderança
          </p>

          <p className="mt-1 truncate font-bold text-slate-800">
            {apuracaoIniciada
              ? lider
                ? lider.nomeUrna ??
                  lider.nome
                : "Empate"
              : "—"}
          </p>
        </div>

        <div className="bg-white px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Comparecimento
          </p>

          <p className="mt-1 font-bold text-slate-800">
            {formatarNumero(
              resultado.comparecimento
            )}
          </p>
        </div>

        <div className="bg-white px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Abstenções
          </p>

          <p className="mt-1 font-bold text-slate-800">
            {formatarNumero(
              resultado.abstencoes
            )}
          </p>
        </div>
      </div>

      {/* ATUALIZAÇÃO */}

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3.5">
        <p className="text-xs text-slate-400">
          Atualização TSE:{" "}
          <span className="font-medium text-slate-600">
            {resultado.atualizadoEm ||
              "aguardando"}
          </span>
        </p>
      </div>
    </div>
  );
}