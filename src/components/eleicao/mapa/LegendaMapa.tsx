import {
  COR_NEUTRA,
  CORES_CANDIDATOS,
} from "@/lib/eleicao";

export default function LegendaMapa() {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-slate-100 pt-5">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor: CORES_CANDIDATOS["13"],
          }}
        />

        <span className="text-xs font-medium text-slate-600">
          Lula
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor: CORES_CANDIDATOS["22"],
          }}
        />

        <span className="text-xs font-medium text-slate-600">
          Flavio Bolsonaro
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full border border-slate-300"
          style={{
            backgroundColor: COR_NEUTRA,
          }}
        />

        <span className="text-xs font-medium text-slate-500">
          Aguardando resultado
        </span>
      </div>
    </div>
  );
}