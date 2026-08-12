import React from "react";
import { User, Trophy, Flame, Sparkles, LogOut, Compass, ArrowRight, Target } from "lucide-react";
import { UserProgress } from "../types";
import RadarChart from "./RadarChart";

interface ProfileScreenProps {
  progress: UserProgress;
  onStartDiagnosis: () => void;
  onUpgradeClick: () => void;
  onTriggerAuth: () => void;
  onLogout: () => void;
  onViewResult?: () => void;
  onOpenAdmin?: () => void;
}

export default function ProfileScreen({
  progress,
  onStartDiagnosis,
  onUpgradeClick,
  onTriggerAuth,
  onLogout,
  onViewResult,
  onOpenAdmin
}: ProfileScreenProps) {
  
  const defaultRadarDimensoes = [
    { nome: "Clareza e Direção", percentual: 0.40 },
    { nome: "Identidade e Autoconfiança", percentual: 0.50 },
    { nome: "Energia e Sustentação", percentual: 0.45 },
    { nome: "Estrutura e Ambiente", percentual: 0.35 },
    { nome: "Ação e Consistência", percentual: 0.60 }
  ];

  const hasGenesisResult = !!progress.genesisResult;
  const radarDimensoes = progress.genesisResult
    ? progress.genesisResult.dimensionScores.map(d => ({ nome: d.nome, percentual: d.score / 100 }))
    : defaultRadarDimensoes;

  const perfilTitle = progress.genesisResult
    ? `Índice Gênesis: ${progress.genesisResult.indiceGenesis}/100 — Estágio ${progress.genesisResult.estagio}`
    : "Iniciante Genesis";

  const isAnonym = progress.name === "Convidado";

  return (
    <div className="w-full flex flex-col space-y-6 pb-24 animate-fade-in font-sans">
      
      {/* Account Profile Header card */}
      <div className="bg-[#111B2E] brutal-border p-5 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-[#0B1220] border border-[#1E293B] rounded-xl flex items-center justify-center">
            <User className="text-[#38BDF8] w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-display font-medium text-white tracking-tight uppercase flex items-center gap-1.5 font-bold">
              <span>{progress.name}</span>
              {progress.isPro && (
                <span className="px-1.5 py-0.5 bg-[#2563EB] text-[7px] font-mono font-black text-white rounded tracking-widest leading-none">
                  GENESIS PRO
                </span>
              )}
            </h3>
            <p className="text-[9px] text-[#888888] mt-0.5 font-mono">{progress.email || "Sessão Anônima"}</p>
          </div>
        </div>

        {/* Sync control & Admin button */}
        <div className="flex items-center gap-1.5">
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-600/60 rounded-lg text-[8px] font-mono font-bold text-amber-300 uppercase tracking-wider cursor-pointer transition-colors"
            >
              PAINEL ADMIN
            </button>
          )}

          {isAnonym ? (
            <button
              onClick={onTriggerAuth}
              className="px-3.5 py-2 bg-[#1E293B] hover:bg-[#2563EB] border border-[#1E293B] rounded-lg text-[8px] font-bold text-[#F0F0F0] uppercase tracking-wider cursor-pointer transition-colors"
            >
              Sincronizar Conta
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="p-2 bg-transparent hover:bg-[#1E293B] border border-[#1E293B] text-[#888888] hover:text-[#38BDF8] rounded-lg transition-colors cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Genesis Diagnostic Status */}
      {hasGenesisResult ? (
        <div className="bg-[#111B2E] border border-[#1E293B] p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#38BDF8]">
              <Compass className="w-4 h-4" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">
                Seu Diagnóstico Gênesis
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-white bg-[#0B1220] px-2.5 py-0.5 rounded border border-[#1E293B]">
              {progress.genesisResult?.indiceGenesis}/100
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#888888]">Estágio Atual:</span>
            <span className="font-bold text-[#38BDF8] font-mono">
              {progress.genesisResult?.estagio}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#888888]">Gargalo Principal:</span>
            <span className="font-bold text-amber-400 text-[11px]">
              {progress.genesisResult?.weakestDimensions.join(", ")}
            </span>
          </div>

          <button
            onClick={onViewResult}
            className="w-full mt-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            <span>Ver Dossiê e Mapa Gênesis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-[#111B2E] border border-[#1E293B] p-5 rounded-2xl space-y-3 text-center">
          <Target className="w-8 h-8 text-[#38BDF8] mx-auto" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase">Diagnóstico do Projeto Gênesis</h4>
            <p className="text-[10px] text-[#888888] mt-1 leading-relaxed">
              Mapeie suas 5 dimensões vitais e receba seu plano personalizado para os 3 primeiros dias.
            </p>
          </div>
          <button
            onClick={onStartDiagnosis}
            className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-[10px] font-bold text-white uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            FAZER DIAGNÓSTICO (25 QUESTÕES)
          </button>
        </div>
      )}

      {/* Profile canvas radar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] text-[#888888] font-bold uppercase tracking-wider">
          <span>{perfilTitle}</span>
          <span>RADAR DAS 5 DIMENSÕES</span>
        </div>
        <RadarChart dimensoes={radarDimensoes} />
      </div>

      {/* Stats Tickers */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="p-4 bg-[#111B2E] brutal-border rounded-xl flex items-center gap-3">
          <Trophy className="text-[#38BDF8] w-5 h-5" />
          <div>
            <div className="text-sm font-display font-black text-[#F0F0F0]">{progress.completedLessons.length} AULAS</div>
            <div className="text-[8px] font-bold text-[#888888] uppercase tracking-widest mt-0.5">ESTUDO CONCLUÍDO</div>
          </div>
        </div>

        <div className="p-4 bg-[#111B2E] brutal-border rounded-xl flex items-center gap-3">
          <Flame className="text-[#38BDF8] w-5 h-5 animate-pulse" />
          <div>
            <div className="text-sm font-display font-black text-[#F0F0F0]">{progress.activeDays} DIAS</div>
            <div className="text-[8px] font-bold text-[#888888] uppercase tracking-widest mt-0.5">SEQUÊNCIA DE AÇÃO</div>
          </div>
        </div>
      </div>

      {/* Pro Level Banner Upgrade */}
      {!progress.isPro && (
        <div className="bg-gradient-to-br from-[#111B2E] to-[#0B1220] border border-[#2563EB]/40 rounded-2xl p-5 relative overflow-hidden flex flex-col items-start gap-3">
          <div className="absolute right-0 top-0 w-24 h-full bg-[#2563EB]/10 blur-2xl pointer-events-none" />
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-1 text-[#38BDF8]">
              <Sparkles className="w-4 h-4" />
              <span className="text-[8px] font-mono font-black uppercase tracking-widest">GENESIS PRO</span>
            </div>
            <h4 className="text-sm font-display font-bold uppercase tracking-tight text-[#F0F0F0]">Evolua para a Versão Completa</h4>
            <p className="text-[10px] text-[#888888] leading-relaxed max-w-xs">
              Tenha acesso ilimitado a todos os módulos, desafios diários e acompanhamento de consistência para vencer a estagnação.
            </p>
          </div>
          <button
            onClick={onUpgradeClick}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 transition-all duration-150 py-3 text-[10px] font-bold uppercase tracking-widest text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer text-glow-blue shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            <span>EFETUAR UPGRADE PRO</span>
          </button>
        </div>
      )}

    </div>
  );
}
