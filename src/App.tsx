/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from "react";
import { Brain, Accessibility, Eye, Flame, Award, HelpCircle, ShieldAlert, Sparkles, CreditCard, ChevronRight, Menu, Bell, Home, Grid, UserRound, Sparkle, Lock, LogOut, Key, RotateCcw } from "lucide-react";

import { GenesisDiagnosticResult, UserProgress } from "./types";
import HomeScreen from "./components/HomeScreen";
import DiagnosisScreen from "./components/DiagnosisScreen";
import ResultScreen from "./components/ResultScreen";
import ModuleScreen from "./components/ModuleScreen";
import ProfileScreen from "./components/ProfileScreen";
import AuthModal from "./components/AuthModal";
import BillingModal from "./components/BillingModal";
import AdminDashboard from "./components/AdminDashboard";

const DEFAULT_SIMULATION_PROFILES: Record<"ignicao" | "tracao" | "expansao", UserProgress> = {
  ignicao: {
    uid: "admin_test_ignicao",
    name: "Aluno Teste (Ignição)",
    email: "simulacao_ignicao@genesis.test",
    isPro: false,
    activeDays: 2,
    completedLessons: ["dia_1"],
    interestTag: "Transformar o que eu sei em renda"
  },
  tracao: {
    uid: "admin_test_tracao",
    name: "Aluno Teste (Tração)",
    email: "simulacao_tracao@genesis.test",
    isPro: true,
    activeDays: 6,
    completedLessons: ["dia_1", "dia_2", "dia_3", "dia_4", "dia_5"],
    interestTag: "Avançar na carreira",
    genesisResult: {
      diagnosticId: "diag_sim_tracao",
      firstName: "Aluno Teste",
      indiceGenesis: 62,
      estagio: "Movimento",
      estagioCor: "#38BDF8",
      estagioDescricao: "Fase de aceleração e superação de atritos de rotina.",
      dimensionScores: [
        { key: "clareza", nome: "Clareza", score: 68 },
        { key: "identidade", nome: "Identidade", score: 70 },
        { key: "energia", nome: "Energia Vital", score: 65 },
        { key: "estrutura", nome: "Estrutura", score: 50 },
        { key: "acao", nome: "Capacidade de Ação", score: 58 }
      ],
      strongestDimensions: ["Identidade"],
      weakestDimensions: ["Estrutura"],
      weakestDimensionKey: "estrutura",
      interestTag: "Avançar na carreira",
      recommendations: {
        titulo: "Plano de Estruturação",
        passos: ["Otimize seus blocos de foco diários para eliminar ladrões de tempo e criar consistência."]
      },
      projections: { hoje: [], dia3: [], dia7: [], dia21: [] }
    }
  },
  expansao: {
    uid: "admin_test_expansao",
    name: "Aluno Teste (Expansão)",
    email: "simulacao_expansao@genesis.test",
    isPro: true,
    activeDays: 21,
    completedLessons: [
      "dia_1", "dia_2", "dia_3", "dia_4", "dia_5", "dia_6", "dia_7",
      "dia_8", "dia_9", "dia_10", "dia_11", "dia_12", "dia_13", "dia_14", "dia_15"
    ],
    interestTag: "Mais presença com quem eu amo",
    genesisResult: {
      diagnosticId: "diag_sim_expansao",
      firstName: "Aluno Teste",
      indiceGenesis: 82,
      estagio: "Expansão",
      estagioCor: "#10B981",
      estagioDescricao: "Estado de fluxo e escala consistente dos hábitos.",
      dimensionScores: [
        { key: "clareza", nome: "Clareza", score: 85 },
        { key: "identidade", nome: "Identidade", score: 88 },
        { key: "energia", nome: "Energia Vital", score: 80 },
        { key: "estrutura", nome: "Estrutura", score: 75 },
        { key: "acao", nome: "Capacidade de Ação", score: 82 }
      ],
      strongestDimensions: ["Identidade", "Clareza"],
      weakestDimensions: ["Estrutura"],
      weakestDimensionKey: "estrutura",
      interestTag: "Mais presença com quem eu amo",
      recommendations: {
        titulo: "Plano de Expansão e Escala",
        passos: ["Mantenha a constância e delegue tarefas acessórias para expandir seus resultados."]
      },
      projections: { hoje: [], dia3: [], dia7: [], dia21: [] }
    }
  }
};

