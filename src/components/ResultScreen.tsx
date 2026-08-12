/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Share2,
  Trophy,
  Sparkles,
  ChevronRight,
  Verified,
  Flame,
  Compass,
  AlertCircle,
  MessageCircle,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Layers,
  ArrowRight,
} from "lucide-react";
import { GenesisDiagnosticResult } from "../types";
import RadarChart from "./RadarChart";
import { WHATSAPP_GROUPS, getDay1Content } from "../data/genesisQuizData";

interface ResultScreenProps {
  result: GenesisDiagnosticResult;
  isPro: boolean;
  onUpgradeClick: () => void;
  onExploreLessons: () => void;
}

export default function ResultScreen({
  result,
  isPro,
  onUpgradeClick,
  onExploreLessons,
}: ResultScreenProps) {
  const [whatsappLink, setWhatsappLink] = useState(WHATSAPP_GROUPS.GROUP_3_DAYS);

  React.useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.whatsappLinks?.ignicao) {
          setWhatsappLink(data.whatsappLinks.ignicao);
        }
      })
      .catch((err) => console.error("Error loading config link:", err));
  }, []);
  const [shareTextCopied, setShareTextCopied] = useState(false);
  const [selectedProjection, setSelectedProjection] = useState<
    "hoje" | "dia3" | "dia7" | "dia21"
  >("hoje");

  // Day 1 Challenge preview based on weakest dimension
  const day1Info = getDay1Content(result.weakestDimensionKey);

  // Active dimension scores depending on selected projection tab
  const activeDimensionScores =
    result.projections[selectedProjection] || result.dimensionScores;

  // Format radar data for RadarChart component (expects { nome, percentual })
  const radarChartData = activeDimensionScores.map((d) => ({
    nome: d.nome,
    percentual: d.score / 100,
  }));

  const handleShare = () => {
    const shareText = `🚀 *Mapa Gênesis - Diagnóstico de Inércia*
Membro: ${result.firstName}
Índice Gênesis: ${result.indiceGenesis}/100
Estágio Atual: ${result.estagio}
💪 Ponto Forte: ${result.strongestDimensions.join(", ")}
🎯 Alvo de Tração: ${result.weakestDimensions.join(", ")}

Iniciei meu primeiro desafio dos 3 dias no Projeto Gênesis!`;

    navigator.clipboard.writeText(shareText);
    setShareTextCopied(true);
    setTimeout(() => {
      setShareTextCopied(false);
    }, 2500);
  };

  return (
    <div className="w-full flex flex-col space-y-6 pb-24 animate-fade-in font-sans">
      {/* 1. MAPA GÊNESIS HEADER */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex gap-2 items-center text-[#38BDF8] bg-[#1E3A8A]/30 border border-[#2563EB]/40 px-3.5 py-1.5 rounded-full mx-auto">
          <Verified className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-[9px] font-bold uppercase tracking-widest font-mono">
            Resultado Oficial Mapeado
          </span>
        </div>

        <h1 className="text-xl font-display font-black text-[#F0F0F0] tracking-tight">
          Olá, {result.firstName}! Este é o seu Mapa Gênesis.
        </h1>
        <p className="text-xs text-[#888888] max-w-sm mx-auto leading-relaxed">
          Decodificamos sua posição atual entre as 5 dimensões vitais de ação para guiar sua primeira vitória nos 3 primeiros dias.
        </p>
      </div>

      {/* 2. ÍNDICE GÊNESIS & ESTÁGIO BADGE */}
      <div className="bg-[#111B2E] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden text-center space-y-4 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 blur-2xl pointer-events-none" />

        <span className="text-[9px] font-mono text-[#888888] uppercase tracking-widest font-bold block">
          SEU ÍNDICE GÊNESIS ATUAL
        </span>

        {/* Big Score Gauge */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-5xl font-display font-black text-white tracking-tight">
            {result.indiceGenesis}
          </span>
          <span className="text-lg font-mono font-bold text-[#38BDF8]">
            / 100
          </span>
        </div>

        {/* Estágio Badge */}
        <div className="inline-block px-4 py-1.5 rounded-full border text-xs font-mono font-extrabold uppercase tracking-wider shadow-md" style={{ borderColor: result.estagioCor, color: result.estagioCor, backgroundColor: `${result.estagioCor}15` }}>
          Estágio Atual: {result.estagio}
        </div>

        {/* Estágio Description */}
        <p className="text-xs text-[#888888] leading-relaxed max-w-md mx-auto pt-1">
          {result.estagioDescricao}
        </p>

        {/* Photograph of current moment quote */}
        <div className="border-t border-[#1E293B] pt-3 text-[10px] text-zinc-400 font-mono italic">
          "Esta é uma fotografia do seu momento atual — não uma definição de quem você é."
        </div>
      </div>

      {/* 3. RADAR CHART & PROJECTIONS TOGGLE */}
      <div className="bg-[#111B2E] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#1E293B] pb-3">
          <div>
            <span className="text-[8px] font-mono text-[#38BDF8] uppercase font-bold tracking-widest block">
              MAPA DE TRAÇÃO E FOCO
            </span>
            <h3 className="text-xs font-display font-bold text-[#F0F0F0]">
              Projeção de Evolução do Seu Perfil
            </h3>
          </div>

          {/* Projection Tabs */}
          <div className="flex items-center gap-1 bg-[#0B1220] p-1 rounded-xl border border-[#1E293B] w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0">
            {(
              [
                { key: "hoje", label: "Hoje" },
                { key: "dia3", label: "+3 Dias" },
                { key: "dia7", label: "+7 Dias" },
                { key: "dia21", label: "+21 Dias" },
              ] as const
            ).map((tab) => {
              const isActive = selectedProjection === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedProjection(tab.key)}
                  className={`flex-1 shrink-0 px-2 py-1 text-[9px] font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                      : "text-[#888888] hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Radar Chart Component */}
        <RadarChart dimensoes={radarChartData} />

        {/* Projection Disclaimer */}
        <p className="text-[9px] font-mono text-zinc-500 text-center italic">
          * Projeção baseada no padrão de quem completa a jornada — não é uma garantia individual de resultado.
        </p>

        {/* Dimension Score List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {activeDimensionScores.map((d) => (
            <div
              key={d.key}
              className="bg-[#0B1220] border border-[#1E293B] p-3 rounded-xl flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-200 block">
                  {d.nome}
                </span>
                <span className="text-[8px] font-mono text-zinc-500 uppercase">
                  {d.key === result.weakestDimensionKey ? "★ Alvo de Tração" : "Dimensão Mapeada"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-black text-[#38BDF8]">
                  {d.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. STRONGEST & WEAKEST DIMENSIONS HIGHLIGHT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strongest */}
        <div className="bg-[#111B2E] border border-emerald-900/50 p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">
              Ponto Mais Forte
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">
            {result.strongestDimensions.join(", ")}
          </h4>
          <p className="text-[10px] text-[#888888] leading-relaxed">
            Esta é a sua principal alavanca. Utilize este ativo natural para impulsionar a correção dos seus pontos de travamento.
          </p>
        </div>

        {/* Weakest */}
        <div className="bg-[#111B2E] border border-amber-900/50 p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <div className="flex items-center gap-2 text-amber-400">
            <Target className="w-4 h-4" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">
              Gargalo Principal de Inércia
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">
            {result.weakestDimensions.join(", ")}
          </h4>
          <p className="text-[10px] text-[#888888] leading-relaxed">
            Aqui é onde sua energia vaza antes de virar resultado. Todos os seus desafios nos 3 primeiros dias serão focados em destravar esta dimensão.
          </p>
        </div>
      </div>

      {/* 5. RECOMMENDATIONS FOR WEAKEST DIMENSION */}
      <div className="bg-[#111B2E] border border-[#1E293B] p-5.5 rounded-2xl space-y-3.5">
        <div className="flex items-center gap-2 text-[#38BDF8]">
          <Zap className="w-4 h-4" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest">
            {result.recommendations.titulo}
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {result.recommendations.passos.map((passo, idx) => (
            <div
              key={idx}
              className="bg-[#0B1220] border border-[#1E293B] p-3.5 rounded-xl flex items-start gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 text-[#38BDF8] text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {passo}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. DAY 1 PERSONALIZED CHALLENGE TEASER CARD */}
      <div className="bg-gradient-to-br from-[#1E3A8A]/40 to-[#111B2E] border border-[#2563EB]/50 p-6 rounded-2xl space-y-4 relative overflow-hidden shadow-xl">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#2563EB]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-block bg-[#2563EB] text-white px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
            Desafio Dia 1 Personalizado
          </div>
          <span className="text-[9px] font-mono text-[#38BDF8] font-bold">
            {day1Info.dimensionTitle}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-display font-bold text-white">
            {day1Info.taskTitle}
          </h3>
          <p className="text-xs text-[#38BDF8] bg-[#0B1220]/80 border border-[#2563EB]/30 p-2.5 rounded-xl font-medium leading-relaxed">
            🎯 <strong>Objetivo:</strong> {day1Info.objetivo}
          </p>
        </div>

        {/* Step by step instructions */}
        <div className="space-y-2 pt-1">
          <span className="text-[9px] font-mono text-[#888888] font-bold uppercase tracking-widest block">
            Instruções Táticas:
          </span>
          {day1Info.instrucoesList.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
              <span className="w-5 h-5 rounded-full bg-[#2563EB]/30 border border-[#2563EB]/50 text-[#38BDF8] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        {/* Badges: XP, Time, Health Weights */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1E293B]">
          <div className="bg-[#0B1220] border border-[#1E293B] px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-amber-400 flex items-center gap-1">
            ⚡ +{day1Info.xp} XP
          </div>
          <div className="bg-[#0B1220] border border-[#1E293B] px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-cyan-400 flex items-center gap-1">
            ⏱️ {day1Info.tempoEstimado}
          </div>
          <div className="bg-[#0B1220] border border-[#1E293B] px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-purple-400">
            📊 {day1Info.healthAreaWeights}
          </div>
        </div>

        <div className="bg-[#0B1220]/90 border border-[#1E293B] p-3.5 rounded-xl text-xs text-[#38BDF8] font-mono">
          💡 <strong>Ação Imediata:</strong> {day1Info.actionStep}
        </div>

        <button
          onClick={onExploreLessons}
          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.35)]"
        >
          <span>Iniciar Desafio do Dia 1</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 7. WHATSAPP GROUP 1 (3 DAYS) INVITE CARD */}
      <div className="bg-[#111B2E] border border-emerald-900/60 p-5 rounded-2xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">
              Comunidade de Acompanhamento
            </span>
            <h4 className="text-xs font-bold text-white">
              Grupo Oficial dos 3 Primeiros Dias
            </h4>
          </div>
        </div>

        <p className="text-[11px] text-[#888888] leading-relaxed">
          Entre na comunidade exclusiva do WhatsApp para validar o cumprimento do seu primeiro desafio, receber lembretes diários e interagir com outros membros do Projeto Gênesis.
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg block text-center"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Entrar no Grupo do WhatsApp (3 Dias)</span>
        </a>
      </div>

      {/* 8. ACTIONS: SHARE & GO TO CHALLENGES */}
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 bg-[#111B2E] hover:bg-[#1E293B] border border-[#1E293B] text-[#F0F0F0] font-bold text-[10px] py-3.5 uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-[#38BDF8]" />
          <span>{shareTextCopied ? "Copiado!" : "Compartilhar Mapa"}</span>
        </button>

        <button
          onClick={onExploreLessons}
          className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[10px] py-3.5 uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)]"
        >
          <Trophy className="w-4 h-4 text-white" />
          <span>Ir para os Desafios</span>
        </button>
      </div>

      {/* 9. LEGAL MEDICAL DISCLAIMER */}
      <div className="border-t border-[#1E293B] pt-4 text-[9px] text-zinc-500 text-center leading-relaxed font-mono">
        Este diagnóstico é uma ferramenta educacional de autoavaliação e não substitui avaliação médica, psicológica ou terapêutica.
      </div>
    </div>
  );
}
