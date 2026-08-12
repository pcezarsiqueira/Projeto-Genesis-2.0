import { useState } from "react";
import { Sparkles, Check, ChevronRight, MessageSquare, ShieldAlert } from "lucide-react";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (type: "mensal" | "vitalicio") => void;
}

export default function BillingModal({ isOpen, onClose, onPurchaseSuccess }: BillingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"mensal" | "vitalicio">("mensal");
  const [purchaseStep, setPurchaseStep] = useState<"plans" | "paying" | "success">("plans");

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setPurchaseStep("paying");
    setTimeout(() => {
      setPurchaseStep("success");
      onPurchaseSuccess(selectedPlan);
    }, 2000);
  };

  const handleComplete = () => {
    onPurchaseSuccess(selectedPlan);
    setPurchaseStep("plans");
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-end justify-center font-sans">
      <div className="w-full bg-[#111B2E] brutal-border rounded-t-2xl p-6 transition-all transform animate-slide-up max-h-[92%] overflow-y-auto no-scrollbar">
        
        {/* Play billing top header line */}
        <div className="w-12 h-1.5 bg-[#1E293B] rounded-full mx-auto mb-6" />

        {purchaseStep === "plans" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-[#38BDF8] w-5 h-5 animate-pulse" />
              <h2 className="text-xl font-display font-bold tracking-tight text-[#F0F0F0]">
                DESBLOQUEIE O GENESIS PRO
              </h2>
            </div>

            <p className="text-xs text-[#888888] mb-6 leading-relaxed">
              Tenha acesso ilimitado a todos os desafios diários, módulos de combate à inércia, gráficos de consistência e estratégias de ação imediata.
            </p>

            {/* Benefit Checkmarks */}
            <div className="space-y-3.5 mb-6">
              {[
                { title: "Diagnósticos Ilimitados", desc: "Análises contínuas integradas com Inteligência Artificial" },
                { title: "Módulos de Ação Completos", desc: "Acesso a todos os desafios para sair da estagnação" },
                { title: "Gráfico Radar de Evolução", desc: "Acompanhe sua consistência e foco em tempo real" },
                { title: "Plano de Ação Personalizado", desc: "Estratégias sob medida para os seus primeiros 3 dias" }
              ].map((b, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-[#2563EB]/20 flex items-center justify-center border border-[#2563EB]/40 mt-0.5 shrink-0">
                    <Check className="text-[#38BDF8] w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#F0F0F0]">{b.title}</h4>
                    <p className="text-[10px] text-[#888888]">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-2 gap-3.5 mb-6">
              {/* Monthly plan */}
              <button
                onClick={() => setSelectedPlan("mensal")}
                className={`p-4 rounded-xl text-left border transition-all relative cursor-pointer ${
                  selectedPlan === "mensal"
                    ? "border-[#2563EB] bg-[#2563EB]/10 text-glow-blue shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                    : "border-[#1E293B] bg-[#0B1220] hover:bg-[#162238]"
                }`}
              >
                <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wide">ASSINATURA PRO</div>
                <div className="text-lg font-bold text-[#F0F0F0] mt-1">R$ 29<span className="text-xs font-normal">/mês</span></div>
                <p className="text-[9px] text-[#888888] mt-2">Cancele quando quiser diretamente na Play Store.</p>
                {selectedPlan === "mensal" && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#38BDF8] rounded-full" />
                )}
              </button>

              {/* Lifetime plan */}
              <button
                onClick={() => setSelectedPlan("vitalicio")}
                className={`p-4 rounded-xl text-left border transition-all relative cursor-pointer ${
                  selectedPlan === "vitalicio"
                    ? "border-[#2563EB] bg-[#2563EB]/10 text-glow-blue shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                    : "border-[#1E293B] bg-[#0B1220] hover:bg-[#162238]"
                }`}
              >
                <span className="absolute -top-2 right-3 px-2 py-0.5 bg-[#2563EB] text-[8px] font-bold text-[#F0F0F0] rounded uppercase tracking-widest">MELHOR VALOR</span>
                <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wide">ACESSO VITALÍCIO</div>
                <div className="text-lg font-bold text-[#F0F0F0] mt-1">R$ 197<span className="text-xs font-normal"> pago uma vez</span></div>
                <p className="text-[9px] text-[#888888] mt-2">Acesso perpétuo para sempre, sem mensalidades.</p>
                {selectedPlan === "vitalicio" && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#38BDF8] rounded-full" />
                )}
              </button>
            </div>

            {/* Play billing checkout actions */}
            <div className="space-y-3">
              <button
                onClick={handleSubscribe}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 transition-all py-3.5 text-xs font-bold uppercase tracking-widest text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-glow-blue shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              >
                <span>ADQUIRIR AGORA</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-full bg-transparent hover:bg-[#1E293B] border border-[#1E293B] py-3 text-xs font-semibold text-[#888888] rounded-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Continuar Versão Gratuita
              </button>
            </div>
          </div>
        )}

        {purchaseStep === "paying" && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            {/* Play store simulated loading spinner */}
            <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F0F0]">PROCESSANDO COM GOOGLE PLAY BILLING</h3>
            <p className="text-[10px] text-[#888888]">Integrando transação segura com o Google Play...</p>
          </div>
        )}

        {purchaseStep === "success" && (
          <div className="py-8 text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center rounded-full mx-auto shadow-lg animate-scale-up">
              <Check className="text-[#38BDF8] w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-display font-bold uppercase tracking-tight text-[#F0F0F0]">TRANSAÇÃO CONCLUÍDA</h3>
              <p className="text-xs text-[#888888] mt-1.5 max-w-xs mx-auto">
                Parabéns! Suas credenciais foram ativadas. Você agora é um membro da comunidade <span className="text-[#38BDF8] font-bold">GENESIS PRO</span>.
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-[#1E293B] hover:bg-[#2563EB] border border-[#1E293B] py-3 text-xs font-bold text-[#F0F0F0] rounded-xl transition-all uppercase tracking-widest cursor-pointer"
            >
              LIBERAR TODOS OS MÓDULOS
            </button>
          </div>
        )}

        {/* Play store terms line */}
        <div className="mt-8 pt-4 border-t border-[#1E293B] flex items-center justify-between text-[8px] text-zinc-500 font-sans">
          <span>Google Play Billing Library v6.1</span>
          <span className="flex items-center gap-1"><ShieldAlert className="w-2.5 h-2.5" /> Transações 100% Protegidas</span>
        </div>
      </div>
    </div>
  );
}
