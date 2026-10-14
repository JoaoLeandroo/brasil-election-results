import DashboardEleicao from "@/components/eleicao/DashboardEleicao";


export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-7xl px-5 py-10">

        <header className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Eleições 2026
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Eleição Presidencial
          </h1>

          <p className="mt-2 text-gray-500">
            Segundo turno · 25 de outubro de 2026
          </p>

        </header>


        <DashboardEleicao />

      </div>

    </main>
  );
}