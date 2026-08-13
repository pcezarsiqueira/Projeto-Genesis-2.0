import { useState, useEffect, FormEvent } from "react";
import { Sparkles, Check, ChevronRight, ShieldAlert, ArrowLeft, AlertCircle, Lock, QrCode, CreditCard, Zap, Copy } from "lucide-react";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (type: "tracao" | "expansao") => void;
}

function detectCardBrand(number: string): string {
  const clean = number.replace(/\D/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(clean)) return "master";
  if (/^3[47]/.test(clean)) return "amex";
  if (/^(6011|65|64[4-9]|622)/.test(clean)) return "discover";
  if (/^(50|67|58|63)/.test(clean)) return "maestro";
  if (/^(4011|4389|4514|4576|5041|5066|5090|6277|6362|6363)/.test(clean)) return "elo";
  return "master";
}

export default function BillingModal({ isOpen, onClose, onPurchaseSuccess }: BillingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"tracao" | "expansao">("tracao");
  const [purchaseStep, setPurchaseStep] = useState<"plans" | "checkout" | "success">("plans");
  const [activePaymentTab, setActivePaymentTab] = useState<"card" | "pix">("card");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mpPublicKey, setMpPublicKey] = useState<string>("");

  // Custom Form Fields matching exact user design
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cpf, setCpf] = useState("");

  // Pix Result Output
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64?: string } | null>(null);
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
        }
      } catch (e) {
        console.warn("[MercadoPago Config] Failed to fetch config:", e);
      }
    }

    if (isOpen) {
      loadMpConfig();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPrice = selectedPlan === "expansao" ? 19.90 : 14.90;

  const handleProceedToPayment = () => {
    setErrorMessage(null);
    setPixData(null);
    setPurchaseStep("checkout");
  };

  const handleCardSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    const cleanCardNumber = cardNumber.replace(/\D/g, "");
    const cleanCpf = cpf.replace(/\D/g, "");

    if (!cardName.trim()) {
      setErrorMessage("Informe o nome como consta no cartão.");
      setIsProcessing(false);
      return;
    }

    if (cleanCardNumber.length < 13) {
      setErrorMessage("Número de cartão inválido.");
      setIsProcessing(false);
      return;
    }

    const [expMonthStr, expYearStr] = cardExpiry.split("/").map(s => s.trim());
    const month = parseInt(expMonthStr, 10);
    let year = parseInt(expYearStr, 10);
    if (year < 100) year += 2000;

    if (isNaN(month) || month < 1 || month > 12 || isNaN(year) || year < 2024) {
      setErrorMessage("Data de validade inválida. Use o formato MM/AA.");
      setIsProcessing(false);
      return;
    }

    if (!cardCvv || cardCvv.trim().length < 3) {
      setErrorMessage("CVV inválido.");
      setIsProcessing(false);
      return;
    }

    if (cleanCpf.length < 11) {
      setErrorMessage("Informe um CPF válido com 11 dígitos.");
      setIsProcessing(false);
      return;
    }

    const saved = localStorage.getItem("genesis_user_data");
    let userEmail = "";
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        userEmail = parsed.email || "";
      } catch (err) {}
    }

    try {
      let tokenId = "";
      if (mpPublicKey) {
        const tokenRes = await fetch(`https://api.mercadopago.com/v1/card_tokens?public_key=${mpPublicKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            card_number: cleanCardNumber,
            cardholder: {
              name: cardName,
              identification: {
                type: "CPF",
                number: cleanCpf
              }
            },
            security_code: cardCvv.trim(),
            expiration_month: month,
            expiration_year: year
          })
        });

        const tokenData = await tokenRes.json();
        if (tokenData.id) {
          tokenId = tokenData.id;
        } else {
          console.warn("[MP Tokenization Error]:", tokenData);
          let msg = "Não foi possível validar o cartão de crédito.";
          if (tokenData.cause && Array.isArray(tokenData.cause) && tokenData.cause[0]?.description) {
            msg = tokenData.cause[0].description;
          } else if (tokenData.message) {
            msg = tokenData.message;
          }
          setErrorMessage(msg);
          setIsProcessing(false);
          return;
        }
      }

      const paymentRes = await fetch("/api/genesis/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: {
            token: tokenId,
            payment_method_id: detectCardBrand(cleanCardNumber),
            installments: 1,
            payer: {
              email: userEmail || "membro@projetogenesis.com",
              identification: {
                type: "CPF",
                number: cleanCpf
              }
            }
          },
          plan: selectedPlan,
          userEmail,
          price: currentPrice
        })
      });

      const data = await paymentRes.json();
      if (data.status === "approved") {
        setPurchaseStep("success");
        onPurchaseSuccess(selectedPlan);
      } else {
        setErrorMessage(data.message || "Pagamento não aprovado pela operadora do cartão.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao comunicar com o servidor de pagamento.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGeneratePix = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length < 11) {
      setErrorMessage("Por favor, informe um CPF válido de 11 dígitos para gerar o Pix.");
      setIsProcessing(false);
      return;
    }

    const saved = localStorage.getItem("genesis_user_data");
    let userEmail = "";
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        userEmail = parsed.email || "";
      } catch (err) {}
    }

    try {
      const res = await fetch("/api/genesis/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: {
            payment_method_id: "pix",
            payer: {
              email: userEmail || "membro@projetogenesis.com",
              identification: {
                type: "CPF",
                number: cleanCpf
              }
            }
          },
          plan: selectedPlan,
          userEmail,
          price: currentPrice
        })
      });

      const data = await res.json();
      if (data.pixQrCode || data.pixQrCodeBase64) {
        setPixData({
          qrCode: data.pixQrCode,
          qrCodeBase64: data.pixQrCodeBase64
        });
      } else if (data.status === "approved") {
        setPurchaseStep("success");
        onPurchaseSuccess(selectedPlan);
      } else {
        setErrorMessage(data.message || "Não foi possível gerar a chave Pix. Tente novamente.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao gerar chave Pix no servidor.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const handleComplete = () => {
    onPurchaseSuccess(selectedPlan);
    setPurchaseStep("plans");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center font-sans p-3 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#111B2E] border border-[#1E293B] rounded-2xl p-4 sm:p-5 transition-all transform animate-scale-up max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3 border-b border-[#1E293B] pb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="text-[#38BDF8] w-4 h-4 animate-pulse" />
            <span className="text-xs font-display font-black tracking-tight text-white uppercase">
              PROJETO GENESIS PRO
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 bg-[#0B1220] border border-[#1E293B] hover:bg-[#1E293B] rounded-lg text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            title="Fechar"
          >
            ✕
          </button>
        </div>

        {/* STEP 1: PLANS SELECTION */}
        {purchaseStep === "plans" && (
          <div className="space-y-3.5">
            <div>
              <h2 className="text-base font-display font-black tracking-tight text-[#F0F0F0] uppercase">
                DESBLOQUEIE A PRÓXIMA FASE
              </h2>
              <p className="text-[11px] text-[#888888] mt-0.5 leading-relaxed">
                Acelere sua jornada anti-inércia. Pagamento único (sem assinatura recorrente).
              </p>
            </div>

            {/* Compact Benefits list */}
            <div className="grid grid-cols-1 gap-1.5 bg-[#0B1220] border border-[#1E293B] p-2.5 rounded-xl text-[11px]">
              {[
                "Plano de Ação Imediato com desafios práticos",
                "Gráfico Radar de Tração para medir evolução",
                "Acompanhamento tático contínuo sem travamentos"
              ].map((text, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB]/20 flex items-center justify-center border border-[#2563EB]/40 shrink-0">
                    <Check className="text-[#38BDF8] w-2.5 h-2.5" />
                  </div>
                  <span className="text-zinc-300 text-[10px] font-medium">{text}</span>
                </div>
              ))}
            </div>

            {/* Pricing Options */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedPlan("tracao")}
                className={`w-full p-3 rounded-xl text-left border transition-all relative cursor-pointer flex justify-between items-center ${
                  selectedPlan === "tracao"
                    ? "border-[#2563EB] bg-[#2563EB]/10 text-glow-blue shadow-[0_0_12px_rgba(37,99,235,0.25)]"
                    : "border-[#1E293B] bg-[#0B1220] hover:bg-[#162238]"
                }`}
              >
                <div>
                  <div className="text-[9px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
                    FASE 2 — TRAÇÃO (7 DIAS)
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    Desbloqueie os Dias 4 ao 10
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-black text-white font-mono">
                    R$ 14,90
                  </div>
                  <div className="text-[8px] text-emerald-400 font-bold uppercase font-mono">
                    Pagamento Único
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("expansao")}
                className={`w-full p-3 rounded-xl text-left border transition-all relative cursor-pointer flex justify-between items-center ${
                  selectedPlan === "expansao"
                    ? "border-[#2563EB] bg-[#2563EB]/10 text-glow-blue shadow-[0_0_12px_rgba(37,99,235,0.25)]"
                    : "border-[#1E293B] bg-[#0B1220] hover:bg-[#162238]"
                }`}
              >
                <span className="absolute -top-2 right-3 px-1.5 py-0.5 bg-[#2563EB] text-[7px] font-mono font-bold text-white rounded uppercase tracking-wider">
                  30 DIAS DE ACESSO
                </span>
                <div>
                  <div className="text-[9px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
                    FASE 3 — EXPANSÃO (30 DIAS)
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    Acesso Completo Contínuo
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-black text-white font-mono">
                    R$ 19,90
                  </div>
                  <div className="text-[8px] text-amber-400 font-bold uppercase font-mono">
                    Pagamento Único
                  </div>
                </div>
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 transition-all py-3 text-xs font-bold uppercase tracking-widest text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-glow-blue shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              >
                <span>IR PARA CHECKOUT — R$ {currentPrice.toFixed(2).replace(".", ",")}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-transparent hover:bg-[#1E293B] py-2 text-[10px] font-medium text-zinc-400 rounded-lg transition-all uppercase tracking-wider cursor-pointer"
              >
                Continuar na Versão Gratuita
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CUSTOM CHECKOUT FORM (Exact layout from reference image) */}
        {purchaseStep === "checkout" && (
          <div className="space-y-4">
            {/* Top Back Link */}
            <button
              type="button"
              onClick={() => {
                setPurchaseStep("plans");
                setErrorMessage(null);
                setPixData(null);
              }}
              className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
              <span>Voltar para escolha de planos</span>
            </button>

            {/* Selected Item Summary Banner */}
            <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
                  ITEM SELECIONADO (PAGAMENTO ÚNICO)
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                  {selectedPlan === "expansao"
                    ? "Fase 3: Expansão (30 Dias) — Pagamento Único"
                    : "Fase 2: Tração (7 Dias) — Pagamento Único"}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-base sm:text-lg font-mono font-black text-[#10B981]">
                  R$ {currentPrice.toFixed(2).replace(".", ",")}
                </div>
              </div>
            </div>

            {/* Main Form Container */}
            <div className="bg-[#0B1220] border border-[#1E293B] rounded-2xl p-4 sm:p-5 space-y-4">
              
              {/* Tabs: CARTÃO DE CRÉDITO vs PIX INSTANTÂNEO */}
              <div className="flex border-b border-[#1E293B] relative">
                <button
                  type="button"
                  onClick={() => {
                    setActivePaymentTab("card");
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-3 text-center text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 -mb-px ${
                    activePaymentTab === "card"
                      ? "border-[#2563EB] text-[#38BDF8]"
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#38BDF8]" />
                  <span>CARTÃO DE CRÉDITO</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActivePaymentTab("pix");
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-3 text-center text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 -mb-px ${
                    activePaymentTab === "pix"
                      ? "border-[#2563EB] text-[#38BDF8]"
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>PIX INSTANTÂNEO</span>
                </button>
              </div>

              {/* Error Notification */}
              {errorMessage && (
                <div className="bg-red-950/90 border border-red-600/80 text-red-200 text-xs font-mono p-3 rounded-xl flex items-start gap-2.5 animate-fade-in">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Pix QR Code View if Generated */}
              {pixData ? (
                <div className="space-y-4 text-center py-2 animate-fade-in">
                  <div className="inline-block p-3 bg-white rounded-2xl shadow-lg border border-zinc-200">
                    {pixData.qrCodeBase64 ? (
                      <img
                        src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                        alt="QR Code Pix"
                        className="w-44 h-44 mx-auto object-contain"
                      />
                    ) : (
                      <QrCode className="w-44 h-44 text-black mx-auto" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      PIX GERADO COM SUCESSO
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Copie o código abaixo e pague no app do seu banco.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3.5 text-xs font-bold rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{pixCopied ? "CÓDIGO COPIADO ✓" : "COPIAR CÓDIGO PIX"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPixData(null)}
                    className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Voltar para dados de pagamento
                  </button>
                </div>
              ) : activePaymentTab === "card" ? (
                /* TAB 1: CUSTOM CREDIT CARD FORM */
                <form onSubmit={handleCardSubmit} className="space-y-3.5">
                  <p className="text-xs text-zinc-400">
                    Insira os dados do cartão para pagar <strong className="text-white font-mono font-bold">R$ {currentPrice.toFixed(2).replace(".", ",")}</strong> (pagamento único).
                  </p>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      NOME NO CARTÃO
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="NOME COMO CONSTA NO CARTÃO"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-mono uppercase transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      NÚMERO DO CARTÃO
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                        const formatted = val.replace(/(\d{4})/g, "$1 ").trim();
                        setCardNumber(formatted);
                      }}
                      className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-mono tracking-widest transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                        VALIDADE
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (val.length >= 3) {
                            val = `${val.slice(0, 2)}/${val.slice(2)}`;
                          }
                          setCardExpiry(val);
                        }}
                        className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-mono text-center transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                        CVV
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-mono text-center transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      CPF DO TITULAR
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                        setCpf(val);
                      }}
                      className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-mono transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white py-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
                  >
                    <span>
                      {isProcessing
                        ? "PROCESSANDO PAGAMENTO..."
                        : `CONFIRMAR PAGAMENTO DE R$ ${currentPrice.toFixed(2).replace(".", ",")}`}
                    </span>
                  </button>
                </form>
              ) : (
                /* TAB 2: PIX FORM */
                <form onSubmit={handleGeneratePix} className="space-y-3.5">
                  <p className="text-xs text-zinc-400">
                    Aprovação em segundos. Informe seu CPF para gerar o QR Code Pix de <strong className="text-white font-mono font-bold">R$ {currentPrice.toFixed(2).replace(".", ",")}</strong>.
                  </p>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      CPF DO TITULAR
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                        setCpf(val);
                      }}
                      className="w-full bg-[#111B2E] border border-[#1E293B] focus:border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-mono transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white py-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>
                      {isProcessing
                        ? "GERANDO PIX..."
                        : `GERAR QR CODE PIX (R$ ${currentPrice.toFixed(2).replace(".", ",")})`}
                    </span>
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Security Footer */}
            <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 pt-1 font-mono">
              <span>Checkout Bricks Embutido • Mercado Pago</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-zinc-400" />
                Transações 100% Criptografadas
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS VIEW */}
        {purchaseStep === "success" && (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <h3 className="text-lg font-display font-black text-white uppercase tracking-tight">
                PAGAMENTO APROVADO!
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-xs mx-auto leading-relaxed">
                Parabéns! Sua assinatura <strong className="text-emerald-400">GENESIS PRO</strong> foi ativada com sucesso.
              </p>
            </div>

            <button
              type="button"
              onClick={handleComplete}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3.5 text-xs font-bold rounded-xl transition-all uppercase tracking-widest shadow-lg cursor-pointer"
            >
              ACESSAR DESAFIOS PRO AGORA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
