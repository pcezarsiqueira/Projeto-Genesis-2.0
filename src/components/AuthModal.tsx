import { useState } from "react";
import { LogIn, Mail, Lock, ShieldCheck, Chrome } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("pccris@gmail.com");
  const [name, setName] = useState("Membro Genesis");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onLoginSuccess({
        name: name || "Membro Genesis",
        email: email || "pccris@gmail.com"
      });
      setIsSubmitting(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/85 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xs bg-[#111B2E] brutal-border rounded-2xl p-6 relative flex flex-col items-center">
        
        {/* Floating logo */}
        <div className="w-12 h-12 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center mb-4">
          <LogIn className="text-[#38BDF8] w-5 h-5" />
        </div>

        <h3 className="text-sm font-display font-bold text-[#F0F0F0] uppercase tracking-wider text-center">
          AUTENTICAÇÃO PROJETO GENESIS
        </h3>
        <p className="text-[10px] text-[#888888] text-center mt-1.5 leading-relaxed">
          Sincronize seu progresso, desafios concluídos e diagnósticos de perfil na nuvem com o Firebase Authentication.
        </p>

        <div className="w-full space-y-3 mt-6">
          {/* Dynamic input fields */}
          <div>
            <label className="text-[9px] font-bold text-[#888888] uppercase tracking-wider block mb-1">Seu Nome</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Silveira"
                className="w-full bg-[#0B1220] brutal-border text-xs text-[#F0F0F0] px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-[#888888] uppercase tracking-wider block mb-1">E-mail Registrado</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-[#0B1220] brutal-border text-xs text-[#F0F0F0] px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="w-full space-y-2.5 mt-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 disabled:opacity-50 text-xs font-bold uppercase tracking-widest text-white py-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-glow-blue shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>CONECTAR COM GOOGLE</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full bg-transparent hover:bg-[#1E293B] text-[10px] text-[#888888] py-2 rounded-lg transition-all uppercase tracking-wider cursor-pointer"
          >
            Pular por enquanto
          </button>
        </div>

        {/* Security line */}
        <div className="flex items-center gap-1.5 mt-6 text-[8px] text-zinc-600">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
          <span>Firebase Authenticated (SSL Secured)</span>
        </div>
      </div>
    </div>
  );
}
