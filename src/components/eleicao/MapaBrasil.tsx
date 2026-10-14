"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import * as d3 from "d3";

import type { ResultadoEstado } from "@/types/eleicao";

// ======================================================
// TIPOS DO GEOJSON DO IBGE
// ======================================================

interface PropriedadesUF {
  CD_UF: string;
  NM_UF: string;
  SIGLA_UF: string;

  CD_REGIAO?: string;
  NM_REGIAO?: string;
  SIGLA_RG?: string;
  AREA_KM2?: number;
}

type EstadoGeoJSON = GeoJSON.Feature<GeoJSON.Geometry, PropriedadesUF>;

type BrasilGeoJSON = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  PropriedadesUF
>;

// ======================================================
// RESPOSTA DA NOSSA API
// ======================================================

interface RespostaEstados {
  turno: number;
  totalEstados: number;
  estados: ResultadoEstado[];
}

// ======================================================
// COMPONENTE
// ======================================================

export default function MapaBrasil() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [geojson, setGeojson] = useState<BrasilGeoJSON | null>(null);

  const [resultados, setResultados] = useState<ResultadoEstado[]>([]);

  const [estadoSelecionado, setEstadoSelecionado] = useState<string | null>(
    null,
  );

  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState<string | null>(null);

  // ====================================================
  // CARREGAR GEOJSON + RESULTADOS
  // ====================================================

  useEffect(() => {
    async function carregarDados() {
      try {
        const [respostaMapa, respostaResultados] = await Promise.all([
          fetch("/geo/brasil-ufs.geojson"),

          fetch("/api/resultados/estados"),
        ]);

        if (!respostaMapa.ok) {
          throw new Error("Erro ao carregar GeoJSON.");
        }

        if (!respostaResultados.ok) {
          throw new Error("Erro ao carregar resultados.");
        }

        const dadosMapa: BrasilGeoJSON = await respostaMapa.json();

        const dadosResultados: RespostaEstados =
          await respostaResultados.json();

        setGeojson(dadosMapa);

        setResultados(dadosResultados.estados);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);

        setErro("Não foi possível carregar o mapa ou os resultados.");
      } finally {
        setCarregando(false);
      }
    }

    void carregarDados();
  }, []);

  // ====================================================
  // ESTADO SELECIONADO
  // ====================================================

  const resultadoSelecionado = useMemo(() => {
    if (!estadoSelecionado) {
      return null;
    }

    return resultados.find((estado) => estado.uf === estadoSelecionado) ?? null;
  }, [estadoSelecionado, resultados]);

  // ====================================================
  // DESENHAR MAPA
  // ====================================================

  useEffect(() => {
    if (!geojson || !svgRef.current) {
      return;
    }

    const largura = 800;
    const altura = 760;

    const svg = d3.select(svgRef.current);

    // Limpa desenho anterior
    svg.selectAll("*").remove();

    svg
      .attr("viewBox", `0 0 ${largura} ${altura}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // ==================================================
    // PROJEÇÃO
    // ==================================================

    const projection = d3.geoMercator().fitExtent(
      [
        [25, 25],
        [largura - 25, altura - 25],
      ],
      geojson,
    );

    const path = d3.geoPath().projection(projection);

    // ==================================================
    // ESTADOS
    // ==================================================

    svg
      .selectAll<SVGPathElement, EstadoGeoJSON>("path")

      .data(geojson.features)

      .join("path")

      .attr("d", path)

      .attr("fill", (estado) => {
        return estado.properties.SIGLA_UF === estadoSelecionado
          ? "#94a3b8"
          : "#e5e7eb";
      })

      .attr("stroke", "#ffffff")

      .attr("stroke-width", 1.4)

      .style("cursor", "pointer")

      // ================================================
      // PASSAR O MOUSE
      // ================================================

      .on("mouseenter", function () {
        d3.select(this).attr("fill", "#cbd5e1");
      })

      .on("mouseleave", function (_event, estado) {
        const selecionado = estado.properties.SIGLA_UF === estadoSelecionado;

        d3.select(this).attr("fill", selecionado ? "#94a3b8" : "#e5e7eb");
      })

      // ================================================
      // CLIQUE
      // ================================================

      .on("click", function (_event, estado) {
        setEstadoSelecionado(estado.properties.SIGLA_UF);
      });

    // ==================================================
    // SIGLAS DAS UFs
    // ==================================================

    svg
      .selectAll("text")
      .data(geojson.features)
      .join("text")

      .attr("transform", (estado) => {
        const centro = path.centroid(estado);

        return `translate(` + `${centro[0]},` + `${centro[1]}` + `)`;
      })

      .attr("text-anchor", "middle")

      .attr("dominant-baseline", "middle")

      .attr("font-size", "12px")

      .attr("font-weight", "600")

      .attr("fill", "#475569")

      .style("pointer-events", "none")

      .text((estado) => estado.properties.SIGLA_UF);
  }, [geojson, estadoSelecionado]);

  // ====================================================
  // CARREGANDO
  // ====================================================

  if (carregando) {
    return (
      <div className="py-20 text-center text-gray-500">
        Carregando mapa e resultados...
      </div>
    );
  }

  // ====================================================
  // ERRO
  // ====================================================

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        {erro}
      </div>
    );
  }

  // ====================================================
  // INTERFACE
  // ====================================================

  return (
    <section className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Resultado por estado
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Clique em uma unidade da Federação para visualizar os resultados.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* ============================================
            MAPA
        ============================================ */}

        <div>
          <svg
            ref={svgRef}
            className="h-auto w-full"
            aria-label="Mapa eleitoral do Brasil"
          />
        </div>

        {/* ============================================
            PAINEL
        ============================================ */}

        <div>
          {!resultadoSelecionado && (
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
          )}

          {resultadoSelecionado && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              {/* ESTADO */}

              <div className="border-b border-gray-100 pb-5">
                <p className="text-sm font-medium text-gray-500">
                  {resultadoSelecionado.uf}
                </p>

                <h3 className="mt-1 text-2xl font-bold text-gray-900">
                  {resultadoSelecionado.nome}
                </h3>
              </div>

              {/* TOTALIZAÇÃO */}

              <div className="py-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Seções totalizadas
                  </span>

                  <strong className="text-gray-900">
                    {resultadoSelecionado.totalizado.toFixed(2)}%
                  </strong>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-800 transition-all"
                    style={{
                      width: `${resultadoSelecionado.totalizado}%`,
                    }}
                  />
                </div>
              </div>

              {/* CANDIDATOS */}

              <div className="space-y-4">
                {resultadoSelecionado.candidatos.map((candidato) => (
                  <div
                    key={candidato.numero}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-400">
                          {candidato.numero}
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                          {candidato.nomeUrna ?? candidato.nome}
                        </p>
                      </div>

                      <p className="text-xl font-bold text-gray-900">
                        {candidato.percentual.toFixed(2).replace(".", ",")}%
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {candidato.votos.toLocaleString("pt-BR")} votos
                    </p>
                  </div>
                ))}
              </div>

              {/* INFORMAÇÕES ADICIONAIS */}

              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Comparecimento</p>

                    <p className="mt-1 font-semibold text-gray-700">
                      {resultadoSelecionado.comparecimento.toLocaleString(
                        "pt-BR",
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Abstenções</p>

                    <p className="mt-1 font-semibold text-gray-700">
                      {resultadoSelecionado.abstencoes.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>

              {/* ATUALIZAÇÃO */}

              {resultadoSelecionado.atualizadoEm && (
                <p className="mt-5 text-xs text-gray-400">
                  Atualizado em {resultadoSelecionado.atualizadoEm}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
