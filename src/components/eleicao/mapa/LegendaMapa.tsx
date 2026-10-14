import {
  CORES_CANDIDATOS,
  COR_NEUTRA,
} from "@/lib/eleicao";


export default function LegendaMapa() {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm">

      <div className="flex items-center gap-2">

        <span
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor:
              CORES_CANDIDATOS[
                "13"
              ],
          }}
        />

        <span className="text-gray-600">
          Lula
        </span>

      </div>


      <div className="flex items-center gap-2">

        <span
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor:
              CORES_CANDIDATOS[
                "22"
              ],
          }}
        />

        <span className="text-gray-600">
          Flavio Bolsonaro
        </span>

      </div>


      <div className="flex items-center gap-2">

        <span
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor:
              COR_NEUTRA,
          }}
        />

        <span className="text-gray-600">
          Aguardando apuração
        </span>

      </div>

    </div>
  );
}