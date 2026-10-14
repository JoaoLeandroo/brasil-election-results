"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as d3 from "d3";

import {
  gerarResultadosSimulados,
} from "@/data/simulacao";

import type {
  ResultadoEstado,
} from "@/types/eleicao";


// ======================================================
// TIPOS
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

interface RespostaEstados {
  turno: number;
  totalEstados: number;
  totalEsperado: number;
  parcial: boolean;
  totalErros: number;
  estadosComErro: string[];
  estados: ResultadoEstado[];
}

type ModoDados =
  | "oficial"
  | "simulacao";


// ======================================================
// CONFIGURAÇÕES
// ======================================================

const INTERVALO_ATUALIZACAO =
  10_000;

const INTERVALO_SIMULACAO =
  3_000;


// ======================================================
// ETAPAS DA SIMULAÇÃO
// ======================================================

const ETAPAS_SIMULACAO = [
  5,
  18,
  37,
  59,
  76,
  91,
  100,
];


// ======================================================
// CORES
// ======================================================

const COR_NEUTRA =
  "#e5e7eb";

const CORES_CANDIDATOS:
  Record<string, string> = {
    "13": "#ef4444",
    "22": "#3b82f6",
  };


// ======================================================
// COR DO ESTADO
// ======================================================

function obterCorEstado(
  resultado:
    | ResultadoEstado
    | undefined
): string {

  if (!resultado) {
    return COR_NEUTRA;
  }

  if (
    resultado.totalizado === 0
  ) {
    return COR_NEUTRA;
  }

  const candidatos =
    [...resultado.candidatos]
      .sort(
        (a, b) =>
          b.votos - a.votos
      );

  if (
    candidatos.length < 2
  ) {
    return COR_NEUTRA;
  }

  if (
    candidatos[0].votos ===
    candidatos[1].votos
  ) {
    return COR_NEUTRA;
  }

  return (
    CORES_CANDIDATOS[
      candidatos[0].numero
    ] ?? COR_NEUTRA
  );
}


// ======================================================
// COMPONENTE
// ======================================================

