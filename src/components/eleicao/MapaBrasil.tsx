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


// ======================================================
// TIPOS DO GEOJSON
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


// ======================================================
// RESPOSTA DA API
// ======================================================

interface RespostaEstados {
  turno: number;
  totalEstados: number;
  totalEsperado: number;
  parcial: boolean;
  totalErros: number;
  estadosComErro: string[];
  estados: ResultadoEstado[];
}


// ======================================================
// CONFIGURAÇÃO
// ======================================================

const INTERVALO_ATUALIZACAO =
  10_000;


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
// DESCOBRIR COR ELEITORAL DA UF
// ======================================================

function obterCorEstado(
  resultado:
    | ResultadoEstado
    | undefined
): string {

  if (!resultado) {

    return COR_NEUTRA;

  }


  // Nenhuma apuração ainda.

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


  // Empate.

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
  // SVG
  // ====================================================

  const svgRef =
    useRef<SVGSVGElement | null>(
      null
    );


  // ====================================================
  // REF DA UF SELECIONADA
  // ====================================================
  //
  // O D3 utiliza este ref nos eventos de mouse.
  //
  // Assim não precisamos redesenhar o mapa quando
  // estadoSelecionado mudar.
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
  // RESULTADOS
  // ====================================================

  const [
    resultados,
    setResultados,
  ] =
    useState<ResultadoEstado[]>(
      []
    );


  // ====================================================
  // UF SELECIONADA
  // ====================================================

  const [
    estadoSelecionado,
    setEstadoSelecionado,
  ] =
    useState<string | null>(
      null
    );


  // ====================================================
  // CARREGAMENTO INICIAL
  // ====================================================

  const [
    carregando,
    setCarregando,
  ] =
    useState(true);


  // ====================================================
  // STATUS DE ATUALIZAÇÃO
  // ====================================================

  const [
    atualizando,
    setAtualizando,
  ] =
    useState(false);


  // ====================================================
  // ERRO INICIAL
  // ====================================================

  const [
    erroInicial,
    setErroInicial,
  ] =
    useState<string | null>(
      null
    );


  // ====================================================
  // ERRO DE ATUALIZAÇÃO
  // ====================================================

  const [
    erroAtualizacao,
    setErroAtualizacao,
  ] =
    useState(false);


  // ====================================================
  // DADOS PARCIAIS
  // ====================================================

  const [
    dadosParciais,
    setDadosParciais,
  ] =
    useState(false);


  // ====================================================
  // UFs COM ERRO
  // ====================================================

  const [
    estadosComErro,
    setEstadosComErro,
  ] =
    useState<string[]>(
      []
    );


  // ====================================================
  // TOTAL DE ESTADOS RECEBIDOS
  // ====================================================

  const [
    totalEstados,
    setTotalEstados,
  ] =
    useState(0);


  // ====================================================
  // TOTAL ESPERADO
  // ====================================================

  const [
    totalEsperado,
    setTotalEsperado,
  ] =
    useState(27);


  // ====================================================
  // ÚLTIMA ATUALIZAÇÃO
  // ====================================================

  const [
    ultimaAtualizacao,
    setUltimaAtualizacao,
  ] =
    useState<Date | null>(
      null
    );


  // ====================================================
  // CARREGAR GEOJSON
  // ====================================================
  //
  // O GeoJSON é baixado apenas uma vez.
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
  // RESULTADOS + ATUALIZAÇÃO AUTOMÁTICA
  // ====================================================
  //
  // Consulta:
  //
  // - imediatamente ao abrir;
  // - novamente a cada 10 segundos.
  //
  // O GeoJSON NÃO é carregado novamente.
  // ====================================================

  useEffect(() => {

    let componenteAtivo =
      true;


    let primeiraConsulta =
      true;


    let consultaEmAndamento =
      false;


    async function consultarResultados() {

      // Impede duas consultas simultâneas.

      if (
        consultaEmAndamento
      ) {

        return;

      }


      consultaEmAndamento =
        true;


      try {

        // Nas consultas seguintes mostramos
        // "Atualizando resultados...".

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


        // ==============================================
        // RESULTADOS
        // ==============================================

        setResultados(
          dados.estados
        );


        // ==============================================
        // STATUS DA API
        // ==============================================

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


        // ==============================================
        // HORÁRIO DA CONSULTA
        // ==============================================

        setUltimaAtualizacao(
          new Date()
        );


        // ==============================================
        // LIMPAR ERROS ANTERIORES
        // ==============================================

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


        // Primeira consulta falhou.

        if (
          primeiraConsulta
        ) {

          setErroInicial(
            "Não foi possível carregar os resultados eleitorais."
          );

        }

        // Atualização posterior falhou.
        //
        // Os resultados anteriores permanecem.

        else {

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


    // ==================================================
    // PRIMEIRA CONSULTA
    // ==================================================

    void consultarResultados();


    // ==================================================
    // ATUALIZAÇÃO AUTOMÁTICA
    // ==================================================

    const intervalo =
      window.setInterval(
        () => {

          void consultarResultados();

        },
        INTERVALO_ATUALIZACAO
      );


    // ==================================================
    // LIMPEZA
    // ==================================================

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
        resultados.find(
          (estado) =>
            estado.uf ===
            estadoSelecionado
        ) ?? null
      );

    }, [
      estadoSelecionado,
      resultados,
    ]);


  // ====================================================
  // 1. DESENHAR GEOMETRIA DO MAPA
  // ====================================================
  //
  // Este effect depende SOMENTE do GeoJSON.
  //
  // Portanto:
  //
  // - atualização dos resultados não redesenha o Brasil;
  // - clicar em uma UF não redesenha o Brasil;
  // - a geometria é construída uma única vez.
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


    // ==================================================
    // DIMENSÕES
    // ==================================================

    const largura =
      800;


    const altura =
      760;


    const svg =
      d3.select(
        elementoSvg
      );


    // ==================================================
    // LIMPAR SVG
    // ==================================================
    //
    // Isso acontece somente quando o GeoJSON muda.
    // ==================================================

    svg
      .selectAll("*")
      .remove();


    // ==================================================
    // CONFIGURAÇÃO DO SVG
    // ==================================================

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


    // ==================================================
    // GERADOR DE CAMINHOS
    // ==================================================

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


    // ==================================================
    // DESENHAR UFs
    // ==================================================

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

      // Inicialmente todas ficam neutras.
      //
      // Outro effect aplicará as cores eleitorais.

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
      // MOUSE ENTER
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


      // ================================================
      // MOUSE LEAVE
      // ================================================

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
    // CAMADA DAS SIGLAS
    // ==================================================

    const grupoSiglas =
      svg
        .append("g")

        .attr(
          "class",
          "camada-siglas"
        );


    // ==================================================
    // SIGLAS DAS UFs
    // ==================================================

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
  // 2. ATUALIZAR SOMENTE AS CORES
  // ====================================================
  //
  // Quando chegam novos resultados:
  //
  // NÃO apagamos o SVG.
  // NÃO recriamos as geometrias.
  //
  // Apenas modificamos o atributo fill.
  // ====================================================

  useEffect(() => {

    if (!svgRef.current) {

      return;

    }


    const svg =
      d3.select(
        svgRef.current
      );


    // ==================================================
    // ÍNDICE DOS RESULTADOS
    // ==================================================
    //
    // Exemplo:
    //
    // PE -> resultado de Pernambuco
    // SP -> resultado de São Paulo
    // BA -> resultado da Bahia
    //
    // Isso é mais eficiente do que usar .find()
    // para cada geometria.
    // ==================================================

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


    // ==================================================
    // ALTERAR SOMENTE O FILL
    // ==================================================

    svg
      .selectAll<
        SVGPathElement,
        EstadoGeoJSON
      >(
        ".camada-estados .estado"
      )

      .transition()

      .duration(
        400
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
    resultados,
  ]);


  // ====================================================
  // 3. ATUALIZAR SOMENTE A UF SELECIONADA
  // ====================================================
  //
  // Quando você clica em PE, por exemplo:
  //
  // - não redesenhamos PE;
  // - não redesenhamos as outras 26 UFs;
  // - apenas alteramos as bordas.
  // ====================================================

  useEffect(() => {

    // Atualiza o valor utilizado
    // pelos eventos do D3.

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
    erroInicial
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
          CABEÇALHO
      ================================================== */}

      <div className="mb-6">


        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">


          {/* TEXTO */}

          <div>

            <h2 className="text-xl font-bold text-gray-900">

              Resultado por estado

            </h2>


            <p className="mt-1 text-sm text-gray-500">

              Clique em uma unidade da Federação para visualizar os resultados.

            </p>

          </div>


          {/* ==============================================
              STATUS
          ============================================== */}

          <div className="text-sm">


            {/* CARREGANDO */}

            {carregando && (

              <div className="flex items-center gap-2 text-gray-500">

                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gray-400" />

                <span>

                  Carregando resultados...

                </span>

              </div>

            )}


            {/* ATUALIZANDO */}

            {!carregando &&
              atualizando && (

                <div className="flex items-center gap-2 text-blue-600">

                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />


                  <span>

                    Atualizando resultados...

                  </span>

                </div>

              )}


            {/* ATUALIZADO */}

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


            {/* DADOS PARCIAIS */}

            {!carregando &&
              !atualizando &&
              dadosParciais && (

                <div className="text-amber-600">

                  ⚠ Dados parciais:{" "}

                  {totalEstados}/
                  {totalEsperado} UFs

                </div>

              )}


            {/* FALHA DE ATUALIZAÇÃO */}

            {!carregando &&
              !atualizando &&
              erroAtualizacao && (

                <div className="max-w-xs text-amber-600">

                  ⚠ Não foi possível atualizar. Exibindo os últimos dados disponíveis.

                </div>

              )}

          </div>

        </div>


        {/* ==============================================
            UFs COM ERRO
        ============================================== */}

        {dadosParciais &&
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


          {/* ============================================
              IMPORTANTE
          ============================================
              
              O SVG permanece montado mesmo enquanto
              os resultados estão carregando.
              
              Isso permite que o effect do D3 encontre
              svgRef.current e desenhe o mapa.
          ============================================ */}

          <svg
            ref={svgRef}
            className="h-auto w-full"
            aria-label="Mapa eleitoral do Brasil"
          />


          {/* ============================================
              LEGENDA
          ============================================ */}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm">


            {/* LULA */}

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


            {/* FLAVIO BOLSONARO */}

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


            {/* AGUARDANDO */}

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


          {/* ============================================
              CARREGANDO
          ============================================ */}

          {carregando && (

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


          {/* ============================================
              NENHUM ESTADO SELECIONADO
          ============================================ */}

          {!carregando &&
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

          {!carregando &&
            resultadoSelecionado && (

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">


                {/* ======================================
                    ESTADO
                ====================================== */}

                <div className="border-b border-gray-100 pb-5">

                  <p className="text-sm font-medium text-gray-500">

                    {resultadoSelecionado.uf}

                  </p>


                  <h3 className="mt-1 text-2xl font-bold text-gray-900">

                    {resultadoSelecionado.nome}

                  </h3>

                </div>


                {/* ======================================
                    TOTALIZAÇÃO
                ====================================== */}

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
                      className="h-full rounded-full bg-gray-800 transition-all duration-500"
                      style={{
                        width:
                          `${resultadoSelecionado.totalizado}%`,
                      }}
                    />

                  </div>

                </div>


                {/* ======================================
                    CANDIDATOS
                ====================================== */}

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


                          {/* CANDIDATO */}

                          <div>

                            <p className="text-xs font-semibold text-gray-400">

                              {candidato.numero}

                            </p>


                            <p className="mt-1 font-semibold text-gray-900">

                              {candidato.nomeUrna ??
                                candidato.nome}

                            </p>

                          </div>


                          {/* PERCENTUAL */}

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


                        {/* VOTOS */}

                        <p className="mt-2 text-sm text-gray-500">

                          {candidato.votos.toLocaleString(
                            "pt-BR"
                          )}{" "}
                          votos

                        </p>

                      </div>

                    )
                  )}

                </div>


                {/* ======================================
                    COMPARECIMENTO E ABSTENÇÕES
                ====================================== */}

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


                {/* ======================================
                    HORÁRIO DO TSE
                ====================================== */}

                {resultadoSelecionado.atualizadoEm && (

                  <p className="mt-5 text-xs text-gray-400">

                    Dados do TSE atualizados em{" "}

                    {resultadoSelecionado.atualizadoEm}

                  </p>

                )}

              </div>

            )}

        </div>

      </div>

    </section>

  );

}