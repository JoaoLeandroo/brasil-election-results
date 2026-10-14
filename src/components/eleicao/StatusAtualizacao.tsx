"use client";

interface Props {
  carregando: boolean;
  atualizando: boolean;

  erroAtualizacao: boolean;

  dadosParciais: boolean;

  estadosComErro: string[];

  totalEstados: number;
  totalEsperado: number;

  ultimaAtualizacao:
    | Date
    | null;
}

export default function StatusAtualizacao({
  carregando,
  atualizando,
  erroAtualizacao,
  dadosParciais,
  estadosComErro,
  totalEstados,
  totalEsperado,
  ultimaAtualizacao,
}: Props) {
  return (
    <div>
      {carregando && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gray-400" />

          Carregando resultados...
        </div>
      )}

      {!carregando &&
        atualizando && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />

            Atualizando resultados...
          </div>
        )}

      {!carregando &&
        !atualizando &&
        erroAtualizacao && (
          <div className="max-w-sm text-sm text-amber-600">
            ⚠ Não foi possível obter a atualização mais recente. Exibindo os últimos dados disponíveis.
          </div>
        )}

      {!carregando &&
        !atualizando &&
        !erroAtualizacao &&
        dadosParciais && (
          <div className="text-sm text-amber-600">
            ⚠ Dados parciais:{" "}
            {totalEstados}/
            {totalEsperado} UFs
          </div>
        )}

      {!carregando &&
        !atualizando &&
        !erroAtualizacao &&
        !dadosParciais &&
        ultimaAtualizacao && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />

            <span>
              Dados oficiais · Atualizado às{" "}
              {ultimaAtualizacao.toLocaleTimeString(
                "pt-BR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }
              )}
            </span>
          </div>
        )}

      {!carregando &&
        dadosParciais &&
        estadosComErro.length >
          0 && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Temporariamente indisponível:{" "}
            <strong>
              {estadosComErro.join(
                ", "
              )}
            </strong>
          </div>
        )}
    </div>
  );
}