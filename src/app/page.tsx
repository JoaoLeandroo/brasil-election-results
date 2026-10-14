import DashboardEleicao from "@/components/eleicao/DashboardEleicao";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      {/* ==================================================
          CABEÇALHO
      ================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-bold tracking-wider text-white">
                  ELEIÇÕES 2026
                </span>

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Brasil
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Eleição Presidencial
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Segundo turno · 25 de outubro de 2026
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  Dados oficiais
                </p>

                <p className="text-xs text-slate-500">
                  Tribunal Superior Eleitoral
                </p>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ==================================================
          CONTEÚDO
      ================================================== */}

      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">
        <DashboardEleicao />
      </div>
    </main>
  );
}