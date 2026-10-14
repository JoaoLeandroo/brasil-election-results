"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  ResultadoEstado,
} from "@/types/eleicao";

interface RespostaEstados {
  turno: number;
  totalEstados: number;
  totalEsperado: number;
  parcial: boolean;
  totalErros: number;
  estadosComErro: string[];
  estados: ResultadoEstado[];
}

const INTERVALO_ATUALIZACAO = 10_000;

export default function useResultadosEleicao() {
  const [
    resultados,
    setResultados,
  ] = useState<ResultadoEstado[]>([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    atualizando,
    setAtualizando,
  ] = useState(false);

  const [
    erroInicial,
    setErroInicial,
  ] = useState<string | null>(null);

  const [
    erroAtualizacao,
    setErroAtualizacao,
  ] = useState(false);

  const [
    dadosParciais,
    setDadosParciais,
  ] = useState(false);

  const [
    estadosComErro,
    setEstadosComErro,
  ] = useState<string[]>([]);

  const [
    totalEstados,
    setTotalEstados,
  ] = useState(0);

  const [
    totalEsperado,
    setTotalEsperado,
  ] = useState(27);

  const [
    ultimaAtualizacao,
    setUltimaAtualizacao,
  ] = useState<Date | null>(null);

  useEffect(() => {
    let componenteAtivo = true;
    let primeiraConsulta = true;
    let consultaEmAndamento = false;

    async function consultarResultados() {
      if (consultaEmAndamento) {
        return;
      }

      consultaEmAndamento = true;

      try {
        if (
          !primeiraConsulta &&
          componenteAtivo
        ) {
          setAtualizando(true);
        }

        const resposta = await fetch(
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

        const dados: RespostaEstados =
          await resposta.json();

        if (!componenteAtivo) {
          return;
        }

        setResultados(dados.estados);

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

        setErroInicial(null);
        setErroAtualizacao(false);
      } catch (error) {
        console.error(
          "Erro ao consultar resultados estaduais:",
          error
        );

        if (!componenteAtivo) {
          return;
        }

        if (primeiraConsulta) {
          setErroInicial(
            "Não foi possível carregar os resultados eleitorais."
          );
        } else {
          setErroAtualizacao(true);
        }
      } finally {
        consultaEmAndamento = false;

        if (!componenteAtivo) {
          return;
        }

        if (primeiraConsulta) {
          primeiraConsulta = false;
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
      componenteAtivo = false;

      window.clearInterval(
        intervalo
      );
    };
  }, []);

  return {
    resultados,

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