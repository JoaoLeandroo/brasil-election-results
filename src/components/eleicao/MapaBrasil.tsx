"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import * as d3 from "d3";

interface EstadoGeoJSON {
  type: "Feature";

  properties: {
    sigla?: string;
    nome?: string;
    [key: string]: unknown;
  };

  geometry: GeoJSON.Geometry;
}

interface BrasilGeoJSON {
  type: "FeatureCollection";
  features: EstadoGeoJSON[];
}

export default function MapaBrasil() {

  const svgRef =
    useRef<SVGSVGElement | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState<string | null>(null);

  const [estadoSelecionado, setEstadoSelecionado] =
    useState<string | null>(null);


  useEffect(() => {

    async function carregarMapa() {

      try {

        const response =
          await fetch(
            "/geo/brasil-ufs.geojson"
          );


        if (!response.ok) {

          throw new Error(
            "Não foi possível carregar o GeoJSON."
          );

        }


        const geojson =
          (await response.json()) as BrasilGeoJSON;


        if (!svgRef.current) {
          return;
        }


        // =============================================
        // SVG
        // =============================================

        const largura = 800;
        const altura = 750;


        const svg =
          d3.select(svgRef.current);


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


        // =============================================
        // PROJEÇÃO
        // =============================================

        const projection =
          d3.geoMercator()
            .fitSize(
              [largura, altura],
              geojson as GeoJSON.FeatureCollection
            );


        const path =
          d3.geoPath()
            .projection(projection);


        // =============================================
        // ESTADOS
        // =============================================

        svg
          .selectAll("path")
          .data(geojson.features)
          .join("path")

          .attr(
            "d",
            (estado) =>
              path(
                estado as GeoJSON.Feature
              )
          )

          .attr(
            "fill",
            "#e5e7eb"
          )

          .attr(
            "stroke",
            "#ffffff"
          )

          .attr(
            "stroke-width",
            1.5
          )

          .style(
            "cursor",
            "pointer"
          )

          .on(
            "mouseenter",
            function () {

              d3.select(this)
                .attr(
                  "fill",
                  "#cbd5e1"
                );

            }
          )

          .on(
            "mouseleave",
            function (
              _event,
              estado
            ) {

              const sigla =
                estado.properties.sigla;

              d3.select(this)
                .attr(
                  "fill",
                  sigla === estadoSelecionado
                    ? "#94a3b8"
                    : "#e5e7eb"
                );

            }
          )

          .on(
            "click",
            function (
              _event,
              estado
            ) {

              const sigla =
                estado.properties.sigla;

              if (!sigla) {
                return;
              }

              setEstadoSelecionado(
                sigla
              );

            }
          );


        setCarregando(false);

      } catch (error) {

        console.error(
          "Erro ao carregar mapa:",
          error
        );

        setErro(
          "Não foi possível carregar o mapa do Brasil."
        );

        setCarregando(false);

      }

    }


    void carregarMapa();

  }, [estadoSelecionado]);


  return (

    <section className="w-full">

      <div className="mb-4">

        <h2 className="text-xl font-bold text-gray-900">
          Resultado por estado
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Selecione uma unidade da Federação.
        </p>

      </div>


      {erro && (

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {erro}
        </div>

      )}


      {carregando && (

        <div className="py-10 text-center text-gray-500">
          Carregando mapa...
        </div>

      )}


      <div className="mx-auto w-full max-w-3xl">

        <svg
          ref={svgRef}
          className="h-auto w-full"
          aria-label="Mapa do Brasil por estados"
        />

      </div>


      {estadoSelecionado && (

        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">

          <p className="text-sm text-gray-500">
            Estado selecionado
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {estadoSelecionado}
          </p>

        </div>

      )}

    </section>

  );

}