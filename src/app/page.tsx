import MapaBrasil from "@/components/eleicao/MapaBrasil";

export default function Home() {

  return (

    <main className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-6xl px-5 py-10">

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


        <div className="rounded-2xl border border-gray-200 bg-white p-6">

          <MapaBrasil />

        </div>

      </div>

    </main>

  );

}