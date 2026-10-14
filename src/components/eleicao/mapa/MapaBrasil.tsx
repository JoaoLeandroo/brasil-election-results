"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as d3 from "d3";

import type {
  ResultadoEstado,
} from "@/types/eleicao";

import {
  COR_NEUTRA,
  formatarPercentual,
  obterCandidatoLider,
  obterCorEstado,
} from "@/lib/eleicao";

import LegendaMapa from "./LegendaMapa";
import PainelEstado from "./PainelEstado";

interface PropriedadesUF {
  CD_UF: string;
  NM_UF: string;
  SIGLA_UF: string;

  CD_REGIAO?: string;
  NM_REGIAO?: string;
  SIGLA_RG?: string;

  AREA_KM2?: number;
}

type EstadoGeoJSON =
  GeoJSON.Feature<
    GeoJSON.Geometry,
    PropriedadesUF
  >;

type BrasilGeoJSON =
  GeoJSON.FeatureCollection<
    GeoJSON.Geometry,
    PropriedadesUF
  >;

interface TooltipEstado {
  x: number;
  y: number;
  uf: string;
  nome: string;
}

interface Props {
  resultados: ResultadoEstado[];
  carregando: boolean;
}

export default function MapaBrasil({
  resultados,
  carregando,
}: Props) {
  const svgRef =
    useRef<SVGSVGElement | null>(
      null
    );

  const containerMapaRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const estadoSelecionadoRef =
    useRef<string | null>(null);

  const [
    geojson,
    setGeojson,
  ] =
    useState<BrasilGeoJSON | null>(
      null
    );

  const [
    erroMapa,
    setErroMapa,
  ] =
    useState<string | null>(null);

  const [
    estadoSelecionado,
    setEstadoSelecionado,
  ] =
    useState<string | null>(null);

  const [
    tooltip,
    setTooltip,
  ] =
    useState<TooltipEstado | null>(
      null
    );

  // ====================================================
  // RESULTADO DO ESTADO SELECIONADO
  // ====================================================

  const resultadoSelecionado =
    useMemo(() => {
      if (!estadoSelecionado) {
        return null;
      }

      return (
        resultados.find(
          (resultado) =>
            resultado.uf ===
            estadoSelecionado
        ) ?? null
      );
    }, [
      estadoSelecionado,
      resultados,
    ]);

  // ====================================================
  // RESULTADO DO ESTADO SOB O MOUSE
  // ====================================================

  const resultadoTooltip =
    useMemo(() => {
      if (!tooltip) {
        return null;
      }

      return (
        resultados.find(
          (resultado) =>
            resultado.uf ===
            tooltip.uf
        ) ?? null
      );
    }, [
      tooltip,
      resultados,
    ]);

  // ====================================================
  // LÍDER DO ESTADO SOB O MOUSE
  //
  // IMPORTANTE:
  // obterCandidatoLider recebe Candidato[],
  // por isso passamos resultadoTooltip.candidatos.
  // ====================================================

  const liderTooltip =
    resultadoTooltip
      ? obterCandidatoLider(
          resultadoTooltip.candidatos
        )
      : null;

  // ====================================================
  // CARREGAR GEOJSON
  // ====================================================

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarMapa() {
      try {
        const resposta =
          await fetch(
            "/geo/brasil-ufs-web.geojson"
          );

        if (!resposta.ok) {
          throw new Error(
            `GeoJSON retornou HTTP ${resposta.status}`
          );
        }

        const dados:
          BrasilGeoJSON =
            await resposta.json();

        if (!componenteAtivo) {
          return;
        }

        setGeojson(dados);
        setErroMapa(null);
      } catch (error) {
        console.error(
          "Erro ao carregar mapa:",
          error
        );

        if (!componenteAtivo) {
          return;
        }

        setErroMapa(
          "Não foi possível carregar o mapa do Brasil."
        );
      }
    }

    void carregarMapa();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  // ====================================================
  // DESENHAR MAPA
  // ====================================================

  useEffect(() => {
    if (!geojson) {
      return;
    }

    const elementoSvg =
      svgRef.current;

    if (!elementoSvg) {
      return;
    }

    const largura = 800;
    const altura = 720;

    const svg =
      d3.select(
        elementoSvg
      );

    svg
      .selectAll("*")
      .remove();

    svg
      .attr(
        "viewBox",
        `0 0 ${largura} ${altura}`
      )
      .attr(
        "preserveAspectRatio",
        "xMidYMid meet"
      );

    // ==================================================
    // PROJEÇÃO
    // ==================================================

    const projection =
      d3
        .geoMercator()
        .fitExtent(
          [
            [35, 25],
            [
              largura - 35,
              altura - 25,
            ],
          ],
          geojson
        );

    const path =
      d3
        .geoPath()
        .projection(
          projection
        );

    // ==================================================
    // SOMBRA
    // ==================================================

    const defs =
      svg.append("defs");

    const filtro =
      defs
        .append("filter")
        .attr(
          "id",
          "sombra-mapa"
        )
        .attr(
          "x",
          "-20%"
        )
        .attr(
          "y",
          "-20%"
        )
        .attr(
          "width",
          "140%"
        )
        .attr(
          "height",
          "140%"
        );

    filtro
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 3)
      .attr(
        "stdDeviation",
        4
      )
      .attr(
        "flood-color",
        "#0f172a"
      )
      .attr(
        "flood-opacity",
        0.08
      );

    // ==================================================
    // ESTADOS
    // ==================================================

    const grupoEstados =
      svg
        .append("g")
        .attr(
          "class",
          "camada-estados"
        )
        .attr(
          "filter",
          "url(#sombra-mapa)"
        );

    grupoEstados
      .selectAll<
        SVGPathElement,
        EstadoGeoJSON
      >("path")
      .data(
        geojson.features
      )
      .join("path")
      .attr(
        "class",
        "estado"
      )
      .attr(
        "data-uf",
        (estado) =>
          estado.properties
            .SIGLA_UF
      )
      .attr("d", path)
      .attr(
        "fill",
        COR_NEUTRA
      )
      .attr(
        "stroke",
        "#ffffff"
      )
      .attr(
        "stroke-width",
        1.5
      )
      .attr(
        "opacity",
        1
      )
      .style(
        "cursor",
        "pointer"
      )

      // ==================================================
      // MOUSE ENTER
      // ==================================================

      .on(
        "mouseenter",
        function (
          event,
          estado
        ) {
          const elemento =
            d3.select(this);

          elemento
            .interrupt()
            .attr(
              "stroke",
              "#0f172a"
            )
            .attr(
              "stroke-width",
              2.5
            )
            .attr(
              "opacity",
              0.88
            );

          const container =
            containerMapaRef.current;

          if (!container) {
            return;
          }

          const rect =
            container.getBoundingClientRect();

          setTooltip({
            x:
              event.clientX -
              rect.left,

            y:
              event.clientY -
              rect.top,

            uf:
              estado.properties
                .SIGLA_UF,

            nome:
              estado.properties
                .NM_UF,
          });
        }
      )

      // ==================================================
      // MOUSE MOVE
      // ==================================================

      .on(
        "mousemove",
        function (event) {
          const container =
            containerMapaRef.current;

          if (!container) {
            return;
          }

          const rect =
            container.getBoundingClientRect();

          setTooltip(
            (anterior) => {
              if (!anterior) {
                return null;
              }

              return {
                ...anterior,

                x:
                  event.clientX -
                  rect.left,

                y:
                  event.clientY -
                  rect.top,
              };
            }
          );
        }
      )

      // ==================================================
      // MOUSE LEAVE
      // ==================================================

      .on(
        "mouseleave",
        function () {
          const elemento =
            d3.select(this);

          const uf =
            elemento.attr(
              "data-uf"
            );

          const selecionado =
            uf ===
            estadoSelecionadoRef.current;

          elemento
            .attr(
              "opacity",
              1
            )
            .attr(
              "stroke",
              selecionado
                ? "#0f172a"
                : "#ffffff"
            )
            .attr(
              "stroke-width",
              selecionado
                ? 3
                : 1.5
            );

          setTooltip(null);
        }
      )

      // ==================================================
      // CLICK
      // ==================================================

      .on(
        "click",
        function (
          _event,
          estado
        ) {
          setEstadoSelecionado(
            estado.properties
              .SIGLA_UF
          );
        }
      );

    // ==================================================
    // SIGLAS DOS ESTADOS
    // ==================================================

    const grupoSiglas =
      svg
        .append("g")
        .attr(
          "class",
          "camada-siglas"
        );

    grupoSiglas
      .selectAll<
        SVGTextElement,
        EstadoGeoJSON
      >("text")
      .data(
        geojson.features
      )
      .join("text")
      .attr(
        "transform",
        (estado) => {
          const centro =
            path.centroid(
              estado
            );

          return `translate(${centro[0]},${centro[1]})`;
        }
      )
      .attr(
        "text-anchor",
        "middle"
      )
      .attr(
        "dominant-baseline",
        "middle"
      )
      .attr(
        "font-size",
        "11px"
      )
      .attr(
        "font-weight",
        "700"
      )
      .attr(
        "fill",
        "#334155"
      )
      .style(
        "pointer-events",
        "none"
      )
      .text(
        (estado) =>
          estado.properties
            .SIGLA_UF
      );
  }, [geojson]);

  // ====================================================
  // ATUALIZAR CORES DO MAPA
  // ====================================================

  useEffect(() => {
    if (
      !svgRef.current ||
      !geojson
    ) {
      return;
    }

    const svg =
      d3.select(
        svgRef.current
      );

    const resultadosPorUF =
      new Map<
        string,
        ResultadoEstado
      >();

    resultados.forEach(
      (resultado) => {
        resultadosPorUF.set(
          resultado.uf,
          resultado
        );
      }
    );

    svg
      .selectAll<
        SVGPathElement,
        EstadoGeoJSON
      >(
        ".camada-estados .estado"
      )
      .interrupt()
      .transition()
      .duration(600)
      .attr(
        "fill",
        (estado) => {
          const uf =
            estado.properties
              .SIGLA_UF;

          return obterCorEstado(
            resultadosPorUF.get(
              uf
            )
          );
        }
      );
  }, [
    resultados,
    geojson,
  ]);

  // ====================================================
  // DESTACAR ESTADO SELECIONADO
  // ====================================================

  useEffect(() => {
    estadoSelecionadoRef.current =
      estadoSelecionado;

    if (!svgRef.current) {
      return;
    }

    const svg =
      d3.select(
        svgRef.current
      );

    svg
      .selectAll<
        SVGPathElement,
        EstadoGeoJSON
      >(
        ".camada-estados .estado"
      )
      .attr(
        "stroke",
        (estado) =>
          estado.properties
            .SIGLA_UF ===
          estadoSelecionado
            ? "#0f172a"
            : "#ffffff"
      )
      .attr(
        "stroke-width",
        (estado) =>
          estado.properties
            .SIGLA_UF ===
          estadoSelecionado
            ? 3
            : 1.5
      );
  }, [
    estadoSelecionado,
  ]);

  // ====================================================
  // ERRO DO MAPA
  // ====================================================

  if (erroMapa) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {erroMapa}
      </div>
    );
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div>
      {/* CABEÇALHO INTERNO */}

      <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Mapa eleitoral
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Clique em um estado para consultar os resultados.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
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
              d="M15 15l5 5m-2.5-8.5A6.5 6.5 0 1 1 4.5 11.5a6.5 6.5 0 0 1 13 0Z"
            />
          </svg>

          Mapa interativo
        </div>
      </div>

      {/* MAPA + PAINEL */}

      <div className="grid items-start gap-7 lg:grid-cols-[1.45fr_0.85fr]">
        {/* MAPA */}

        <div
          ref={containerMapaRef}
          className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-4 sm:px-5"
        >
          {/* LOADING */}

          {!geojson && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-700" />

                <p className="mt-3 text-sm text-slate-500">
                  Carregando mapa...
                </p>
              </div>
            </div>
          )}

          {/* SVG */}

          <svg
            ref={svgRef}
            className="mx-auto h-auto w-full max-w-[720px]"
            aria-label="Mapa eleitoral do Brasil"
          />

          {/* TOOLTIP */}

          {tooltip && (
            <div
              className="pointer-events-none absolute z-20 min-w-40 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg"
              style={{
                left: tooltip.x,
                top: tooltip.y,
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400">
                    {tooltip.uf}
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-slate-800">
                    {tooltip.nome}
                  </p>
                </div>

                {resultadoTooltip &&
                  resultadoTooltip.totalizado >
                    0 && (
                    <span className="text-xs font-semibold text-slate-500">
                      {formatarPercentual(
                        resultadoTooltip.totalizado
                      )}
                    </span>
                  )}
              </div>

              {resultadoTooltip &&
              resultadoTooltip.votosValidos >
                0 &&
              liderTooltip ? (
                <div className="mt-2 border-t border-slate-100 pt-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Liderança
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-slate-700">
                    {liderTooltip.nomeUrna ??
                      liderTooltip.nome}
                  </p>
                </div>
              ) : (
                <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-400">
                  Aguardando totalização
                </p>
              )}
            </div>
          )}

          {/* LEGENDA */}

          <LegendaMapa />
        </div>

        {/* PAINEL DO ESTADO */}

        <PainelEstado
          resultado={
            resultadoSelecionado
          }
          carregando={
            carregando
          }
        />
      </div>
    </div>
  );
}