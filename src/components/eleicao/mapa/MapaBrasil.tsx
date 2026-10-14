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
  // GEOJSON
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
  // DESENHAR GEOMETRIA
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
    const altura = 760;

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

    const projection =
      d3
        .geoMercator()
        .fitExtent(
          [
            [25, 25],
            [
              largura - 25,
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

    const grupoEstados =
      svg
        .append("g")
        .attr(
          "class",
          "camada-estados"
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
        1.4
      )
      .attr(
        "opacity",
        1
      )
      .style(
        "cursor",
        "pointer"
      )

      .on(
        "mouseenter",
        function () {
          d3
            .select(this)
            .attr(
              "opacity",
              0.78
            )
            .attr(
              "stroke",
              "#111827"
            )
            .attr(
              "stroke-width",
              2
            );
        }
      )

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
                ? "#111827"
                : "#ffffff"
            )
            .attr(
              "stroke-width",
              selecionado
                ? 3
                : 1.4
            );
        }
      )

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
    // SIGLAS
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
        "12px"
      )
      .attr(
        "font-weight",
        "600"
      )
      .attr(
        "fill",
        "#475569"
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
  // CORES
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
      .duration(500)
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
  // SELEÇÃO
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
            ? "#111827"
            : "#ffffff"
      )
      .attr(
        "stroke-width",
        (estado) =>
          estado.properties
            .SIGLA_UF ===
          estadoSelecionado
            ? 3
            : 1.4
      );
  }, [
    estadoSelecionado,
  ]);

  if (erroMapa) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        {erroMapa}
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Resultado por estado
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Clique em uma unidade da Federação para visualizar os resultados.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">

        {/* MAPA */}

        <div>
          <svg
            ref={svgRef}
            className="h-auto w-full"
            aria-label="Mapa eleitoral do Brasil"
          />

          <LegendaMapa />
        </div>

        {/* ESTADO */}

        <PainelEstado
          resultado={
            resultadoSelecionado
          }
          carregando={
            carregando
          }
        />

      </div>
    </section>
  );
}