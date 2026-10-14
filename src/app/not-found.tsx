import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f5f6f8]">
      {/* ==================================================
          CABEÇALHO
      ================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-bold tracking-wider text-white">
                  ELEIÇÕES 2026
                </span>

                <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:inline">
                  Brasil
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-700">
                Eleição Presidencial
              </p>
            </div>

            <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

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
          CONTEÚDO 404
      ================================================== */}

      <section className="flex flex-1 items-center justify-center px-5 py-16 sm:px-6">
        <div className="w-full max-w-2xl text-center">
          {/* ÍCONE */}

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-7 w-7 text-slate-500"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.5 9.5a3.5 3.5 0 0 1 5 0M9 16h6"
              />

              <circle
                cx="12"
                cy="12"
                r="9"
              />
            </svg>
          </div>

          {/* ERRO */}

          <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            Erro 404
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Página não encontrada
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
            O endereço acessado não existe ou pode ter sido alterado.
            Retorne à página inicial para continuar acompanhando os
            resultados da eleição presidencial.
          </p>

          {/* BOTÃO */}

          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M9.5 20v-6h5v6"
                />
              </svg>

              Voltar para o início
            </Link>
          </div>

          {/* INFORMAÇÃO INFERIOR */}

          <div className="mx-auto mt-10 max-w-md border-t border-slate-200 pt-6">
            <p className="text-xs leading-5 text-slate-400">
              Monitor de resultados · Eleições 2026
              <br />
              Segundo turno · 25 de outubro de 2026
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}