import React, { useState, useEffect } from "react";
import {
  Flame,
  Lock,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldAlert,
  Clock,
  RotateCcw,
  Compass,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { GenesisDiagnosticResult } from "../types";
import { getDay1Content } from "../data/genesisQuizData";
import { YouTubeVideoPlayer, AudioPlayer } from "./MediaPlayers";

interface JourneyScreenProps {
  selectedDayId?: string;
  onSelectDay?: (dayId: string) => void;
  isPro: boolean;
  completedLessons: string[];
  onToggleLessonComplete: (lessonId: string) => void;
  onUpgradeClick: () => void;
  genesisResult?: GenesisDiagnosticResult;
}

export default function ModuleScreen({
  selectedDayId = "dia_1",
  onSelectDay,
  isPro,
  completedLessons = [],
  onToggleLessonComplete,
  onUpgradeClick,
  genesisResult,
}: JourneyScreenProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedDayIds, setExpandedDayIds] = useState<Record<string, boolean>>({});
  const [challengeMedia, setChallengeMedia] = useState<Record<string, { videoUrl?: string; audioUrl?: string }>>({});

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.challengeMedia) {
          setChallengeMedia(data.challengeMedia);
        }
      })
      .catch((err) => console.error("Error loading challenge media config:", err));
  }, []);

  const toggleExpand = (dayId: string) => {
    setExpandedDayIds((prev) => ({
      ...prev,
      [dayId]: prev[dayId] !== undefined ? !prev[dayId] : false
    }));
  };

  const isExpanded = (dayId: string, defaultExpanded: boolean) => {
    return expandedDayIds[dayId] !== undefined ? expandedDayIds[dayId] : defaultExpanded;
  };

  // Day 1 Content based on weakest dimension
  const day1Info = getDay1Content(genesisResult?.weakestDimensionKey || "execucao");

  // Day completion statuses
  const isDay1Completed =
    completedLessons.includes("dia_1") || completedLessons.includes("day_1");
  const isDay2Completed =
    completedLessons.includes("dia_2") || completedLessons.includes("day_2");
  const isDay3Completed =
    completedLessons.includes("dia_3") || completedLessons.includes("day_3");

  const showLockedToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const daysData = [
    {
      id: "dia_1",
      dayNumber: 1,
      title: day1Info.taskTitle,
      dimensionBadge: day1Info.dimensionTitle,
      objetivo: day1Info.objetivo,
      instrucoes: day1Info.instrucoesList,
      xp: day1Info.xp,
      tempo: day1Info.tempoEstimado,
      pesos: day1Info.healthAreaWeights,
      actionStep: day1Info.actionStep,
      isUnlocked: true,
      isCompleted: isDay1Completed,
    },
    {
      id: "dia_2",
      dayNumber: 2,
      title: "Dia 2: Quebra de Padrão",
      dimensionBadge: "Mapeamento & Interrupção",
      objetivo:
        "Identificar e interromper o hábito automático de fuga que dispara a procrastinação.",
      instrucoes: [
        "Mapeie o estímulo exato que faz você abrir o celular ou adiar a tarefa.",
        "Mude o ambiente físico para criar um obstáculo de 20 segundos antes do hábito de fuga.",
        "Execute 5 minutos da tarefa sem qualquer tipo de interrupção.",
      ],
      xp: 100,
      tempo: "15 minutos",
      pesos: "Mental 2, Emocional 2",
      actionStep:
        "Interrompa uma fuga automática hoje no exato instante em que ela surgir.",
      isUnlocked: isDay1Completed,
      isCompleted: isDay2Completed,
      unlockRequirement: "Requer conclusão do Dia 1",
    },
    {
      id: "dia_3",
      dayNumber: 3,
      title: "Dia 3: Ativo Palpável (Fire Trial)",
      dimensionBadge: "Vitória em 72h",
      objetivo:
        "Consolide e entregue sua primeira vitória concreta e tangível produzida em 72 horas.",
      instrucoes: [
        "Finalize um entregável real (um documento, mensagem, publicação ou decisão).",
        "Valide o cumprimento com alguém ou publique o resultado gerado.",
        "Registre a vitória na comunidade para selar sua saída definitiva da inércia.",
      ],
      xp: 150,
      tempo: "30 minutos",
      pesos: "Profissional 3, Mental 2",
      actionStep:
        "Apresente ou envie o ativo palpável que você produziu nos últimos 3 dias.",
      isUnlocked: isDay2Completed,
      isCompleted: isDay3Completed,
      unlockRequirement: "Requer conclusão do Dia 2",
    },
  ];

  const proDaysData = [
    {
      id: "dia_4",
      dayNumber: 4,
      title: "Dia 4: Análise de Ruído & Filtro Social",
      dimensionBadge: "Filtro Social & Foco Tático",
      objetivo:
        "Eliminar interferências externas, notificações ruidosas e opiniões alheias que minam o seu foco de ação.",
      instrucoes: [
        "Desative todas as notificações não essenciais do celular e computador pelas próximas 24h.",
        "Mapeie as 3 maiores fontes de ruído (pessoas, redes ou canais) que roubam sua atenção.",
        "Aplique o filtro de utilidade imediata: se a informação não ajuda na tarefa de hoje, ignore.",
      ],
      xp: 150,
      tempo: "20 minutos",
      pesos: "Mental 2, Emocional 2",
      actionStep:
        "Desative notificações ruidosas e complete o bloco de trabalho protegido sem interrupções.",
    },
    {
      id: "dia_5",
      dayNumber: 5,
      title: "Dia 5: Arquitetura do Ambiente Anti-Fuga",
      dimensionBadge: "Ambiente & Baixa Fricção",
      objetivo:
        "Projetar um ambiente físico e digital onde executar a tarefa principal exija zero esforço de decisão.",
      instrucoes: [
        "Deixe as ferramentas da sua tarefa principal abertas e prontas antes de encerrar o dia anterior.",
        "Aumente a fricção do hábito de fuga: feche abas desnecessárias e guarde distrações longe do seu alcance visual.",
        "Execute um ciclo inicial de 10 minutos focado exclusivamente no primeiro passo da tarefa.",
      ],
      xp: 150,
      tempo: "25 minutos",
      pesos: "Estrutura 3, Ação 2",
      actionStep:
        "Prepare seu ambiente de trabalho de forma impecável antes de iniciar seu bloco produtivo.",
    },
    {
      id: "dia_6",
      dayNumber: 6,
      title: "Dia 6: O Ciclo de Foco Implacável",
      dimensionBadge: "Hiperfoco & Ritmo de Entrega",
      objetivo:
        "Implementar blocos ininterruptos de hiperfoco e alta velocidade de entrega sem micro-pausas dispersivas.",
      instrucoes: [
        "Defina um único resultado esperado antes de disparar o cronômetro do seu bloco de foco.",
        "Trabalhe por 45 minutos corridos com foco total, sem trocar de janela ou checar mensagens.",
        "Registre a taxa de conclusão imediatamente após o término do bloco de hiperfoco.",
      ],
      xp: 200,
      tempo: "45 minutos",
      pesos: "Mental 3, Profissional 2",
      actionStep:
        "Conclua 1 bloco ininterrupto de 45 minutos focado em um único entregável crucial.",
    },
    {
      id: "dia_7",
      dayNumber: 7,
      title: "Dia 7: Avaliação da Primeira Semana & Recalibração",
      dimensionBadge: "Recalibração & Métricas",
      objetivo:
        "Consolidar os ganhos dos primeiros 7 dias e ajustar os pontos de atrito para acelerar a tração.",
      instrucoes: [
        "Revise a lista de desafios concluídos nos últimos 7 dias e identifique onde houve mais facilidade ou travamento.",
        "Calcule seu Índice de Foco da semana com base na constância das ações diárias.",
        "Defina o gargalo prioritário que será eliminado nos dias 8 a 10.",
      ],
      xp: 200,
      tempo: "30 minutos",
      pesos: "Clareza 3, Estrutura 2",
      actionStep:
        "Anote seu gargalo crítico no diário de bordo e trace o ajuste para a próxima semana.",
    },
    {
      id: "dia_8",
      dayNumber: 8,
      title: "Dia 8: Automação da Disciplina Diária",
      dimensionBadge: "Ritualização & Automação",
      objetivo:
        "Transformar o esforço consciente de execução em rituais automáticos que funcionam independentemente da motivação.",
      instrucoes: [
        "Conecte a nova ação de foco a um hábito já consolidado na sua rotina diária.",
        "Crie um gatilho visual claro no seu espaço de trabalho que sinalize a hora de produzir.",
        "Execute a rotina com tolerância zero para negociação mental no início do bloco.",
      ],
      xp: 200,
      tempo: "20 minutos",
      pesos: "Energia 2, Ação 3",
      actionStep:
        "Ative seu gatilho ritualizado e entre no bloco produtivo sem hesitar.",
    },
    {
      id: "dia_9",
      dayNumber: 9,
      title: "Dia 9: Blindagem do Foco em Alta Pressão",
      dimensionBadge: "Resiliência & Gestão do Caos",
      objetivo:
        "Manter a capacidade de entregar resultados mesmo em dias atípicos, cansativos ou sob alta pressão.",
      instrucoes: [
        "Quando o dia parecer caótico, reduza o escopo da meta ao mínimo viável negociado.",
        "Aplique a regra da 'Menor Ação Válida': entregue ao menos a versão simplificada do compromisso.",
        "Proteja o registro de vitória diário para não quebrar a sequência de tração construída.",
      ],
      xp: 250,
      tempo: "20 minutos",
      pesos: "Mental 3, Emocional 3",
      actionStep:
        "Mesmo sob pressão ou imprevistos, entregue a Menor Ação Válida hoje sem falhar.",
    },
    {
      id: "dia_10",
      dayNumber: 10,
      title: "Dia 10: O Novo Padrão de Tração",
      dimensionBadge: "Consolidação & Salto de Patamar",
      objetivo:
        "Consolidar a mudança de identidade e selar a transição definitiva da inércia para a alta tração contínua.",
      instrucoes: [
        "Faça o balanço de progresso dos 10 dias completos da jornada de aceleração.",
        "Compare seu nível de clareza e ritmo de execução atual com o momento do diagnóstico inicial.",
        "Defina seu próximo objetivo de expansão para a Fase 3 (Dias 11 a 31) na comunidade.",
      ],
      xp: 300,
      tempo: "30 minutos",
      pesos: "Profissional 3, Identidade 3",
      actionStep:
        "Registre seu depoimento de vitória de 10 dias no grupo oficial do WhatsApp.",
    },
  ];

  // Render function for a full day card (used for both Phase 1 and Phase 2)
  const renderDayCard = (
    day: {
      id: string;
      dayNumber: number;
      title: string;
      dimensionBadge: string;
      objetivo: string;
      instrucoes: string[];
      xp: number;
      tempo: string;
      pesos: string;
      actionStep: string;
      isUnlocked: boolean;
      isCompleted: boolean;
      unlockRequirement?: string;
    },
    isProRequired: boolean = false
  ) => {
    // Default expanded state: unlocked and not completed = expanded, otherwise collapsed unless user toggled
    const defaultExp = day.isUnlocked && !day.isCompleted;
    const open = isExpanded(day.id, defaultExp);

    // Media config for this day
    const media = challengeMedia[day.id];
    const videoUrl = media?.videoUrl || (day as any).videoUrl;
    const audioUrl = media?.audioUrl || (day as any).audioUrl;

    return (
      <div
        key={day.id}
        className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xl ${
          day.isCompleted
            ? "bg-[#111B2E] border-emerald-700/60"
            : day.isUnlocked
            ? "bg-gradient-to-br from-[#1E3A8A]/30 to-[#111B2E] border-[#2563EB]/60"
            : "bg-[#0B1220]/80 border-[#1E293B] opacity-75"
        }`}
      >
        {/* Card Header (Always Visible & Clickable) */}
        <div
          onClick={() => toggleExpand(day.id)}
          className="p-4 sm:p-5 flex items-start justify-between gap-2.5 cursor-pointer hover:bg-white/5 transition-colors select-none"
        >
          <div className="space-y-1 pr-2">
            <span className="text-[9px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider block">
              {day.dimensionBadge}
            </span>
            <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <span>{day.title}</span>
            </h3>
            {!open && (
              <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                {day.objetivo}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status Badge (ALWAYS VISIBLE in both collapsed & expanded states) */}
            <span
              className={`text-[8px] sm:text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                day.isCompleted
                  ? "bg-emerald-950 border-emerald-600 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : day.isUnlocked
                  ? "bg-[#2563EB]/20 border-[#2563EB]/50 text-[#38BDF8]"
                  : isProRequired
                  ? "bg-amber-950/80 border-amber-700 text-amber-400"
                  : "bg-zinc-900 border-zinc-700 text-zinc-500"
              }`}
            >
              {day.isCompleted
                ? "Concluído ✓"
                : day.isUnlocked
                ? "Liberado"
                : isProRequired
                ? "Genesis PRO"
                : "Bloqueado"}
            </span>

            <button className="p-1 text-zinc-400 hover:text-white transition-colors">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card Body (Expanded View) */}
        {open && (
          <div className="px-4 pb-5 sm:px-5 space-y-3.5 border-t border-[#1E293B]/60 pt-3.5 animate-fade-in">
            {/* Objective */}
            <p className="text-xs text-zinc-300 bg-[#0B1220]/80 border border-[#1E293B] p-3 rounded-xl leading-relaxed">
              🎯 <strong>Objetivo:</strong> {day.objetivo}
            </p>

            {/* Detailed Tactical Instructions */}
            {day.isUnlocked && (
              <div className="space-y-2 pt-1">
                <span className="text-[9px] font-mono text-[#888888] font-bold uppercase tracking-widest block">
                  Instruções Táticas:
                </span>
                {day.instrucoes.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <span className="w-5 h-5 rounded-full bg-[#2563EB]/30 border border-[#2563EB]/50 text-[#38BDF8] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Video & Audio Players if configured */}
            {day.isUnlocked && (videoUrl || audioUrl) && (
              <div className="space-y-3 pt-1 border-t border-[#1E293B]/60">
                {videoUrl && <YouTubeVideoPlayer videoUrl={videoUrl} title={`Vídeo - ${day.title}`} />}
                {audioUrl && <AudioPlayer audioUrl={audioUrl} title={`Áudio - ${day.title}`} />}
              </div>
            )}

            {/* Badges (XP, Time, Weights) */}
            {day.isUnlocked && (
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1E293B]">
                <div className="bg-[#0B1220] border border-[#1E293B] px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-amber-400">
                  ⚡ +{day.xp} XP
                </div>
                <div className="bg-[#0B1220] border border-[#1E293B] px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-cyan-400">
                  ⏱️ {day.tempo}
                </div>
                <div className="bg-[#0B1220] border border-[#1E293B] px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-purple-400">
                  📊 {day.pesos}
                </div>
              </div>
            )}

            {/* Action step & Complete Button */}
            {day.isUnlocked ? (
              <div className="space-y-3 pt-2">
                <div className="bg-[#0B1220] border border-[#1E293B] p-3 rounded-xl text-xs text-[#38BDF8] font-mono">
                  💡 <strong>Ação Imediata:</strong> {day.actionStep}
                </div>

                <button
                  onClick={() => onToggleLessonComplete(day.id)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    day.isCompleted
                      ? "bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-emerald-300"
                      : "bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white shadow-[0_0_15px_rgba(37,99,235,0.35)]"
                  }`}
                >
                  {day.isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Desafio Concluído (Clique para alterar)</span>
                    </>
                  ) : (
                    <>
                      <span>Marcar {day.title.split(":")[0]} como Concluído (+{day.xp} XP)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : isProRequired ? (
              <button
                onClick={onUpgradeClick}
                className="w-full bg-[#0B1220] hover:bg-amber-950/40 border border-amber-600/50 text-amber-300 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Desbloquear Fase 2 — R$ 14,90</span>
              </button>
            ) : (
              <button
                onClick={() => showLockedToast(day.unlockRequirement || "Desafio bloqueado.")}
                className="w-full bg-[#0B1220] border border-[#1E293B] text-zinc-500 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
              >
                <Lock className="w-4 h-4" />
                <span>{day.unlockRequirement}</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col space-y-6 pb-24 animate-fade-in font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-amber-950/90 border border-amber-600/60 text-amber-200 text-xs font-mono p-3 rounded-xl text-center shadow-lg animate-fade-in">
          ⚠️ {toastMessage}
        </div>
      )}

      {/* Screen Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 bg-[#1E3A8A]/30 border border-[#2563EB]/40 px-3 py-1 rounded-full">
          <Sparkles className="text-[#38BDF8] w-3.5 h-3.5" />
          <span className="text-[9px] font-bold text-[#38BDF8] uppercase tracking-widest font-mono">
            Sua Jornada Anti-Inércia
          </span>
        </div>
        <h2 className="text-xl font-display font-black text-[#F0F0F0] tracking-tight">
          10 Dias de Treino & Ação Prática
        </h2>
        <p className="text-xs text-[#888888] leading-relaxed">
          Cada desafio diário foi projetado para construir tração incremental e destravar sua capacidade de execução sem hesitação.
        </p>
      </div>

      {/* PHASE 1: FIRST 3 DAYS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-[#1E293B] pb-2">
          <span className="text-[10px] font-mono font-bold text-[#38BDF8] uppercase tracking-widest">
            Fase 1: As 3 Primeiras Vitórias
          </span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
            Acesso Liberado
          </span>
        </div>

        <div className="space-y-4">
          {daysData.map((day) => renderDayCard(day, false))}
        </div>
      </div>

      {/* PHASE 2: DAYS 4 TO 10 (GENESIS PRO) */}
      <div className="space-y-4 pt-4 border-t border-[#1E293B]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
            Fase 2: Aceleração & Consistência (Dias 4 ao 10)
          </span>
          <span className="text-[8px] font-mono font-bold bg-amber-950/80 border border-amber-800 text-amber-400 px-2.5 py-0.5 rounded-full">
            {isPro ? "Membro Pro Aprovado" : "Exclusivo Genesis PRO"}
          </span>
        </div>

        <div className="space-y-4">
          {proDaysData.map((pDay, index) => {
            let isDayUnlocked = false;
            let requirementMsg = "";

            if (!isPro) {
              isDayUnlocked = false;
              requirementMsg = "Exclusivo Genesis PRO";
            } else if (index === 0) {
              // Day 4 unlocks immediately for Pro users
              isDayUnlocked = true;
            } else {
              // Days 5-10 require the previous Pro day to be completed
              const prevDayId = proDaysData[index - 1].id;
              isDayUnlocked = completedLessons.includes(prevDayId);
              requirementMsg = `Requer Dia ${pDay.dayNumber - 1} Concluído`;
            }

            const isDayDone = completedLessons.includes(pDay.id);

            return renderDayCard(
              {
                ...pDay,
                isUnlocked: isDayUnlocked,
                isCompleted: isDayDone,
                unlockRequirement: requirementMsg,
              },
              !isPro
            );
          })}
        </div>

        {/* Upgrade Banner Call to Action */}
        {!isPro && (
          <div className="bg-gradient-to-r from-[#1E3A8A]/40 via-[#111B2E] to-[#1E3A8A]/20 border border-[#2563EB]/50 p-5 rounded-2xl space-y-3 text-center shadow-2xl">
            <Sparkles className="w-8 h-8 text-[#38BDF8] mx-auto animate-pulse" />
            <h4 className="text-sm font-display font-bold text-white uppercase tracking-tight">
              Acesse a Jornada Completa dos 10 Dias
            </h4>
            <p className="text-xs text-[#888888] max-w-xs mx-auto leading-relaxed">
              Desbloqueie os dias 4 a 10, acompanhamento tático continuo e radar de tração ilimitado no Genesis PRO.
            </p>
            <button
              onClick={onUpgradeClick}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer"
            >
              Desbloquear Fase 2 (Tração) — R$ 14,90
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
