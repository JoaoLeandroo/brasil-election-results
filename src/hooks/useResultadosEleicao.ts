"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  gerarResultadosSimulados,
} from "@/data/simulacao";

import type {
  ResultadoEstado,
} from "@/types/eleicao";


// ======================================================
// TIPOS
// ======================================================

export type ModoDados =
  | "oficial"
  | "simulacao";


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
// CONFIGURAÇÕES
// ======================================================

const INTERVALO_ATUALIZACAO =
  10_000;

const INTERVALO_SIMULACAO =
  3_000;


export const ETAPAS_SIMULACAO = [
  5,
  18,
  37,
  59,
  76,
  91,
  100,
];


// ======================================================
// HOOK
// ======================================================

export default function useResultadosEleicao() {

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
  // SIMULAÇÃO
  // ====================================================

  const [
    progressoSimulacao,
    setProgressoSimulacao,
  ] =
    useState(
      ETAPAS_SIMULACAO[0]
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
    useState<string[]>([]);

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
  // RESULTADOS SIMULADOS
  // ====================================================

  const resultadosSimulados =
    useMemo(() => {
      return gerarResultadosSimulados(
        progressoSimulacao
      );
    }, [
      progressoSimulacao,
    ]);


  // ====================================================
  // RESULTADOS ATUALMENTE EXIBIDOS
  // ====================================================

  const resultadosExibidos =
    useMemo(() => {
      if (
        modoDados ===
        "simulacao"
      ) {
        return resultadosSimulados;
      }

      return resultadosOficiais;
    }, [
      modoDados,
      resultadosSimulados,
      resultadosOficiais,
    ]);


  // ====================================================
  // CONSULTA OFICIAL
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
          setAtualizando(true);
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

          setCarregando(false);
        }

        setAtualizando(false);
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
  // SIMULAÇÃO AUTOMÁTICA
  // ====================================================

  useEffect(() => {
    if (
      modoDados !==
      "simulacao"
    ) {
      return;
    }


    const indiceAtual =
      ETAPAS_SIMULACAO.indexOf(
        progressoSimulacao
      );


    if (
      indiceAtual === -1 ||
      indiceAtual >=
        ETAPAS_SIMULACAO.length -
          1
    ) {
      return;
    }


    const temporizador =
      window.setTimeout(
        () => {
          setProgressoSimulacao(
            ETAPAS_SIMULACAO[
              indiceAtual + 1
            ]
          );
        },
        INTERVALO_SIMULACAO
      );


    return () => {
      window.clearTimeout(
        temporizador
      );
    };
  }, [
    modoDados,
    progressoSimulacao,
  ]);


  // ====================================================
  // ATIVAR SIMULAÇÃO
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
  // ATIVAR OFICIAL
  // ====================================================

  function ativarOficial() {
    setModoDados(
      "oficial"
    );
  }


  // ====================================================
  // RETORNO
  // ====================================================

  return {
    modoDados,

    ativarOficial,
    ativarSimulacao,

    resultadosOficiais,
    resultadosSimulados,
    resultadosExibidos,

    progressoSimulacao,

    carregando,
    atualizando,

    erroInicial,
    erroAtualizacao,

    dadosParciais,
    estadosComErro,

    totalEstados,
    totalEsperado,

    ultimaAtualizacao,
  };
}