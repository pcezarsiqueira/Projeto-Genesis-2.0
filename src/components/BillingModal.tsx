import { useState, useEffect, FormEvent } from "react";
import { Sparkles, Check, ChevronRight, ShieldAlert, ArrowLeft, AlertCircle, CreditCard, Lock, RefreshCw, QrCode } from "lucide-react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (type: "tracao" | "expansao") => void;
}

export default function BillingModal({ isOpen, onClose, onPurchaseSuccess }: BillingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"tracao" | "expansao">("tracao");
  const [purchaseStep, setPurchaseStep] = useState<"plans" | "checkout" | "success">("plans");
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoadingPref, setIsLoadingPref] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [brickError, setBrickError] = useState(false);
  const [mpPublicKey, setMpPublicKey] = useState<string>("");
  const [isMpInitialized, setIsMpInitialized] = useState(false);
  const [paymentMethodTab, setPaymentMethodTab] = useState<"card" | "pix">("card");

  // Fallback simulator state
  const [simCardName, setSimCardName] = useState("");
  const [simCardNumber, setSimCardNumber] = useState("");
  const [simCpf, setSimCpf] = useState("");
  const [pixCopied, setPixCopied] = useState(false);

  // Fetch Public Key from backend config
  useEffect(() => {
    async function loadMpConfig() {
      try {
        const res = await fetch("/api/genesis/config");
        const data = await res.json();
        const key = data.publicKey || (import.meta as any).env?.VITE_MERCADOPAGO_PUBLIC_KEY || "";
        if (key && !key.includes("seu-access-token") && !key.includes("sua-public-key")) {
          setMpPublicKey(key);
          console.log("[MercadoPago Config] Initializing SDK with key:", key.substring(0, 10) + "...");
          initMercadoPago(key, { locale: "pt-BR" });
          setIsMpInitialized(true);
        } else {
          console.warn("[MercadoPago Config] Placeholder or missing key detected. Using embedded form mode.");
          setIsMpInitialized(false);
          setBrickError(true);
        }
      } catch (e) {
        console.warn("[MercadoPago Config] Failed to fetch backend MP config:", e);
        setIsMpInitialized(false);
        setBrickError(true);
      }
    }

    if (isOpen) {
      loadMpConfig();
    }
  }, [isOpen]);

  // Guard observer: If Payment Brick container does not produce inputs or iframe after 1.5s, fall back to embedded form
  useEffect(() => {
    if (purchaseStep === "checkout" && isMpInitialized && !brickError) {
      const timer = setTimeout(() => {
        const container = document.getElementById("paymentBrick_container");
        const hasFormElements = container && (container.querySelectorAll("input, iframe, select, button, form").length > 0 || container.innerText.trim().length > 20);
        if (!container || !hasFormElements) {
          console.warn("[MercadoPago Brick Guard] Payment Brick failed to produce visible form elements. Activating in-app payment form.");
          setBrickError(true);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [purchaseStep, isMpInitialized, brickError]);

  if (!isOpen) return null;

  const currentPrice = selectedPlan === "expansao" ? 19.90 : 14.90;
  const currentTitle = selectedPlan === "expansao" 
    ? "Fase 3: Expansão (30 Dias) — Pagamento Único" 
    : "Fase 2: Tração (7 Dias) — Pagamento Único";

  const handleProceedToPayment = async () => {
    setIsLoadingPref(true);
    setErrorMessage(null);

    const saved = localStorage.getItem("genesis_user_data");
    let userEmail = "";
    let userName = "";
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        userEmail = parsed.email || "";
        userName = parsed.name || "";
      } catch (e) {}
    }

    try {
      const res = await fetch("/api/genesis/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          userEmail,
          userName
        })
      });
      const data = await res.json();
      console.log("[MercadoPago Preference Response]", data);
      if (data.preferenceId && data.preferenceId !== "sim_pref_123") {
        setPreferenceId(data.preferenceId);
      } else {
        setPreferenceId(null);
      }
    } catch (e) {
      console.warn("Could not fetch preference id:", e);
      setPreferenceId(null);
    } finally {
      setIsLoadingPref(false);
      setPurchaseStep("checkout");
    }
  };

  const handleBrickSubmit = async ({ formData }: any) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const saved = localStorage.getItem("genesis_user_data");
    let userEmail = "";
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        userEmail = parsed.email || "";
      } catch (e) {}
    }

    try {
      const res = await fetch("/api/genesis/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          plan: selectedPlan,
          userEmail,
          price: currentPrice
        })
      });
      const data = await res.json();

      if (data.status === "approved") {
        setPurchaseStep("success");
        onPurchaseSuccess(selectedPlan);
      } else {
        setErrorMessage(
          data.message || "Pagamento não aprovado. Verifique os dados do cartão e tente novamente."
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao comunicar com o servidor de pagamento.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatedSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    const saved = localStorage.getItem("genesis_user_data");
    let userEmail = "";
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        userEmail = parsed.email || "";
      } catch (e) {}
    }

    try {
      const res = await fetch("/api/genesis/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: {
            payment_method_id: paymentMethodTab === "pix" ? "pix" : "master",
            token: "simulated_token_123"
          },
          plan: selectedPlan,
          userEmail,
          price: currentPrice
        })
      });
      const data = await res.json();

      if (data.status === "approved") {
        setPurchaseStep("success");
        onPurchaseSuccess(selectedPlan);
      } else {
        setErrorMessage(data.message || "Transação não aprovada.");
      }
    } catch (err: any) {
      setErrorMessage("Erro ao processar transação.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    const fakePixCode = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2)}5204000053039865405${currentPrice.toFixed(2)}5802BR5920PROJETO GENESIS6009SAO PAULO62070503***6304`;
    navigator.clipboard.writeText(fakePixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleComplete = () => {
    onPurchaseSuccess(selectedPlan);
    setPurchaseStep("plans");
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center font-sans p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#111B2E] border border-[#1E293B] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 transition-all transform animate-slide-up max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl">
        
        {/* Top Handle Line */}
        <div className="w-12 h-1.5 bg-[#1E293B] rounded-full mx-auto mb-5" />

        {/* STEP 1: PLANS SELECTION */}
        {purchaseStep === "plans" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-[#38BDF8] w-5 h-5 animate-pulse" />
              <h2 className="text-xl font-display font-black tracking-tight text-[#F0F0F0]">
                DESBLOQUEIE A PRÓXIMA FASE
              </h2>
            </div>

            <p className="text-xs text-[#888888] mb-5 leading-relaxed">
              Escolha a etapa ideal para acelerar sua jornada anti-inércia. Todas as cobranças são pagamentos únicos (sem renovação automática).
            </p>

            {/* Benefits list */}
            <div className="space-y-3 mb-6 bg-[#0B1220] border border-[#1E293B] p-4 rounded-xl">
              {[
                { title: "Plano de Ação Imediato", desc: "Acesso direto aos desafios práticos desbloqueados" },
                { title: "Gráfico Radar de Tração", desc: "Acompanhe seus pilares de execução sem inércia" },
                { title: "Diagnósticos & Análises", desc: "Monitore sua evolução contínua na plataforma" }
              ].map((b, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <div className="w-4 h-4 rounded-full bg-[#2563EB]/20 flex items-center justify-center border border-[#2563EB]/40 mt-0.5 shrink-0">
                    <Check className="text-[#38BDF8] w-2.5 h-2.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#F0F0F0]">{b.title}</h4>
                    <p className="text-[10px] text-[#888888]">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Options */}
            <div className="space-y-3 mb-6">
              {/* Option 1: Phase 2 Tração */}
              <button
                type="button"
                onClick={() => setSelectedPlan("tracao")}
                className={`w-full p-4 rounded-xl text-left border transition-all relative cursor-pointer flex justify-between items-center ${
                  selectedPlan === "tracao"
                    ? "border-[#2563EB] bg-[#2563EB]/10 text-glow-blue shadow-[0_0_15px_rgba(37,99,235,0.25)]"
                    : "border-[#1E293B] bg-[#0B1220] hover:bg-[#162238]"
                }`}
              >
                <div>
                  <div className="text-[9px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
                    FASE 2 — TRAÇÃO (7 DIAS)
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    Desbloqueie os Dias 4 ao 10
                  </div>
                  <p className="text-[10px] text-[#888888] mt-1">
                    Pagamento único • Acesso a 7 dias táticos.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-white font-mono">
                    R$ 14,90
                  </div>
                  <div className="text-[9px] text-emerald-400 font-bold uppercase font-mono">
                    Pagamento Único
                  </div>
                </div>
              </button>

              {/* Option 2: Phase 3 Expansão */}
              <button
                type="button"
                onClick={() => setSelectedPlan("expansao")}
                className={`w-full p-4 rounded-xl text-left border transition-all relative cursor-pointer flex justify-between items-center ${
                  selectedPlan === "expansao"
                    ? "border-[#2563EB] bg-[#2563EB]/10 text-glow-blue shadow-[0_0_15px_rgba(37,99,235,0.25)]"
                    : "border-[#1E293B] bg-[#0B1220] hover:bg-[#162238]"
                }`}
              >
                <span className="absolute -top-2 right-3 px-2 py-0.5 bg-[#2563EB] text-[8px] font-mono font-bold text-white rounded uppercase tracking-widest">
                  30 DIAS DE ACESSO
                </span>
                <div>
                  <div className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    FASE 3 — EXPANSÃO (30 DIAS)
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    Acesso Completo Contínuo
                  </div>
                  <p className="text-[10px] text-[#888888] mt-1">
                    Pagamento único • 30 dias de acompanhamento.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-white font-mono">
                    R$ 19,90
                  </div>
                  <div className="text-[9px] text-amber-400 font-bold uppercase font-mono">
                    Pagamento Único
                  </div>
                </div>
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={isLoadingPref}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 transition-all py-3.5 text-xs font-bold uppercase tracking-widest text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-glow-blue shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-70"
              >
                <span>{isLoadingPref ? "PREPARANDO CHECKOUT..." : `PAGAR R$ ${currentPrice.toFixed(2).replace(".", ",")} NO APP`}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-transparent hover:bg-[#1E293B] border border-[#1E293B] py-3 text-xs font-semibold text-[#888888] rounded-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Continuar na Versão Gratuita
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: EMBEDDED CHECKOUT BRICKS */}
        {purchaseStep === "checkout" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setPurchaseStep("plans")}
              className="inline-flex items-center gap-1.5 text-xs text-[#888888] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para escolha de planos</span>
            </button>

            {/* Selected Summary Badge */}
            <div className="bg-[#0B1220] border border-[#2563EB]/40 p-3.5 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider block">
                  ITEM SELECIONADO (PAGAMENTO ÚNICO)
                </span>
                <span className="text-xs font-bold text-white">{currentTitle}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black font-mono text-emerald-400">
                  R$ {currentPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="bg-red-950/90 border border-red-600/80 text-red-200 text-xs font-mono p-3 rounded-xl flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Aviso no Pagamento:</p>
                  <p className="text-[11px] opacity-90">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Embedded Payment Area */}
            <div className="bg-[#0B1220] border border-[#1E293B] p-4 rounded-xl min-h-[280px]">
              {isMpInitialized && !brickError && (
                <div className="w-full">
                  <p className="text-[10px] font-mono text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#38BDF8]" />
                    Checkout Seguro Mercado Pago (Embutido no App)
                  </p>

                  <Payment
                    initialization={
                      (preferenceId
                        ? { preferenceId, amount: currentPrice }
                        : { amount: currentPrice }) as any
                    }
                    customization={{
                      paymentMethods: {
                        creditCard: "all",
                        debitCard: "all",
                        ticket: "all",
                        bankTransfer: "all",
                        mercadoPago: "all"
                      }
                    }}
                    onSubmit={handleBrickSubmit}
                    onError={(err) => {
                      console.warn("[MercadoPago Brick onError Triggered]:", err);
                      setBrickError(true);
                    }}
                    onReady={() => {
                      console.log("[MercadoPago Brick Ready]");
                    }}
                  />
                </div>
              )}

              {/* Direct In-App Form Fallback when Mercado Pago SDK is offline or non-responsive */}
              {(!isMpInitialized || brickError) && (
                <div className="space-y-4 animate-fade-in">
                  {/* Payment Method Selector Tabs */}
                  <div className="flex border-b border-[#1E293B]">
                    <button
                      type="button"
                      onClick={() => setPaymentMethodTab("card")}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
                        paymentMethodTab === "card"
                          ? "border-[#2563EB] text-[#38BDF8]"
                          : "border-transparent text-zinc-400 hover:text-white"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Cartão de Crédito</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethodTab("pix")}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
                        paymentMethodTab === "pix"
                          ? "border-[#2563EB] text-[#38BDF8]"
                          : "border-transparent text-zinc-400 hover:text-white"
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Pix Instantâneo</span>
                    </button>
                  </div>

                  {paymentMethodTab === "card" && (
                    <form onSubmit={handleSimulatedSubmit} className="space-y-3.5">
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Insira os dados do cartão para pagar <strong className="text-white">R$ {currentPrice.toFixed(2).replace(".", ",")}</strong> (pagamento único).
                      </p>

                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                          NOME NO CARTÃO
                        </label>
                        <input
                          type="text"
                          required
                          value={simCardName}
                          onChange={(e) => setSimCardName(e.target.value)}
                          placeholder="NOME COMO CONSTA NO CARTÃO"
                          className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                          NÚMERO DO CARTÃO
                        </label>
                        <input
                          type="text"
                          required
                          value={simCardNumber}
                          onChange={(e) => setSimCardNumber(e.target.value)}
                          placeholder="0000 0000 0000 0000"
                          className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                            VALIDADE
                          </label>
                          <input
                            type="text"
                            placeholder="MM/AA"
                            required
                            className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                            CVV
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            required
                            className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 transition-all py-3.5 text-xs font-bold uppercase tracking-widest text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-glow-blue shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-70 mt-4"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>PROCESSANDO...</span>
                          </>
                        ) : (
                          <span>CONFIRMAR PAGAMENTO DE R$ {currentPrice.toFixed(2).replace(".", ",")}</span>
                        )}
                      </button>
                    </form>
                  )}

                  {paymentMethodTab === "pix" && (
                    <div className="space-y-4 text-center py-2">
                      <div className="p-4 bg-white rounded-xl w-40 h-40 mx-auto flex items-center justify-center border border-[#1E293B]">
                        <QrCode className="w-32 h-32 text-slate-900" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white">Chave Pix Copia e Cola</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Valor: <span className="text-emerald-400 font-mono font-bold">R$ {currentPrice.toFixed(2).replace(".", ",")}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="w-full bg-[#1E293B] hover:bg-[#2563EB] text-white py-2.5 text-xs font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer border border-[#1E293B]"
                      >
                        {pixCopied ? "✓ CHAVE PIX COPIADA!" : "COPIAR CÓDIGO PIX"}
                      </button>

                      <button
                        type="button"
                        onClick={handleSimulatedSubmit}
                        disabled={isProcessing}
                        className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] py-3 text-xs font-bold uppercase tracking-widest text-white rounded-xl cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                      >
                        {isProcessing ? "CONFIRMANDO PIX..." : "JÁ FIZ O PAGAMENTO PIX"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {purchaseStep === "success" && (
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center rounded-full mx-auto shadow-lg animate-scale-up">
              <Check className="text-emerald-400 w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-display font-black uppercase tracking-tight text-white">
                PAGAMENTO CONFIRMADO!
              </h3>
              <p className="text-xs text-[#888888] mt-1.5 max-w-xs mx-auto leading-relaxed">
                Acesso liberado com sucesso. Todos os conteúdos e desafios da <span className="text-[#38BDF8] font-bold">{currentTitle}</span> foram ativados no seu perfil.
              </p>
            </div>

            <button
              type="button"
              onClick={handleComplete}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] py-3.5 text-xs font-bold text-white rounded-xl transition-all uppercase tracking-widest cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              ACESSAR CONTEÚDO LIBERADO
            </button>
          </div>
        )}

        {/* Bottom Security Footer */}
        <div className="mt-6 pt-3 border-t border-[#1E293B] flex items-center justify-between text-[8px] text-zinc-500 font-sans">
          <span>Checkout Bricks Embutido • Mercado Pago</span>
          <span className="flex items-center gap-1"><ShieldAlert className="w-2.5 h-2.5" /> Transações 100% Criptografadas</span>
        </div>
      </div>
    </div>
  );
}