export default function App() {
  // Navigation & Screen View state
  const [activeTab, setActiveTab] = useState<"home" | "modules" | "profile" | "pro" | "result">("home");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState("dia_1");

  // Admin routing & authentication state
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // Student view simulation state for Admin
  const [simulationPhase, setSimulationPhase] = useState<"ignicao" | "tracao" | "expansao" | null>(null);

  // Auth & Billing modal states
  const [authOpen, setAuthOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);

  // User Progression local simulation state for real user
  const [userProgress, setUserProgress] = useState<UserProgress>({
    uid: "anon_user_9921",
    name: "Convidado",
    email: "",
    isPro: false,
    completedLessons: [],
    activeDays: 1,
  });

  // Isolated simulation profiles for each phase (admin testing)
  const [simulatedProfiles, setSimulatedProfiles] = useState<Record<"ignicao" | "tracao" | "expansao", UserProgress>>(() => {
    const loadPhase = (phase: "ignicao" | "tracao" | "expansao"): UserProgress => {
      const saved = localStorage.getItem(`genesis_sim_${phase}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(`Error loading simulation profile for ${phase}`, e);
        }
      }
      return DEFAULT_SIMULATION_PROFILES[phase];
    };

    return {
      ignicao: loadPhase("ignicao"),
      tracao: loadPhase("tracao"),
      expansao: loadPhase("expansao"),
    };
  });

  // Check URL pathname for /admin route
  useEffect(() => {
    const checkPath = () => {
      if (window.location.pathname.startsWith("/admin")) {
        setIsAdminRoute(true);
      }
    };
    checkPath();
    window.addEventListener("popstate", checkPath);
    return () => window.removeEventListener("popstate", checkPath);
  }, []);

  // Handle return from Mercado Pago checkout (success redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setUserProgress((prev) => {
        const updated = {
          ...prev,
          isPro: true,
          activeDays: Math.max(prev.activeDays || 1, 4)
        };
        localStorage.setItem("genesis_user_data", JSON.stringify(updated));
        return updated;
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Load real user persistence from local storage
  useEffect(() => {
    const saved = localStorage.getItem("genesis_user_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean up legacy admin email leakage if present in browser storage
        if (parsed.email === "pccris@gmail.com" && parsed.name === "Convidado") {
          parsed.email = "";
        }
        // Ensure guest users without a purchase date start as non-PRO
        if (!parsed.email && !parsed.proPurchaseDate) {
          parsed.isPro = false;
        }
        localStorage.setItem("genesis_user_data", JSON.stringify(parsed));
        setUserProgress(parsed);
      } catch (e) {
        console.error("Failed to parse persisted data.", e);
      }
    }
  }, []);

  // Save persistence when progress state changes (handles simulation isolation)
  const saveProgress = (newProgress: UserProgress) => {
    if (simulationPhase) {
      setSimulatedProfiles((prev) => {
        const updated = {
          ...prev,
          [simulationPhase]: newProgress
        };
        localStorage.setItem(`genesis_sim_${simulationPhase}`, JSON.stringify(newProgress));
        return updated;
      });
    } else {
      setUserProgress(newProgress);
      localStorage.setItem("genesis_user_data", JSON.stringify(newProgress));
    }
  };

  const handleResetSimulationProfile = (phase: "ignicao" | "tracao" | "expansao") => {
    const resetState: UserProgress = phase === "ignicao"
      ? {
          uid: "admin_test_ignicao",
          name: "Aluno Teste (Ignição)",
          email: "simulacao_ignicao@genesis.test",
          isPro: false,
          activeDays: 1,
          completedLessons: [],
          genesisResult: undefined,
          interestTag: "Não informado"
        }
      : DEFAULT_SIMULATION_PROFILES[phase];

    setSimulatedProfiles((prev) => {
      const updated = { ...prev, [phase]: resetState };
      localStorage.setItem(`genesis_sim_${phase}`, JSON.stringify(resetState));
      return updated;
    });
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");
    setIsAdminLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setAdminToken(data.token);
        setAdminLoginError("");
      } else {
        setAdminLoginError(data.error || "Credenciais de administrador inválidas.");
      }
    } catch (err: any) {
      setAdminLoginError(err.message || "Erro de conexão ao autenticar.");
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleActivateSimulation = (phase: "ignicao" | "tracao" | "expansao") => {
    setSimulationPhase(phase);
    setIsAdminRoute(false);
    setActiveTab("home");
  };

  const handleDeactivateSimulation = () => {
    setSimulationPhase(null);
  };

  const handleStartDiagnosis = () => {
    setIsDiagnosing(true);
  };

  // Compute effective user progress (simulated if simulationPhase is active)
  const effectiveProgress: UserProgress = simulationPhase
    ? simulatedProfiles[simulationPhase]
    : userProgress;

  const handleDiagnosisComplete = (result: GenesisDiagnosticResult) => {
    setIsDiagnosing(false);
    const current = simulationPhase ? simulatedProfiles[simulationPhase] : userProgress;
    const updated: UserProgress = {
      ...current,
      name: result.firstName || current.name,
      genesisResult: result,
      interestTag: result.interestTag || current.interestTag,
      profileType: `Estágio ${result.estagio}`,
      activeDays: Math.max(current.activeDays, 1)
    };
    saveProgress(updated);
    setActiveTab("result");
  };

  const handleToggleLesson = (lessonId: string) => {
    const current = simulationPhase ? simulatedProfiles[simulationPhase] : userProgress;
    let completed = [...current.completedLessons];
    if (completed.includes(lessonId)) {
      completed = completed.filter((id) => id !== lessonId);
    } else {
      completed.push(lessonId);
    }
    const updated = {
      ...current,
      completedLessons: completed
    };
    saveProgress(updated);
  };

  const handleUpgradeSuccess = (type: "tracao" | "expansao") => {
    const current = simulationPhase ? simulatedProfiles[simulationPhase] : userProgress;
    const targetDays = type === "expansao" ? 30 : 10;
    const updated = {
      ...current,
      isPro: true,
      proType: type,
      proPurchaseDate: new Date().toISOString(),
      activeDays: Math.max(current.activeDays || 1, targetDays)
    };
    saveProgress(updated);
  };

  const handleLoginSuccess = (user: { name: string; email: string }) => {
    const current = simulationPhase ? simulatedProfiles[simulationPhase] : userProgress;
    const updated = {
      ...current,
      uid: "firebase_user_" + Math.floor(Math.random() * 8888),
      name: user.name,
      email: user.email
    };
    saveProgress(updated);
  };

  const handleLogout = () => {
    const cleared = {
      uid: "anon_user_9921",
      name: "Convidado",
      email: "",
      isPro: false,
      completedLessons: [],
      activeDays: 1,
      diagnosisResult: undefined,
      profileType: undefined
    };
    saveProgress(cleared);
  };

  const isExpansaoExpired = React.useMemo(() => {
    if (userProgress.proType === "expansao" && userProgress.proPurchaseDate) {
      const purchasedAt = new Date(userProgress.proPurchaseDate).getTime();
      const daysPassed = (Date.now() - purchasedAt) / (1000 * 60 * 60 * 24);
      return daysPassed >= 30;
    }
    return false;
  }, [userProgress.proType, userProgress.proPurchaseDate]);

  return (
    <div className="min-h-screen bg-[#060A12] text-slate-100 flex flex-col font-sans selection:bg-[#2563EB] selection:text-white relative">
      
      {/* Simulation Mode Banner for Admin testing */}
      {simulationPhase && !isAdminRoute && (
        <div className="w-full bg-amber-950/95 border-b border-amber-500/80 px-4 py-2.5 text-amber-300 z-50 shrink-0 shadow-lg font-mono">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                MODO SIMULAÇÃO — FASE {simulationPhase.toUpperCase()}
              </span>
              <span className="text-[9px] bg-amber-900/80 border border-amber-700/60 px-2 py-0.5 rounded text-amber-300">
                UID: admin_test_{simulationPhase}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-amber-500 font-bold uppercase">Fase:</span>
              {(["ignicao", "tracao", "expansao"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSimulationPhase(p)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    simulationPhase === p
                      ? "bg-amber-400 text-amber-950 shadow font-black"
                      : "bg-amber-900/40 text-amber-300/80 hover:text-amber-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => handleResetSimulationProfile(simulationPhase)}
                className="px-2 py-0.5 bg-rose-950/90 hover:bg-rose-900 border border-rose-700/80 text-rose-200 rounded text-[9px] font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors"
                title="Reiniciar este perfil isolado para o estado inicial"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reiniciar</span>
              </button>

              <button
                onClick={() => setIsAdminRoute(true)}
                className="px-2 py-0.5 bg-amber-800 hover:bg-amber-700 text-white rounded text-[9px] font-bold uppercase cursor-pointer transition-colors"
              >
                Painel Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic top bar for the viewport (hidden on diagnosis or admin route) */}
      {!isDiagnosing && !isAdminRoute && (
        <header className="w-full bg-[#0B1220]/90 backdrop-blur-md border-b border-[#1E293B]/60 sticky top-0 z-40 shrink-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("home")}>
              <Sparkles className="text-[#38BDF8] w-5 h-5" />
              <h1 className="text-base font-display font-bold text-[#F0F0F0] tracking-tighter flex items-baseline">
                <span>PROJETO</span><span className="text-[#38BDF8] ml-1">GENESIS</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {!effectiveProgress.isPro && (
                <button
                  onClick={() => setBillingOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E3A8A]/30 hover:bg-[#1E3A8A]/50 border border-[#2563EB]/40 rounded-lg text-xs font-bold text-[#38BDF8] uppercase tracking-wider cursor-pointer font-mono transition-all"
                >
                  <Sparkles className="w-3 h-3 text-[#38BDF8]" />
                  <span>UPGRADE PRO</span>
                </button>
              )}

              <button
                onClick={() => setAuthOpen(true)}
                className="p-2 bg-[#111B2E] hover:bg-[#1E293B] rounded-lg border border-[#1E293B] transition-colors relative cursor-pointer"
                title="Minha Conta"
              >
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#38BDF8] rounded-full" />
                <Bell className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Primary Inner Switch Viewport */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 flex flex-col z-20">
        {isAdminRoute ? (
          adminToken ? (
            <AdminDashboard
              token={adminToken}
              onLogout={() => setAdminToken(null)}
              onActivateSimulation={handleActivateSimulation}
              onDeactivateSimulation={handleDeactivateSimulation}
              onResetSimulationProfile={handleResetSimulationProfile}
              activeSimulationPhase={simulationPhase}
              simulatedProfiles={simulatedProfiles}
            />
          ) : (
            /* Admin Login Form */
            <div className="w-full flex flex-col items-center justify-center my-auto py-8 animate-fade-in font-sans">
              <div className="w-full max-w-sm bg-[#111B2E] border border-[#2563EB]/40 rounded-2xl p-6 space-y-5 shadow-2xl relative">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-[#1E3A8A]/40 border border-[#2563EB]/50 text-[#38BDF8] rounded-2xl flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h2 className="text-sm font-display font-black text-white uppercase tracking-wider">
                    ÁREA ADMINISTRATIVA GENESIS
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    Acesso restrito para gestão de alunos, leads e parâmetros.
                  </p>
                </div>

                {adminLoginError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-600 rounded-xl text-rose-300 text-xs font-mono font-bold">
                    {adminLoginError}
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">
                      E-mail do Administrador
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@exemplo.com"
                      className="w-full bg-[#0B1220] border border-[#1E293B] focus:border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">
                      Senha
                    </label>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0B1220] border border-[#1E293B] focus:border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAdminLoading}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 mt-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isAdminLoading ? "Autenticando..." : "Acessar Painel Admin"}</span>
                  </button>
                </form>

                <div className="pt-2 border-t border-[#1E293B] text-center">
                  <button
                    onClick={() => setIsAdminRoute(false)}
                    className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                  >
                    Voltar para a área de alunos
                  </button>
                </div>
              </div>
            </div>
          )
        ) : isDiagnosing ? (
          <DiagnosisScreen
            onBack={() => setIsDiagnosing(false)}
            onAnalysisComplete={handleDiagnosisComplete}
          />
        ) : (
          <>
            {/* Screen Content rendering according to the tab */}
            {activeTab === "home" && (
              <HomeScreen
                onStartDiagnosis={handleStartDiagnosis}
                onSelectModule={(moduleId) => {
                  setSelectedModuleId(moduleId);
                  setActiveTab("modules");
                }}
                completedLessonsCount={effectiveProgress.completedLessons.length}
                isPro={effectiveProgress.isPro}
                activeDays={effectiveProgress.activeDays}
                genesisResult={effectiveProgress.genesisResult}
                completedLessons={effectiveProgress.completedLessons}
                onViewResult={() => setActiveTab("result")}
              />
            )}

            {activeTab === "result" && effectiveProgress.genesisResult && (
              <ResultScreen
                result={effectiveProgress.genesisResult}
                isPro={effectiveProgress.isPro}
                onUpgradeClick={() => setBillingOpen(true)}
                onExploreLessons={() => setActiveTab("modules")}
              />
            )}

            {activeTab === "modules" && (
              <ModuleScreen
                selectedDayId={selectedModuleId}
                onSelectDay={setSelectedModuleId}
                isPro={effectiveProgress.isPro}
                completedLessons={effectiveProgress.completedLessons}
                onToggleLessonComplete={handleToggleLesson}
                onUpgradeClick={() => setBillingOpen(true)}
                genesisResult={effectiveProgress.genesisResult}
              />
            )}

            {activeTab === "profile" && (
              <ProfileScreen
                progress={effectiveProgress}
                onStartDiagnosis={handleStartDiagnosis}
                onUpgradeClick={() => setBillingOpen(true)}
                onTriggerAuth={() => setAuthOpen(true)}
                onLogout={handleLogout}
                onViewResult={() => setActiveTab("result")}
                onOpenAdmin={adminToken ? () => setIsAdminRoute(true) : undefined}
              />
            )}

            {activeTab === "pro" && (
              <div className="w-full flex flex-col space-y-6 pb-24 animate-fade-in font-sans">
                {/* Visual Pro detailing view */}
                <div className="bg-[#111B2E] brutal-border p-6 rounded-2xl text-center space-y-5">
                  <Sparkles className="text-[#38BDF8] w-12 h-12 mx-auto animate-pulse" />
                  
                  {!effectiveProgress.isPro ? (
                    <>
                      <div className="inline-block px-3.5 py-1 bg-[#2563EB]/20 border border-[#2563EB]/50 rounded-full text-[10px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider mb-1">
                        FALTA POUCO PARA SER PRO
                      </div>

                      <div>
                        <h3 className="text-base font-display font-black text-white uppercase tracking-tight">O MÉTODO GENESIS PRO</h3>
                        <p className="text-xs text-[#888888] mt-2 max-w-xs mx-auto leading-relaxed">
                          Sua jornada rumo à tração real. Elimine os bloqueios da inércia, construa disciplina diária e conquiste sua primeira vitória palpável.
                        </p>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-[#1E293B] text-left">
                        <div className="text-[10px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider mb-2">
                          O QUE VOCÊ GANHA NO GENESIS PRO:
                        </div>
                        {[
                          { t: "Jornada Completa de Desafios", d: "Acesso a todas as etapas de ação, diagnósticos práticos e métricas de evolução." },
                          { t: "Acompanhamento Guiado", d: "Análises e sugestões diárias para acelerar seu progresso sem travamento." },
                          { t: "Radar de Tração em Tempo Real", d: "Visualização gráfica e detalhada dos seus eixos de evolução." },
                          { t: "Comunidade VIP & Grupo de Tração", d: "Networking exclusivo com membros em execução acelerada." }
                        ].map((feat, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="w-5 h-5 bg-[#2563EB]/20 rounded border border-[#2563EB]/50 flex items-center justify-center text-[10px] font-bold text-[#38BDF8] shrink-0 mt-0.5">
                              ✓
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{feat.t}</h4>
                              <p className="text-[10px] text-[#888888]">{feat.d}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setBillingOpen(true)}
                        className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-glow-blue py-3.5 text-xs font-bold uppercase tracking-widest text-white rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
                      >
                        <span>APLICAR PROGRAMA AVANÇADO</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="inline-block px-3.5 py-1 bg-emerald-950/80 border border-emerald-500/50 rounded-full text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
                        SUA ASSINATURA PRO ESTÁ ATIVA ✓
                      </div>

                      <div>
                        <h3 className="text-base font-display font-black text-white uppercase tracking-tight">VOCÊ É MEMBRO GENESIS PRO</h3>
                        <p className="text-xs text-[#888888] mt-2 max-w-xs mx-auto leading-relaxed">
                          Seu plano avançado está ativo no seu perfil. Continue sua sequência de execução e acesse todos os desafios disponíveis.
                        </p>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-[#1E293B] text-left">
                        {[
                          { t: "Jornada Completa Liberada", d: "Acesso a todos os desafios práticos e etapas de ação." },
                          { t: "Radar de Tração em Tempo Real", d: "Métricas completas das 5 dimensões de evolução." }
                        ].map((feat, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="w-5 h-5 bg-emerald-500/20 rounded border border-emerald-500/50 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0 mt-0.5">
                              ✓
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{feat.t}</h4>
                              <p className="text-[10px] text-[#888888]">{feat.d}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveTab("modules")}
                        className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-glow-blue py-3.5 text-xs font-bold uppercase tracking-widest text-white rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
                      >
                        <span>AVANÇAR PARA OS DESAFIOS PRO</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Bottom Navigation Bar */}
      {!isDiagnosing && !isAdminRoute && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0B1220]/95 backdrop-blur-md border-t border-[#1E293B]/60 z-40 h-16">
          <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto h-full flex items-center justify-around px-2">
            {[
              { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
              { id: "modules", label: "Jornada", icon: <Flame className="w-5 h-5" /> },
              { id: "profile", label: "Perfil", icon: <UserRound className="w-5 h-5" /> },
              { id: "pro", label: "Pro", icon: <Sparkle className="w-5 h-5 text-glow-blue text-[#38BDF8]" /> }
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex flex-col items-center justify-center gap-1 py-1 px-4 cursor-pointer transition-all duration-150 ${
                    isSelected ? "text-[#38BDF8] font-bold scale-105" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {tab.icon}
                  <span className="text-[9px] uppercase tracking-wider font-mono font-bold leading-none">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Trigger Sync Authentic Modal Sheet */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Google Play Billing Sheet Modal */}
      <BillingModal
        isOpen={billingOpen}
        onClose={() => setBillingOpen(false)}
        onPurchaseSuccess={handleUpgradeSuccess}
      />

    </div>
  );
}
