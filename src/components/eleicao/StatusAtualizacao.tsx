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
  if (carregando) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />

        Consultando dados oficiais...
      </div>
    );
  }

  if (atualizando) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>

        Atualizando resultados...
      </div>
    );
  }

  if (erroAtualizacao) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Atualização temporariamente indisponível. Os últimos dados recebidos permanecem em exibição.
      </div>
    );
  }

  if (dadosParciais) {
    return (
      <div className="text-right">
        <div className="flex items-center justify-end gap-2 text-sm font-medium text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500" />

          Dados parcialmente disponíveis
        </div>

        <p className="mt-1 text-xs text-slate-400">
          {totalEstados} de {totalEsperado} UFs carregadas
        </p>

        {estadosComErro.length > 0 && (
          <p className="mt-1 text-xs text-amber-600">
            Indisponíveis:{" "}
            {estadosComErro.join(", ")}
          </p>
        )}
      </div>
    );
  }

  if (ultimaAtualizacao) {
    return (
      <div className="text-right">
        <div className="flex items-center justify-end gap-2 text-sm font-medium text-slate-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />

          Atualização automática
        </div>

        <p className="mt-1 text-xs text-slate-400">
          Última consulta às{" "}
          {ultimaAtualizacao.toLocaleTimeString(
            "pt-BR",
            {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }
          )}
        </p>
      </div>
    );
  }

  return null;
}