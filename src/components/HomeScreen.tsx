import React, { useState } from "react";
import {
  Sparkles,
  Lock,
  CheckCircle2,
  Flame,
  Trophy,
  Compass,
  ArrowRight,
  Shield,
  Zap,
  RotateCcw,
} from "lucide-react";
import { GenesisDiagnosticResult } from "../types";
import { getDay1Content } from "../data/genesisQuizData";

interface HomeScreenProps {
  onStartDiagnosis: () => void;
  onSelectModule: (moduleId: string) => void;
  completedLessonsCount: number;
  isPro: boolean;
  activeDays: number;
  genesisResult?: GenesisDiagnosticResult;
  completedLessons?: string[];
  onViewResult?: () => void;
}

export default function HomeScreen({
  onStartDiagnosis,
  onSelectModule,
  completedLessonsCount,
  isPro,
  activeDays,
  genesisResult,
  completedLessons = [],
  onViewResult,
}: HomeScreenProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hasDiagnosis = !!genesisResult;

  // Day 1 content based on weakest dimension
  const day1Info = genesisResult
    ? getDay1Content(genesisResult.weakestDimensionKey)
    : getDay1Content("execucao");

  // Day completion statuses for day-gating
  const isDay1Completed =
    completedLessons.includes("dia_1") ||
    completedLessons.includes("day_1") ||
    completedLessonsCount >= 1;

  const isDay2Completed =
    completedLessons.includes("dia_2") ||
    completedLessons.includes("day_2") ||
    completedLessonsCount >= 2;

  const isDay3Completed =
    completedLessons.includes("dia_3") ||
    completedLessons.includes("day_3") ||
    completedLessonsCount >= 3;

  const showLockedToast = (dayName: string) => {
    setToastMessage(`Conclua o desafio do ${dayName} para desbloquear este passo.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-full flex flex-col space-y-6 pb-20 animate-fade-in font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-amber-950/90 border border-amber-600/60 text-amber-200 text-xs font-mono p-3 rounded-xl text-center shadow-lg animate-fade-in">
          ⚠️ {toastMessage}
        </div>
      )}

      {/* Hero Header CTA - Single Entry Point */}
      <div className="relative rounded-2xl overflow-hidden brutal-border bg-gradient-to-br from-[#111B2E] to-[#0B1220] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        {/* Ambient blue background highlight */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-[#2563EB]/10 blur-3xl pointer-events-none rounded-r-2xl" />

        <div className="space-y-3 z-10 max-w-sm">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#1E3A8A]/30 border border-[#2563EB]/40 px-3 py-1 rounded-full">
            <Sparkles className="text-[#38BDF8] w-3.5 h-3.5" />
            <span className="text-[9px] font-bold text-[#38BDF8] uppercase tracking-[0.2em] font-mono">
              Jornada Anti-Inércia
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-xl md:text-2xl font-display font-black leading-tight tracking-tight text-[#F0F0F0]">
            Você sabe exatamente o que precisa mudar.{" "}
            <span className="text-[#38BDF8] text-glow-blue block mt-1">
              E mesmo assim, não sai do lugar.
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xs text-[#888888] leading-relaxed">
            Descubra em que ponto da sua jornada você está travado — e comece a sair hoje.
          </p>

          {/* Single Primary Entry Button */}
          <button
            onClick={hasDiagnosis ? (onViewResult || onStartDiagnosis) : onStartDiagnosis}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-glow-blue duration-200 active:scale-98 transition-all px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white rounded-xl mt-2 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2"
          >
            <span>
              {hasDiagnosis ? "Ver Meu Mapa Gênesis" : "Descobrir onde estou travado"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Brain Artwork Illustration */}
        <div className="relative w-28 h-28 md:w-36 md:h-36 shrink-0 z-10 mx-auto md:mx-0">
          <div className="absolute inset-0 bg-[#2563EB]/15 rounded-full animate-pulse blur-md" />
          <img
            alt="Projeto Genesis brain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoM-xiQaZYD26ikamaGtsI2_Ezrlx3Dh2ufFX9ubJigE8lihOJBA8V0c7KlJdz3zDRhG_WvGquXoQojSO5vpLzDg7y9A98KOlT3hRh-7zw3Yc6C4LlyW4qnHg2kbxjaMjNPaYNpDibFcb62E5-IvKkhe46eQi0kYV_KJTP2n75IWW9gkFpbUX2QSaGdBA1ayngvJX-srHqFWODKMxJj4Bscy0Gv9JJT1QcYji_qlbWPZ9TE0slG8nuCiHePikwcxEdahH2pM-AY60"
            className="w-full h-full object-contain grayscale brightness-110 hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </div>

      {/* Post-Diagnosis Section: 4 New Cards (Shown ONLY after Diagnosis) */}
      {hasDiagnosis && (
        <div className="space-y-3.5 animate-fade-in">
          <div className="flex justify-between items-end border-b border-[#1E293B] pb-2">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#38BDF8] font-mono">
                Sua Rota Anti-Inércia
              </span>
              <h3 className="text-sm font-display font-bold text-[#F0F0F0] uppercase tracking-wider">
                Desafios dos 3 Primeiros Dias
              </h3>
            </div>
            <span className="text-[9px] font-mono text-zinc-500">
              Gargalo: <strong className="text-amber-400">{genesisResult.weakestDimensions.join(", ")}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. CARD DIA 1 */}
            <button
              onClick={() => {
                if (onViewResult) onViewResult();
                else onSelectModule("dia_1");
              }}
              className="bg-[#111B2E] border border-[#2563EB]/50 hover:border-[#2563EB] p-5 rounded-2xl text-left flex flex-col justify-between space-y-3 group active:scale-98 transition-all duration-200 cursor-pointer shadow-md relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-[#2563EB]/20 border border-[#2563EB]/40 rounded-xl text-[#38BDF8] group-hover:scale-105 transition-transform">
                  <Flame className="w-5 h-5" />
                </div>
                <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  isDay1Completed
                    ? "bg-emerald-950/80 border-emerald-600 text-emerald-400"
                    : "bg-[#2563EB]/20 border-[#2563EB]/40 text-[#38BDF8]"
                }`}>
                  {isDay1Completed ? "Concluído" : "Dia 1 • Liberado"}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#F0F0F0] uppercase tracking-tight group-hover:text-[#38BDF8] transition-colors">
                  {day1Info.taskTitle}
                </h4>
                <p className="text-[10px] text-[#888888] mt-1.5 leading-snug">
                  {day1Info.objetivo}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#38BDF8] pt-1">
                <span>Ver Desafio do Dia 1</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 2. CARD DIA 2 */}
            <button
              onClick={() => {
                if (!isDay1Completed) {
                  showLockedToast("Dia 1");
                } else {
                  onSelectModule("dia_2");
                }
              }}
              className={`p-5 rounded-2xl text-left flex flex-col justify-between space-y-3 group transition-all duration-200 ${
                !isDay1Completed
                  ? "bg-[#0B1220]/80 border border-[#1E293B] opacity-60 cursor-not-allowed"
                  : "bg-[#111B2E] border border-[#1E293B] hover:border-[#2563EB]/60 cursor-pointer active:scale-98"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${!isDay1Completed ? "bg-[#0B1220] border border-[#1E293B] text-zinc-600" : "bg-[#0B1220] text-[#38BDF8]"}`}>
                  {!isDay1Completed ? <Lock className="w-5 h-5 text-zinc-500" /> : <RotateCcw className="w-5 h-5 text-[#38BDF8]" />}
                </div>
                <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  isDay2Completed
                    ? "bg-emerald-950/80 border-emerald-600 text-emerald-400"
                    : !isDay1Completed
                    ? "bg-zinc-900 border-zinc-700 text-zinc-500"
                    : "bg-[#2563EB]/20 border-[#2563EB]/40 text-[#38BDF8]"
                }`}>
                  {isDay2Completed ? "Concluído" : !isDay1Completed ? "Bloqueado" : "Dia 2 • Liberado"}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#F0F0F0] uppercase tracking-tight group-hover:text-[#38BDF8] transition-colors">
                  Dia 2: Quebra de Padrão
                </h4>
                <p className="text-[10px] text-[#888888] mt-1.5 leading-snug">
                  Identifique e interrompa o hábito automático de fuga que dispara a procrastinação.
                </p>
              </div>

              <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-zinc-500 pt-1">
                <span>{!isDay1Completed ? "Requer Dia 1 Concluído" : "Acessar Desafio do Dia 2"}</span>
                {isDay1Completed && <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-[#38BDF8]" />}
              </div>
            </button>

            {/* 3. CARD DIA 3 */}
            <button
              onClick={() => {
                if (!isDay2Completed) {
                  showLockedToast("Dia 2");
                } else {
                  onSelectModule("dia_3");
                }
              }}
              className={`p-5 rounded-2xl text-left flex flex-col justify-between space-y-3 group transition-all duration-200 ${
                !isDay2Completed
                  ? "bg-[#0B1220]/80 border border-[#1E293B] opacity-60 cursor-not-allowed"
                  : "bg-[#111B2E] border border-[#1E293B] hover:border-[#2563EB]/60 cursor-pointer active:scale-98"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${!isDay2Completed ? "bg-[#0B1220] border border-[#1E293B] text-zinc-600" : "bg-[#0B1220] text-[#38BDF8]"}`}>
                  {!isDay2Completed ? <Lock className="w-5 h-5 text-zinc-500" /> : <Trophy className="w-5 h-5 text-[#38BDF8]" />}
                </div>
                <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  isDay3Completed
                    ? "bg-emerald-950/80 border-emerald-600 text-emerald-400"
                    : !isDay2Completed
                    ? "bg-zinc-900 border-zinc-700 text-zinc-500"
                    : "bg-[#2563EB]/20 border-[#2563EB]/40 text-[#38BDF8]"
                }`}>
                  {isDay3Completed ? "Concluído" : !isDay2Completed ? "Bloqueado" : "Dia 3 • Liberado"}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#F0F0F0] uppercase tracking-tight group-hover:text-[#38BDF8] transition-colors">
                  Dia 3: Ativo Palpável
                </h4>
                <p className="text-[10px] text-[#888888] mt-1.5 leading-snug">
                  Consolide e entregue sua primeira vitória concreta e tangível produzida em 72 horas.
                </p>
              </div>

              <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-zinc-500 pt-1">
                <span>{!isDay2Completed ? "Requer Dia 2 Concluído" : "Acessar Desafio do Dia 3"}</span>
                {isDay2Completed && <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-[#38BDF8]" />}
              </div>
            </button>

            {/* 4. CARD SEU MAPA GÊNESIS */}
            <button
              onClick={() => {
                if (onViewResult) onViewResult();
                else onStartDiagnosis();
              }}
              className="bg-[#111B2E] border border-emerald-900/60 hover:border-emerald-500 p-5 rounded-2xl text-left flex flex-col justify-between space-y-3 group active:scale-98 transition-all duration-200 cursor-pointer shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-600 text-emerald-400">
                  Dossiê Liberado
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#F0F0F0] uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                  Seu Mapa Gênesis
                </h4>
                <p className="text-[10px] text-[#888888] mt-1.5 leading-snug">
                  Acesse seu radar das 5 dimensões, estágio atual ({genesisResult.estagio}) e índice de inércia ({genesisResult.indiceGenesis}/100).
                </p>
              </div>

              <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 pt-1">
                <span>Abrir Resultado do Diagnóstico</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Statistics Highlight Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-[#111B2E] brutal-border border-l-2 border-l-[#2563EB] rounded-xl">
          <div className="text-lg font-display font-black text-[#F0F0F0] tracking-tight">100%</div>
          <div className="text-[8px] font-bold text-[#888888] uppercase tracking-wider mt-0.5">Foco</div>
        </div>

        <div className="p-4 bg-[#111B2E] brutal-border border-l-2 border-l-[#2563EB] rounded-xl">
          <div className="text-lg font-display font-black text-[#F0F0F0] tracking-tight">3 DIAS</div>
          <div className="text-[8px] font-bold text-[#888888] uppercase tracking-wider mt-0.5">1ª Vitória</div>
        </div>

        <div className="p-4 bg-[#111B2E] brutal-border border-l-2 border-l-[#2563EB] rounded-xl">
          <div className="text-lg font-display font-black text-[#F0F0F0] tracking-tight">{activeDays} DIAS</div>
          <div className="text-[8px] font-bold text-[#888888] uppercase tracking-wider mt-0.5">Consistência</div>
        </div>
      </div>
    </div>
  );
}