export default function MapaBrasil() {

  // ====================================================
  // REFERÊNCIA DO SVG
  // ====================================================

  const svgRef =
    useRef<SVGSVGElement | null>(
      null
    );


  // ====================================================
  // UF SELECIONADA PARA EVENTOS DO D3
  // ====================================================

  const estadoSelecionadoRef =
    useRef<string | null>(
      null
    );


  // ====================================================
  // GEOJSON
  // ====================================================

  const [
    geojson,
    setGeojson,
  ] =
    useState<BrasilGeoJSON | null>(
      null
    );


  // ====================================================
  // RESULTADOS OFICIAIS
  // ====================================================

  const [
    resultadosOficiais,
    setResultadosOficiais,
  ] =
    useState<ResultadoEstado[]>(
      []
    );


  // ====================================================
  // MODO
  // ====================================================

  const [
    modoDados,
    setModoDados,
  ] =
    useState<ModoDados>(
      "oficial"
    );


  // ====================================================
  // PROGRESSO DA SIMULAÇÃO
  // ====================================================

  const [
    progressoSimulacao,
    setProgressoSimulacao,
  ] =
    useState(5);


  // ====================================================
  // ESTADO SELECIONADO
  // ====================================================

  const [
    estadoSelecionado,
    setEstadoSelecionado,
  ] =
    useState<string | null>(
      null
    );


  // ====================================================
  // STATUS
  // ====================================================

  const [
    carregando,
    setCarregando,
  ] =
    useState(true);

  const [
    atualizando,
    setAtualizando,
  ] =
    useState(false);

  const [
    erroInicial,
    setErroInicial,
  ] =
    useState<string | null>(
      null
    );

  const [
    erroAtualizacao,
    setErroAtualizacao,
  ] =
    useState(false);

  const [
    dadosParciais,
    setDadosParciais,
  ] =
    useState(false);

  const [
    estadosComErro,
    setEstadosComErro,
  ] =
    useState<string[]>(
      []
    );

  const [
    totalEstados,
    setTotalEstados,
  ] =
    useState(0);

  const [
    totalEsperado,
    setTotalEsperado,
  ] =
    useState(27);

  const [
    ultimaAtualizacao,
    setUltimaAtualizacao,
  ] =
    useState<Date | null>(
      null
    );


  // ====================================================
  // RESULTADOS EXIBIDOS
  // ====================================================
  //
  // OFICIAL:
  // dados recebidos da nossa API/TSE.
  //
  // SIMULAÇÃO:
  // dados gerados conforme o percentual da apuração.
  // ====================================================

  const resultadosExibidos =
    useMemo(() => {

      if (
        modoDados ===
        "simulacao"
      ) {

        return gerarResultadosSimulados(
          progressoSimulacao
        );
      }

      return resultadosOficiais;

    }, [
      modoDados,
      resultadosOficiais,
      progressoSimulacao,
    ]);


  // ====================================================
  // APURAÇÃO AUTOMÁTICA DA SIMULAÇÃO
  // ====================================================

  useEffect(() => {

    if (
      modoDados !==
      "simulacao"
    ) {
      return;
    }


    let indice =
      0;


    const intervalo =
      window.setInterval(
        () => {

          indice += 1;


          if (
            indice >=
            ETAPAS_SIMULACAO.length
          ) {

            window.clearInterval(
              intervalo
            );

            return;
          }


          setProgressoSimulacao(
            ETAPAS_SIMULACAO[
              indice
            ]
          );

        },
        INTERVALO_SIMULACAO
      );


    return () => {

      window.clearInterval(
        intervalo
      );

    };

  }, [
    modoDados,
  ]);


  // ====================================================
  // ENTRAR NO MODO SIMULAÇÃO
  // ====================================================
  //
  // Reiniciamos a apuração em 5%.
  // ====================================================

  function ativarSimulacao() {

    setProgressoSimulacao(
      ETAPAS_SIMULACAO[0]
    );

    setModoDados(
      "simulacao"
    );
  }


  // ====================================================
  // VOLTAR AO OFICIAL
  // ====================================================

  function ativarOficial() {

    setModoDados(
      "oficial"
    );
  }


  // ====================================================
  // CARREGAR GEOJSON
  // ====================================================

  useEffect(() => {

    let componenteAtivo =
      true;


    async function carregarMapa() {

      try {

        const resposta =
          await fetch(
            "/geo/brasil-ufs-web.geojson"
          );


        if (!resposta.ok) {

          throw new Error(
            `Erro ao carregar GeoJSON: HTTP ${resposta.status}`
          );

        }


        const dados:
          BrasilGeoJSON =
            await resposta.json();


        if (!componenteAtivo) {
          return;
        }


        setGeojson(
          dados
        );


      } catch (error) {

        console.error(
          "Erro ao carregar mapa:",
          error
        );


        if (!componenteAtivo) {
          return;
        }


        setErroInicial(
          "Não foi possível carregar o mapa."
        );


        setCarregando(
          false
        );

      }

    }


    void carregarMapa();


    return () => {

      componenteAtivo =
        false;

    };

  }, []);


  // ====================================================
  // CONSULTAR RESULTADOS OFICIAIS
  // ====================================================

  useEffect(() => {

    let componenteAtivo =
      true;

    let primeiraConsulta =
      true;

    let consultaEmAndamento =
      false;


    async function consultarResultados() {

      if (
        consultaEmAndamento
      ) {
        return;
      }


      consultaEmAndamento =
        true;


      try {

        if (
          !primeiraConsulta &&
          componenteAtivo
        ) {

          setAtualizando(
            true
          );

        }


        const resposta =
          await fetch(
            "/api/resultados/estados",
            {
              cache: "no-store",
            }
          );


        if (!resposta.ok) {

          throw new Error(
            `API retornou HTTP ${resposta.status}`
          );

        }


        const dados:
          RespostaEstados =
            await resposta.json();


        if (!componenteAtivo) {
          return;
        }


        setResultadosOficiais(
          dados.estados
        );


        setDadosParciais(
          dados.parcial
        );


        setEstadosComErro(
          dados.estadosComErro
        );


        setTotalEstados(
          dados.totalEstados
        );


        setTotalEsperado(
          dados.totalEsperado
        );


        setUltimaAtualizacao(
          new Date()
        );


        setErroAtualizacao(
          false
        );


        setErroInicial(
          null
        );


      } catch (error) {

        console.error(
          "Erro ao consultar resultados:",
          error
        );


        if (!componenteAtivo) {
          return;
        }


        if (
          primeiraConsulta
        ) {

          setErroInicial(
            "Não foi possível carregar os resultados eleitorais."
          );

        } else {

          setErroAtualizacao(
            true
          );

        }


      } finally {

        consultaEmAndamento =
          false;


        if (!componenteAtivo) {
          return;
        }


        if (
          primeiraConsulta
        ) {

          primeiraConsulta =
            false;


          setCarregando(
            false
          );

        }


        setAtualizando(
          false
        );

      }

    }


    void consultarResultados();


    const intervalo =
      window.setInterval(
        () => {

          void consultarResultados();

        },
        INTERVALO_ATUALIZACAO
      );


    return () => {

      componenteAtivo =
        false;


      window.clearInterval(
        intervalo
      );

    };

  }, []);


  // ====================================================
  // RESULTADO DA UF SELECIONADA
  // ====================================================

  const resultadoSelecionado =
    useMemo(() => {

      if (
        !estadoSelecionado
      ) {
        return null;
      }


      return (
        resultadosExibidos.find(
          (estado) =>
            estado.uf ===
            estadoSelecionado
        ) ?? null
      );

    }, [
      estadoSelecionado,
      resultadosExibidos,
    ]);


  // ====================================================
  // DESENHAR GEOMETRIA DO BRASIL
  // ====================================================
  //
  // O mapa é desenhado somente quando o GeoJSON muda.
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


    const largura =
      800;

    const altura =
      760;


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
            [
              25,
              25,
            ],
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


    // ==================================================
    // CAMADA DOS ESTADOS
    // ==================================================

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
          estado
            .properties
            .SIGLA_UF
      )

      .attr(
        "d",
        path
      )

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


      // ================================================
      // HOVER
      // ================================================

      .on(
        "mouseenter",
        function () {

          d3
            .select(this)

            .attr(
              "opacity",
              0.75
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


      // ================================================
      // CLIQUE
      // ================================================

      .on(
        "click",
        function (
          _event,
          estado
        ) {

          setEstadoSelecionado(
            estado
              .properties
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


          return (
            `translate(` +
            `${centro[0]},` +
            `${centro[1]}` +
            `)`
          );

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
          estado
            .properties
            .SIGLA_UF
      );


  }, [
    geojson,
  ]);


  // ====================================================
  // ATUALIZAR CORES
  // ====================================================

  useEffect(() => {

    if (!svgRef.current) {
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


    resultadosExibidos.forEach(
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

      .transition()

      .duration(
        500
      )

      .attr(
        "fill",
        (estado) => {

          const uf =
            estado
              .properties
              .SIGLA_UF;


          const resultado =
            resultadosPorUF.get(
              uf
            );


          return obterCorEstado(
            resultado
          );

        }
      );


  }, [
    resultadosExibidos,
  ]);


  // ====================================================
  // ATUALIZAR UF SELECIONADA
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
          estado
            .properties
            .SIGLA_UF ===
          estadoSelecionado
            ? "#111827"
            : "#ffffff"
      )

      .attr(
        "stroke-width",
        (estado) =>
          estado
            .properties
            .SIGLA_UF ===
          estadoSelecionado
            ? 3
            : 1.4
      );


  }, [
    estadoSelecionado,
  ]);


  // ====================================================
  // ERRO INICIAL
  // ====================================================

  if (
    erroInicial &&
    modoDados ===
      "oficial"
  ) {

    return (

      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">

        {erroInicial}

      </div>

    );

  }


  // ====================================================
  // INTERFACE
  // ====================================================

  return (

    <section className="w-full">


      {/* ==================================================
          SELETOR OFICIAL / SIMULAÇÃO
      ================================================== */}

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-sm font-semibold text-gray-900">

            Dados exibidos

          </p>

          <p className="mt-1 text-xs text-gray-500">

            Alterne entre os dados oficiais e o ambiente de teste.

          </p>

        </div>


        <div className="inline-flex w-fit rounded-xl border border-gray-200 bg-white p-1 shadow-sm">


          {/* OFICIAL */}

          <button
            type="button"
            onClick={
              ativarOficial
            }
            className={
              modoDados ===
              "oficial"
                ? "rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
            }
          >

            Oficial

          </button>


          {/* SIMULAÇÃO */}

          <button
            type="button"
            onClick={
              ativarSimulacao
            }
            className={
              modoDados ===
              "simulacao"
                ? "rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
            }
          >

            Simulação

          </button>

        </div>

      </div>


      {/* ==================================================
          AVISO DA SIMULAÇÃO
      ================================================== */}

      {modoDados ===
        "simulacao" && (

        <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-4">

          <div className="flex gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">

              !

            </div>

            <div>

              <p className="font-bold text-amber-900">

                MODO DE SIMULAÇÃO

              </p>

              <p className="mt-1 text-sm text-amber-800">

                Os números exibidos são fictícios e servem exclusivamente para testar o funcionamento do monitor. Não representam pesquisa, projeção ou resultado eleitoral oficial.

              </p>

            </div>

          </div>

        </div>

      )}


      {/* ==================================================
          CABEÇALHO
      ================================================== */}

      <div className="mb-6">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">


          <div>

            <h2 className="text-xl font-bold text-gray-900">

              Resultado por estado

            </h2>

            <p className="mt-1 text-sm text-gray-500">

              Clique em uma unidade da Federação para visualizar os resultados.

            </p>

          </div>


          {/* ==============================================
              STATUS OFICIAL
          ============================================== */}

          {modoDados ===
            "oficial" && (

            <div className="text-sm">


              {carregando && (

                <div className="flex items-center gap-2 text-gray-500">

                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gray-400" />

                  <span>

                    Carregando resultados...

                  </span>

                </div>

              )}


              {!carregando &&
                atualizando && (

                <div className="flex items-center gap-2 text-blue-600">

                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />

                  <span>

                    Atualizando resultados...

                  </span>

                </div>

              )}


              {!carregando &&
                !atualizando &&
                !erroAtualizacao &&
                !dadosParciais &&
                ultimaAtualizacao && (

                  <div className="flex items-center gap-2 text-emerald-600">

                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />

                    <span>

                      Atualizado às{" "}

                      {ultimaAtualizacao.toLocaleTimeString(
                        "pt-BR",
                        {
                          hour:
                            "2-digit",
                          minute:
                            "2-digit",
                          second:
                            "2-digit",
                        }
                      )}

                    </span>

                  </div>

                )}


              {!carregando &&
                !atualizando &&
                dadosParciais && (

                  <div className="text-amber-600">

                    ⚠ Dados parciais:{" "}

                    {totalEstados}/
                    {totalEsperado} UFs

                  </div>

                )}


              {!carregando &&
                !atualizando &&
                erroAtualizacao && (

                  <div className="max-w-xs text-amber-600">

                    ⚠ Não foi possível atualizar. Exibindo os últimos dados disponíveis.

                  </div>

                )}

            </div>

          )}


          {/* ==============================================
              STATUS DA SIMULAÇÃO
          ============================================== */}

          {modoDados ===
            "simulacao" && (

            <div className="text-right">

              <div className="flex items-center justify-end gap-2 text-sm font-medium text-amber-700">

                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />

                <span>

                  {progressoSimulacao <
                  100
                    ? "Simulação em andamento"
                    : "Simulação concluída"}

                </span>

              </div>


              <p className="mt-1 text-xs text-gray-500">

                {progressoSimulacao.toFixed(
                  0
                )}
                % totalizado

              </p>

            </div>

          )}

        </div>


        {/* ==============================================
            ERROS PARCIAIS
        ============================================== */}

        {modoDados ===
          "oficial" &&
          dadosParciais &&
          estadosComErro.length > 0 && (

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">

              Temporariamente indisponível:{" "}

              <strong>

                {estadosComErro.join(
                  ", "
                )}

              </strong>

            </div>

          )}

      </div>


      {/* ==================================================
          MAPA + PAINEL
      ================================================== */}

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">


        {/* ==============================================
            MAPA
        ============================================== */}

        <div>

          <svg
            ref={svgRef}
            className="h-auto w-full"
            aria-label="Mapa eleitoral do Brasil"
          />


          {/* ============================================
              LEGENDA
          ============================================ */}

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

        </div>


        {/* ==============================================
            PAINEL ESTADUAL
        ============================================== */}

        <div>


          {/* CARREGANDO */}

          {carregando &&
            modoDados ===
              "oficial" && (

              <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">

                <div>

                  <p className="font-semibold text-gray-700">

                    Carregando resultados

                  </p>

                  <p className="mt-2 text-sm text-gray-500">

                    Aguarde enquanto os dados eleitorais são consultados.

                  </p>

                </div>

              </div>

            )}


          {/* NENHUM ESTADO SELECIONADO */}

          {(!carregando ||
            modoDados ===
              "simulacao") &&
            !resultadoSelecionado && (

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


          {/* ============================================
              ESTADO SELECIONADO
          ============================================ */}

          {resultadoSelecionado && (

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">


              {/* ========================================
                  NOME DO ESTADO
              ======================================== */}

              <div className="border-b border-gray-100 pb-5">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-sm font-medium text-gray-500">

                      {resultadoSelecionado.uf}

                    </p>

                    <h3 className="mt-1 text-2xl font-bold text-gray-900">

                      {resultadoSelecionado.nome}

                    </h3>

                  </div>


                  {modoDados ===
                    "simulacao" && (

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">

                      SIMULAÇÃO

                    </span>

                  )}

                </div>

              </div>


              {/* ========================================
                  TOTALIZAÇÃO
              ======================================== */}

              <div className="py-5">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-gray-500">

                    Seções totalizadas

                  </span>

                  <strong className="text-gray-900">

                    {resultadoSelecionado.totalizado
                      .toFixed(2)
                      .replace(
                        ".",
                        ","
                      )}
                    %

                  </strong>

                </div>


                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">

                  <div
                    className="h-full rounded-full bg-gray-800 transition-all duration-700"
                    style={{
                      width:
                        `${resultadoSelecionado.totalizado}%`,
                    }}
                  />

                </div>

              </div>


              {/* ========================================
                  CANDIDATOS
              ======================================== */}

              <div className="space-y-4">

                {resultadoSelecionado.candidatos.map(
                  (candidato) => (

                    <div
                      key={
                        candidato.numero
                      }
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >

                      <div className="flex items-start justify-between gap-4">


                        <div className="flex items-start gap-3">

                          <span
                            className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                CORES_CANDIDATOS[
                                  candidato.numero
                                ] ??
                                COR_NEUTRA,
                            }}
                          />


                          <div>

                            <p className="text-xs font-semibold text-gray-400">

                              {candidato.numero}

                            </p>

                            <p className="mt-1 font-semibold text-gray-900">

                              {candidato.nomeUrna ??
                                candidato.nome}

                            </p>

                          </div>

                        </div>


                        <p className="text-xl font-bold text-gray-900">

                          {candidato.percentual
                            .toFixed(2)
                            .replace(
                              ".",
                              ","
                            )}
                          %

                        </p>

                      </div>


                      <p className="mt-2 pl-6 text-sm text-gray-500">

                        {candidato.votos.toLocaleString(
                          "pt-BR"
                        )}{" "}
                        votos

                      </p>

                    </div>

                  )
                )}

              </div>


              {/* ========================================
                  COMPARECIMENTO
              ======================================== */}

              <div className="mt-6 border-t border-gray-100 pt-5">

                <div className="grid grid-cols-2 gap-4 text-sm">


                  <div>

                    <p className="text-gray-400">

                      Comparecimento

                    </p>

                    <p className="mt-1 font-semibold text-gray-700">

                      {resultadoSelecionado.comparecimento.toLocaleString(
                        "pt-BR"
                      )}

                    </p>

                  </div>


                  <div>

                    <p className="text-gray-400">

                      Abstenções

                    </p>

                    <p className="mt-1 font-semibold text-gray-700">

                      {resultadoSelecionado.abstencoes.toLocaleString(
                        "pt-BR"
                      )}

                    </p>

                  </div>

                </div>

              </div>


              {/* ========================================
                  FONTE
              ======================================== */}

              {modoDados ===
                "simulacao" ? (

                <p className="mt-5 text-xs font-medium text-amber-600">

                  Dados fictícios para teste da interface.

                </p>

              ) : (

                resultadoSelecionado.atualizadoEm && (

                  <p className="mt-5 text-xs text-gray-400">

                    Dados do TSE atualizados em{" "}

                    {resultadoSelecionado.atualizadoEm}

                  </p>

                )

              )}

            </div>

          )}

        </div>

      </div>

    </section>

  );
}