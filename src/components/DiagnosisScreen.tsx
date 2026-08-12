/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ArrowLeft,
  Timer,
  AlertCircle,
  Cpu,
  User,
  Mail,
  Phone,
  Instagram,
  Linkedin,
  Lock,
} from "lucide-react";
import { GENESIS_25_QUESTIONS } from "../data/genesisQuizData";
import { GenesisDiagnosticResult } from "../types";

interface DiagnosisScreenProps {
  onBack: () => void;
  onAnalysisComplete: (result: GenesisDiagnosticResult) => void;
}

export default function DiagnosisScreen({
  onBack,
  onAnalysisComplete,
}: DiagnosisScreenProps) {
  // Current screen mode: 'questionnaire' | 'lead_capture' | 'calculating'
  const [screenMode, setScreenMode] = useState<
    "questionnaire" | "lead_capture" | "calculating"
  >("questionnaire");

  // Question navigation state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [rawAnswers, setRawAnswers] = useState<number[]>(Array(25).fill(0));
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Lead capture state
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadInstagram, setLeadInstagram] = useState("");
  const [leadLinkedin, setLeadLinkedin] = useState("");
  const [interestTag, setInterestTag] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [communicationConsent, setCommunicationConsent] = useState(true);

  // Errors & Loading
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentQuestion = GENESIS_25_QUESTIONS[currentIdx];
  const progressPercent = ((currentIdx + 1) / 25) * 100;

  const ratings = [
    { value: 1, label: "Discordo Totalmente", desc: "Não se aplica em nada ao meu comportamento." },
    { value: 2, label: "Discordo Parcialmente", desc: "Raramente reflito ou ajo dessa maneira." },
    { value: 3, label: "Neutro / Às vezes", desc: "Ocorre esporadicamente dependendo do contexto." },
    { value: 4, label: "Concordo Parcialmente", desc: "Acontece com frequência considerável na minha rotina." },
    { value: 5, label: "Concordo Totalmente", desc: "Define perfeitamente minha realidade e padrão de ação." },
  ];

  const handleSelectRating = (val: number) => {
    setSelectedRating(val);
    setErrorMsg(null);

    // Auto-advance upon tapping rating
    const updated = [...rawAnswers];
    updated[currentIdx] = val;
    setRawAnswers(updated);

    setTimeout(() => {
      if (currentIdx < GENESIS_25_QUESTIONS.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setSelectedRating(updated[currentIdx + 1] || null);
        setErrorMsg(null);
      } else {
        // Reached end of 25 questions -> move to Lead Capture Screen
        setScreenMode("lead_capture");
        setErrorMsg(null);
      }
    }, 150);
  };

  const handleNextQuestion = () => {
    if (selectedRating === null) {
      setErrorMsg("Por favor, selecione uma opção para continuar.");
      return;
    }

    const updated = [...rawAnswers];
    updated[currentIdx] = selectedRating;
    setRawAnswers(updated);

    if (currentIdx < GENESIS_25_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedRating(rawAnswers[currentIdx + 1] || null);
      setErrorMsg(null);
    } else {
      setScreenMode("lead_capture");
      setErrorMsg(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setSelectedRating(rawAnswers[currentIdx - 1] || null);
      setErrorMsg(null);
    } else {
      onBack();
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!leadName.trim()) {
      setErrorMsg("Por favor, informe seu nome completo.");
      return;
    }
    if (!leadEmail.trim() || !leadEmail.includes("@")) {
      setErrorMsg("Por favor, informe um e-mail válido.");
      return;
    }
    if (!leadPhone.trim() || leadPhone.length < 8) {
      setErrorMsg("Por favor, informe um número de Telefone/WhatsApp válido.");
      return;
    }
    if (!leadInstagram.trim()) {
      setErrorMsg("Por favor, informe seu usuário do Instagram.");
      return;
    }
    if (!privacyConsent) {
      setErrorMsg("Você precisa autorizar os termos de privacidade para gerar seu diagnóstico.");
      return;
    }

    // Switch to calculation state and trigger backend calculation
    setScreenMode("calculating");

    try {
      const response = await fetch("/api/genesis/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawAnswers,
          lead: {
            name: leadName.trim(),
            email: leadEmail.trim(),
            phone: leadPhone.trim(),
            instagram: leadInstagram.trim(),
            linkedin: leadLinkedin.trim(),
            interestTag: interestTag || undefined,
          },
          privacyConsent,
          communicationConsent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro de conexão ao calcular diagnóstico.");
      }

      const data = await response.json();

      if (data.success && data.result) {
        // Pass result to parent component
        onAnalysisComplete(data.result);
      } else {
        throw new Error(data.error || "Falha ao processar o resultado do Diagnóstico.");
      }
    } catch (err: any) {
      console.error("Error submitting Genesis Diagnosis:", err);
      setErrorMsg(err.message || "Ocorreu um erro ao gerar seu diagnóstico. Tente novamente.");
      setScreenMode("lead_capture");
    }
  };

  // Fast Track backdoor for easy testing
  const handleFastTrackDiagnosis = () => {
    const mockAnswers = GENESIS_25_QUESTIONS.map(() => Math.floor(Math.random() * 5) + 1);
    setRawAnswers(mockAnswers);
    setLeadName("Carlos Silva");
    setLeadEmail("carlos.teste@example.com");
    setLeadPhone("11999998888");
    setLeadInstagram("@carlossilva_oficial");
    setPrivacyConsent(true);
    setSelectedRating(3);
    setScreenMode("lead_capture");
  };

  // --- SCREEN MODE 3: CALCULATING ANIMATION ---
  if (screenMode === "calculating") {
    return (
      <div className="absolute inset-0 z-40 bg-[#0B1220] flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in text-center font-sans">
        <div className="relative w-36 h-36 border border-[#1E293B] bg-[#111B2E] overflow-hidden rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.25)]">
          <div className="absolute left-0 w-full h-[3px] bg-[#38BDF8] shadow-[0_0_20px_#38BDF8] animate-[scan_2s_ease-in-out_infinite]" />
          <Cpu className="w-14 h-14 text-[#38BDF8] animate-pulse" />
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#F0F0F0]">
            DECODIFICANDO SEU ÍNDICE GÊNESIS
          </h3>
          <p className="text-[11px] text-[#888888] max-w-xs leading-relaxed">
            Cruzando suas 25 respostas entre as 5 dimensões de ação e mapeando o seu estágio de inércia...
          </p>
        </div>

        <div className="px-5 py-4 bg-[#111B2E] border border-[#1E293B] rounded-xl text-left text-[10px] font-mono text-[#888888] space-y-2.5 w-72 shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">● Corrigindo Questões Invertidas</span>
            <span className="text-emerald-400 font-bold">OK</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">● Mapeando Pontuação de Dimensões</span>
            <span className="text-emerald-400 font-bold">OK</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">● Mapeando Estágio do Momento</span>
            <span className="text-[#38BDF8] font-bold animate-pulse">CALCULANDO</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">● Estruturando Projeções (3, 7, 21d)</span>
            <span className="text-[#38BDF8] font-bold animate-pulse">GERANDO</span>
          </div>
          <div className="h-1 bg-[#0B1220] rounded-full overflow-hidden mt-1">
            <div className="h-full bg-[#2563EB] w-4/5 animate-[width_2.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  // --- SCREEN MODE 2: LEAD CAPTURE ---
  if (screenMode === "lead_capture") {
    return (
      <div className="w-full h-full flex flex-col justify-between py-4 animate-fade-in font-sans overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setScreenMode("questionnaire")}
              className="flex items-center gap-1.5 text-xs font-bold text-[#888888] hover:text-[#F0F0F0] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>VOLTAR ÀS QUESTÕES</span>
            </button>
            <div className="flex items-center gap-1.5 text-[9px] text-[#38BDF8] bg-[#1E3A8A]/30 border border-[#2563EB]/40 px-3 py-1 rounded-full font-mono font-bold">
              <Lock className="w-3 h-3" />
              <span>DADOS SEGUROS & CRIPTOGRAFADOS</span>
            </div>
          </div>

          <div className="bg-[#111B2E] border border-[#1E293B] p-5 rounded-2xl mb-5 space-y-2">
            <div className="inline-block px-2.5 py-0.5 rounded bg-[#2563EB]/20 border border-[#2563EB]/40 text-[9px] font-mono text-[#38BDF8] uppercase font-bold tracking-wider">
              Último Passo Antes do Seu Resultado
            </div>
            <h2 className="text-base font-display font-bold text-[#F0F0F0]">
              Onde devemos enviar e salvar o seu Mapa Gênesis?
            </h2>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              Preencha os dados abaixo para vincular seu diagnóstico de inércia ao seu perfil e acessar sua projeção de resultados nos 3 primeiros dias.
            </p>
          </div>

          {/* Lead Form */}
          <form onSubmit={handleLeadSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">
                Nome Completo <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] text-[#F0F0F0] text-xs rounded-xl pl-10 pr-3.5 py-3 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">
                Seu Melhor E-mail <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] text-[#F0F0F0] text-xs rounded-xl pl-10 pr-3.5 py-3 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">
                Telefone / WhatsApp <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] text-[#F0F0F0] text-xs rounded-xl pl-10 pr-3.5 py-3 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-mono uppercase text-[#888888] mb-1">
                  Instagram <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Instagram className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="@seuusuario"
                    value={leadInstagram}
                    onChange={(e) => setLeadInstagram(e.target.value)}
                    className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] text-[#F0F0F0] text-xs rounded-xl pl-8 pr-2 py-2.5 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase text-[#888888] mb-1">
                  LinkedIn <span className="text-zinc-500">(Opcional)</span>
                </label>
                <div className="relative">
                  <Linkedin className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="linkedin.com/in/voce"
                    value={leadLinkedin}
                    onChange={(e) => setLeadLinkedin(e.target.value)}
                    className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] text-[#F0F0F0] text-xs rounded-xl pl-8 pr-2 py-2.5 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Optional Segmentation Question */}
            <div className="p-3.5 bg-[#0B1220] border border-[#1E293B] rounded-xl space-y-2">
              <label className="block text-[10px] font-mono uppercase text-[#38BDF8] font-bold">
                O que você mais quer recuperar com esse tempo? <span className="text-zinc-500 font-normal">(Opcional)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  "Mais presença com quem eu amo",
                  "Avançar na carreira",
                  "Transformar o que eu sei em renda",
                  "Ainda não sei"
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setInterestTag(interestTag === option ? "" : option)}
                    className={`text-left p-2.5 rounded-lg border text-[10px] font-sans font-medium transition-all cursor-pointer flex items-center justify-between ${
                      interestTag === option
                        ? "bg-[#2563EB]/20 border-[#2563EB] text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                        : "bg-[#111B2E] border-[#1E293B] text-[#888888] hover:border-zinc-700 hover:text-[#F0F0F0]"
                    }`}
                  >
                    <span>{option}</span>
                    {interestTag === option && (
                      <span className="w-2 h-2 bg-[#38BDF8] rounded-full shrink-0 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="pt-2 space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#1E293B] bg-[#111B2E] accent-[#2563EB] cursor-pointer"
                />
                <span className="text-[10px] text-[#888888] leading-tight">
                  <strong className="text-white">Obrigatório:</strong> Autorizo o tratamento dos meus dados para gerar e salvar meu diagnóstico de acordo com a Política de Privacidade.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={communicationConsent}
                  onChange={(e) => setCommunicationConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#1E293B] bg-[#111B2E] accent-[#2563EB] cursor-pointer"
                />
                <span className="text-[10px] text-[#888888] leading-tight">
                  <strong className="text-zinc-300">Opcional:</strong> Aceito receber conteúdos, lembretes de acompanhamento e atualizações do Projeto Gênesis por e-mail e WhatsApp.
                </span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-[10px] rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-glow-blue py-3.5 text-[11px] font-bold uppercase tracking-widest text-white rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.35)] mt-2"
            >
              Gerar Meu Mapa Gênesis Agora
            </button>
          </form>
        </div>

        <p className="text-[9px] text-[#666666] text-center mt-3">
          Seus dados estão protegidos sob a LGPD. Nenhuma informação pessoal é armazenada no seu navegador.
        </p>
      </div>
    );
  }

  // --- SCREEN MODE 1: QUESTIONNAIRE FLOW (1 question per screen) ---
  return (
    <div className="w-full h-full flex flex-col justify-between py-4 animate-fade-in font-sans">
      {/* Header controls & Progress */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePreviousQuestion}
            className="flex items-center gap-1.5 text-xs font-bold text-[#888888] hover:text-[#F0F0F0] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentIdx === 0 ? "SAIR" : "VOLTAR"}</span>
          </button>
          <div className="flex items-center gap-1.5 text-[10px] text-[#888888] bg-[#111B2E] border border-[#1E293B] px-3.5 py-1.5 rounded-lg font-mono">
            <Timer className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>PERGUNTA {currentIdx + 1} DE 25</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#111B2E] h-[3px] rounded-full overflow-hidden mb-5 border-b border-[#1E293B]/30">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-[#38BDF8] transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
          />
        </div>

        {/* Dimension Badge */}
        <div className="mb-3 flex justify-between items-center">
          <div className="inline-block px-2.5 py-1 rounded bg-[#111B2E] border border-[#1E293B] text-[9px] font-mono tracking-widest text-[#38BDF8] uppercase font-bold">
            Dimensão {Math.floor(currentIdx / 5) + 1}: {currentQuestion.dimensaoNome}
          </div>
          <span className="text-[9px] font-mono text-[#888888]">
            {Math.round(progressPercent)}% concluído
          </span>
        </div>

        {/* Question Statement Card */}
        <div className="bg-[#111B2E] border border-[#1E293B] p-5.5 rounded-2xl space-y-3 shadow-xl relative overflow-hidden min-h-[130px] flex flex-col justify-center">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2563EB]" />
          <p className="text-sm font-display font-medium text-[#F0F0F0] leading-relaxed select-none pl-2">
            "{currentQuestion.texto}"
          </p>
        </div>
      </div>

      {/* Rating Options */}
      <div className="space-y-2 my-4">
        <p className="text-[10px] uppercase font-mono tracking-wider text-[#888888] text-center mb-1">
          Selecione o quanto esta afirmação descreve você:
        </p>

        <div className="space-y-2">
          {ratings.map((rate) => {
            const isSelected = selectedRating === rate.value;
            return (
              <button
                key={rate.value}
                onClick={() => handleSelectRating(rate.value)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 active:scale-99.5 flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? "border-[#2563EB] bg-[#2563EB]/15 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                    : "border-[#1E293B] bg-[#111B2E] hover:bg-[#162238]"
                }`}
              >
                <div className="flex items-center gap-3 w-11/12">
                  <div
                    className={`w-6 h-6 shrink-0 rounded-full border text-[11px] font-bold flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-[#38BDF8] bg-[#2563EB] text-white shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                        : "border-[#1E293B] bg-[#0B1220] text-[#888888]"
                    }`}
                  >
                    {rate.value}
                  </div>
                  <div>
                    <h5
                      className={`text-xs font-bold transition-all ${
                        isSelected ? "text-white" : "text-[#888888]"
                      }`}
                    >
                      {rate.label}
                    </h5>
                    <p className="text-[9px] text-[#666666] line-clamp-1">
                      {rate.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer Navigation */}
      <div className="border-t border-[#1E293B] pt-4 flex items-center justify-between">
        <button
          onClick={handlePreviousQuestion}
          className="flex items-center gap-1.5 text-xs font-bold text-[#888888] hover:text-[#F0F0F0] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentIdx === 0 ? "SAIR DO QUIZ" : "VOLTAR À PERGUNTA ANTERIOR"}</span>
        </button>

        <button
          onClick={handleFastTrackDiagnosis}
          className="text-[9px] font-mono text-zinc-600 hover:text-[#38BDF8] uppercase tracking-widest transition-colors"
          title="Atalho de simulação de preenchimento rápido"
        >
          [ Simulação Rápida ]
        </button>
      </div>

      {errorMsg && (
        <div className="mt-2 p-2.5 bg-red-950/30 border border-red-900 text-red-400 text-[10px] rounded-lg flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
