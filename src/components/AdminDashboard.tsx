import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Database,
  Link2,
  Eye,
  LogOut,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Lock,
  Flame,
  UserCheck,
  TrendingUp,
  Settings,
  RefreshCw,
  Phone,
  RotateCcw
} from "lucide-react";
import { UserProgress } from "../types";

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  linkedin?: string;
  interestTag?: string;
  indiceGenesis: number;
  estagio: string;
  weakestDimensions: string[];
  createdAt: string;
}

export interface UserProgressRecord {
  uid: string;
  name: string;
  email: string;
  role: string;
  isPro: boolean;
  activeDays: number;
  phase: string;
  interestTag?: string;
  createdAt: string;
  lastActivity: string;
}

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onActivateSimulation: (phase: "ignicao" | "tracao" | "expansao") => void;
  onDeactivateSimulation: () => void;
  onResetSimulationProfile: (phase: "ignicao" | "tracao" | "expansao") => void;
  activeSimulationPhase?: "ignicao" | "tracao" | "expansao" | null;
  simulatedProfiles?: Record<"ignicao" | "tracao" | "expansao", UserProgress>;
}

export default function AdminDashboard({
  token,
  onLogout,
  onActivateSimulation,
  onDeactivateSimulation,
  onResetSimulationProfile,
  activeSimulationPhase,
  simulatedProfiles
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"leads" | "users" | "settings" | "simulator">("leads");

  // Data states
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [users, setUsers] = useState<UserProgressRecord[]>([]);
  const [whatsappLinks, setWhatsappLinks] = useState({
    ignicao: "https://chat.whatsapp.com/DL5ojA2RgnB3OpUuxT8Brz",
    tracao: "https://chat.whatsapp.com/EYlX9rIctzbFDXB6gsvrRO",
    expansao: "https://chat.whatsapp.com/IW8X2LfJuEd9sE35oj0t3o"
  });

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("TODOS");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "score_desc" | "score_asc">("date_desc");

  // Status feedback
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch initial admin data
  useEffect(() => {
    fetchAdminData();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      if (data.success && data.whatsappLinks) {
        setWhatsappLinks(data.whatsappLinks);
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Fetch Leads
      const leadsRes = await fetch("/api/admin/leads", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const leadsData = await leadsRes.json();
      if (leadsData.success) {
        setLeads(leadsData.leads);
      }

      // Fetch Users
      const usersRes = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ whatsappLinks })
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage({ type: "success", text: "Links gravados no banco de dados com sucesso!" });
      } else {
        setSaveMessage({ type: "error", text: data.error || "Erro ao salvar alterações." });
      }
    } catch (err: any) {
      setSaveMessage({ type: "error", text: err.message || "Erro na conexão." });
    }
  };

  // Filter and sort leads
  const filteredLeads = leads
    .filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.instagram && lead.instagram.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTag =
        selectedTag === "TODOS" ||
        (lead.interestTag && lead.interestTag.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "date_desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "date_asc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "score_desc") {
        return b.indiceGenesis - a.indiceGenesis;
      }
      if (sortBy === "score_asc") {
        return a.indiceGenesis - b.indiceGenesis;
      }
      return 0;
    });

  return (
    <div className="w-full flex flex-col space-y-5 pb-24 animate-fade-in font-sans text-[#F0F0F0]">
      
      {/* Top Banner Header */}
      <div className="p-4 bg-[#111B2E] border border-[#2563EB]/40 rounded-2xl relative overflow-hidden shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2563EB]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#1E3A8A]/40 border border-[#2563EB]/50 rounded-xl text-[#38BDF8]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#38BDF8] bg-[#1E3A8A]/30 px-2 py-0.5 rounded border border-[#2563EB]/40">
                  Painel de Controle
                </span>
                <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                  ROLE = ADMIN
                </span>
              </div>
              <h2 className="text-sm font-display font-black text-white uppercase tracking-tight mt-1">
                PAINEL ADMINISTRATIVO GENESIS
              </h2>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 bg-[#0B1220] hover:bg-rose-950/50 border border-[#1E293B] hover:border-rose-800 text-rose-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-bold shrink-0"
            title="Sair do Painel Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div className="grid grid-cols-4 gap-1.5 mt-4 pt-3 border-t border-[#1E293B]">
          {[
            { id: "leads", label: "Captura de Leads", icon: <Database className="w-4 h-4" />, count: leads.length },
            { id: "users", label: "Progresso Alunos", icon: <Users className="w-4 h-4" />, count: users.length },
            { id: "settings", label: "Grupos WhatsApp", icon: <Link2 className="w-4 h-4" /> },
            { id: "simulator", label: "Ver como Aluno", icon: <Eye className="w-4 h-4 text-amber-400" /> }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center relative min-h-[62px] ${
                  isSelected
                    ? "bg-[#2563EB] border-[#38BDF8] text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                    : "bg-[#0B1220] border-[#1E293B] text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                {/* Count badge positioned top-right if present */}
                {tab.count !== undefined && (
                  <span className={`absolute top-1 right-1 px-1.5 py-0.2 rounded text-[7.5px] font-mono font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#111B2E] text-zinc-400 border border-[#1E293B]"
                  }`}>
                    {tab.count}
                  </span>
                )}

                <div className="mb-1 text-center flex justify-center">
                  {tab.icon}
                </div>

                <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-tight leading-tight text-center px-0.5 whitespace-normal break-words">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- TAB 1: LEADS --- */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-[#111B2E] border border-[#1E293B] rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Total de Leads</span>
              <span className="text-lg font-mono font-bold text-white">{leads.length}</span>
            </div>
            <div className="p-3 bg-[#111B2E] border border-[#1E293B] rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Média Índice Genesis</span>
              <span className="text-lg font-mono font-bold text-[#38BDF8]">
                {leads.length > 0
                  ? Math.round(leads.reduce((acc, curr) => acc + curr.indiceGenesis, 0) / leads.length)
                  : 0}
                /100
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 bg-[#111B2E] border border-[#1E293B] rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Atualização Banco</span>
              <button
                onClick={fetchAdminData}
                className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#38BDF8] hover:underline cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                <span>{isLoading ? "Sincronizando..." : "Sincronizar Agora"}</span>
              </button>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="p-3.5 bg-[#111B2E] border border-[#1E293B] rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail, telefone, instagram..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1E293B] focus:border-[#2563EB] rounded-lg pl-9 pr-3 py-2 text-[11px] text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>

              <div className="flex gap-2">
                {/* Interest Tag Filter */}
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-[#0B1220] border border-[#1E293B] text-zinc-300 text-[10px] font-mono font-bold rounded-lg px-2.5 py-2 outline-none cursor-pointer"
                >
                  <option value="TODOS">Todas as Tags</option>
                  <option value="Transformar o que eu sei em renda">Transformar em Renda</option>
                  <option value="Mais presença com quem eu amo">Mais Presença</option>
                  <option value="Avançar na carreira">Avançar na Carreira</option>
                  <option value="Ainda não sei">Ainda Não Sei</option>
                </select>

                {/* Sort selector */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#0B1220] border border-[#1E293B] text-zinc-300 text-[10px] font-mono font-bold rounded-lg px-2.5 py-2 outline-none cursor-pointer"
                >
                  <option value="date_desc">Data (Mais Recentes)</option>
                  <option value="date_asc">Data (Mais Antigos)</option>
                  <option value="score_desc">Índice Gênesis (Maior)</option>
                  <option value="score_asc">Índice Gênesis (Menor)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leads Table / Cards List */}
          <div className="space-y-2.5">
            {filteredLeads.length === 0 ? (
              <div className="p-8 bg-[#111B2E] border border-[#1E293B] rounded-xl text-center space-y-2">
                <Filter className="w-6 h-6 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Nenhum lead encontrado com os filtros selecionados.</p>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3.5 bg-[#111B2E] border border-[#1E293B] hover:border-[#2563EB]/50 rounded-xl transition-all space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{lead.name}</span>
                        {lead.interestTag && (
                          <span className="text-[8px] font-mono font-bold text-[#38BDF8] bg-[#1E3A8A]/30 border border-[#2563EB]/40 px-2 py-0.5 rounded">
                            {lead.interestTag}
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{lead.email}</p>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div className="p-1.5 bg-[#0B1220] border border-[#1E293B] rounded-lg text-center min-w-[70px]">
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Índice Genesis</span>
                        <span className="text-xs font-mono font-bold text-[#38BDF8]">{lead.indiceGenesis}/100</span>
                      </div>
                      <div className="p-1.5 bg-[#0B1220] border border-[#1E293B] rounded-lg text-center min-w-[80px]">
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Estágio</span>
                        <span className="text-[10px] font-mono font-bold text-amber-400">{lead.estagio}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                      <a
                        href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-emerald-400 truncate"
                      >
                        {lead.phone}
                      </a>
                    </div>

                    {lead.instagram ? (
                      <div className="flex items-center gap-1 text-zinc-400 truncate">
                        <span className="text-zinc-500">IG:</span>
                        <a
                          href={`https://instagram.com/${lead.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-zinc-300 truncate"
                        >
                          {lead.instagram}
                        </a>
                      </div>
                    ) : (
                      <div className="text-zinc-600">IG: Não informado</div>
                    )}

                    <div className="flex items-center gap-1 text-zinc-500 text-right sm:justify-end">
                      <Calendar className="w-3 h-3 text-zinc-600" />
                      <span>{new Date(lead.createdAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>

                  {lead.weakestDimensions && lead.weakestDimensions.length > 0 && (
                    <div className="text-[9px] font-mono text-rose-400/90 bg-rose-950/20 border border-rose-900/30 px-2.5 py-1 rounded">
                      Gargalo Principal: <span className="font-bold">{lead.weakestDimensions.join(", ")}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: PROGRESSO DOS ALUNOS --- */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="p-3.5 bg-[#111B2E] border border-[#1E293B] rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Acompanhamento da Jornada</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Visão geral dos alunos cadastrados e fase de progresso atual.</p>
            </div>
            <button
              onClick={fetchAdminData}
              className="p-2 bg-[#0B1220] border border-[#1E293B] rounded-lg text-zinc-400 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="space-y-2.5">
            {users.length === 0 ? (
              <div className="p-8 bg-[#111B2E] border border-[#1E293B] rounded-xl text-center text-xs text-zinc-400">
                Nenhum registro de aluno cadastrado no banco.
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u.uid}
                  className="p-3.5 bg-[#111B2E] border border-[#1E293B] rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[#1E293B] pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.role === "admin" && (
                          <span className="text-[8px] font-mono text-amber-400 font-bold bg-amber-950/50 border border-amber-800/50 px-1.5 py-0.5 rounded">
                            ADMIN
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono">{u.email}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase ${
                        u.phase === "Ignição"
                          ? "bg-amber-950/60 border border-amber-600/50 text-amber-400"
                          : u.phase === "Tração"
                          ? "bg-blue-950/60 border border-blue-600/50 text-[#38BDF8]"
                          : "bg-purple-950/60 border border-purple-600/50 text-purple-300"
                      }`}>
                        Fase {u.phase} (Dia {u.activeDays})
                      </span>

                      <span className={`px-2 py-1 rounded text-[8px] font-mono font-bold uppercase ${
                        u.isPro
                          ? "bg-emerald-950 border border-emerald-600 text-emerald-400"
                          : "bg-zinc-900 border border-zinc-700 text-zinc-500"
                      }`}>
                        {u.isPro ? "Genesis PRO ✓" : "Gratuito"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                    <div>Segmentação: <span className="text-zinc-300">{u.interestTag || "Nenhum"}</span></div>
                    <div>Cadastrado em: <span className="text-zinc-400">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: CONFIGURAÇÕES (WHATSAPP LINKS) --- */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="p-4 bg-[#111B2E] border border-[#1E293B] rounded-xl space-y-2">
            <h3 className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-[#38BDF8]" />
              <span>CONFIGURAÇÃO DOS LINKS DE COMUNIDADE (WHATSAPP)</span>
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Os links inseridos aqui são gravados na tabela de configurações do banco de dados e atualizados dinamicamente no aplicativo dos alunos, sem necessidade de novo deploy.
            </p>
          </div>

          {saveMessage && (
            <div className={`p-3 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${
              saveMessage.type === "success"
                ? "bg-emerald-950/60 border-emerald-600 text-emerald-400"
                : "bg-rose-950/60 border-rose-600 text-rose-400"
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveMessage.text}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {/* Link 1: Ignição */}
            <div className="p-3.5 bg-[#111B2E] border border-[#1E293B] rounded-xl space-y-1.5">
              <label className="block text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>GRUPO DA FASE 1: IGNIÇÃO (3 DIAS)</span>
              </label>
              <input
                type="url"
                required
                value={whatsappLinks.ignicao}
                onChange={(e) => setWhatsappLinks({ ...whatsappLinks, ignicao: e.target.value })}
                className="w-full bg-[#0B1220] border border-[#1E293B] focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>

            {/* Link 2: Tração */}
            <div className="p-3.5 bg-[#111B2E] border border-[#1E293B] rounded-xl space-y-1.5">
              <label className="block text-[10px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>GRUPO DA FASE 2: TRAÇÃO (7 DIAS)</span>
              </label>
              <input
                type="url"
                required
                value={whatsappLinks.tracao}
                onChange={(e) => setWhatsappLinks({ ...whatsappLinks, tracao: e.target.value })}
                className="w-full bg-[#0B1220] border border-[#1E293B] focus:border-[#2563EB] rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>

            {/* Link 3: Expansão */}
            <div className="p-3.5 bg-[#111B2E] border border-[#1E293B] rounded-xl space-y-1.5">
              <label className="block text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>GRUPO DA FASE 3: EXPANSAO (21 DIAS)</span>
              </label>
              <input
                type="url"
                required
                value={whatsappLinks.expansao}
                onChange={(e) => setWhatsappLinks({ ...whatsappLinks, expansao: e.target.value })}
                className="w-full bg-[#0B1220] border border-[#1E293B] focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span>Salvar Configurações no Banco</span>
          </button>
        </form>
      )}

      {/* --- TAB 4: MODO "VER COMO ALUNO" (SIMULADOR) --- */}
      {activeTab === "simulator" && (
        <div className="space-y-4">
          <div className="p-4 bg-[#111B2E] border border-amber-500/40 rounded-xl space-y-2">
            <h3 className="text-xs font-display font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>SIMULADOR DE VISUALIZAÇÃO DE ALUNO</span>
            </h3>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Esta ferramenta permite ao administrador navegar e testar a interface do aplicativo exatamente como um aluno em cada uma das 3 fases do Projeto Genesis. Usa um <strong className="text-amber-400">perfil de teste isolado</strong> para não poluir a lista de leads ou métricas de progresso reais.
            </p>
          </div>

          {activeSimulationPhase && (
            <div className="p-3 bg-amber-950/60 border border-amber-600 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-amber-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Simulação Ativa: Fase {activeSimulationPhase.toUpperCase()} (UID: admin_test_{activeSimulationPhase})</span>
              </div>
              <button
                onClick={onDeactivateSimulation}
                className="px-2.5 py-1 bg-amber-900 border border-amber-700 hover:bg-amber-800 text-white rounded text-[10px] uppercase cursor-pointer"
              >
                Sair do Simulador
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3.5">
            {[
              {
                id: "ignicao" as const,
                title: "Ignição (Gratuito)",
                subtitle: "Fase 1 (Dias 1-3)",
                color: "amber",
                borderColor: "border-amber-500/50",
                textColor: "text-amber-400",
                btnBg: "hover:bg-amber-950/50 text-amber-300 border-amber-500/50",
                desc: "Simula o aluno iniciando a jornada. Dias 1 a 3 liberados para execução do desafio gratuito e acesso ao Grupo de Ignição."
              },
              {
                id: "tracao" as const,
                title: "Tração (Genesis PRO)",
                subtitle: "Fase 2 (Dias 4-10)",
                color: "blue",
                borderColor: "border-[#2563EB]/50",
                textColor: "text-[#38BDF8]",
                btnBg: "hover:bg-[#1E3A8A]/40 text-[#38BDF8] border-[#2563EB]/50",
                desc: "Simula o aluno com assinatura PRO em progresso avançado. Acesso desbloqueado aos desafios da fase de Tração e link do Grupo de Tração."
              },
              {
                id: "expansao" as const,
                title: "Expansão (Genesis PRO)",
                subtitle: "Fase 3 (Dias 11-31)",
                color: "purple",
                borderColor: "border-purple-500/50",
                textColor: "text-purple-300",
                btnBg: "hover:bg-purple-950/50 text-purple-300 border-purple-500/50",
                desc: "Simula a jornada completa desbloqueada do PRO até o Dia 31 com acesso total aos conteúdos e ao Grupo de Expansão."
              }
            ].map((phaseCard) => {
              const pData = simulatedProfiles ? simulatedProfiles[phaseCard.id] : null;

              return (
                <div
                  key={phaseCard.id}
                  className={`p-4 bg-[#111B2E] border border-[#1E293B] hover:${phaseCard.borderColor} rounded-xl space-y-3 transition-all`}
                >
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                    <div>
                      <span className={`text-[9px] font-mono ${phaseCard.textColor} font-bold uppercase tracking-widest block`}>
                        {phaseCard.subtitle}
                      </span>
                      <h4 className="text-sm font-bold text-white">{phaseCard.title}</h4>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400 bg-[#0B1220] border border-[#1E293B] px-2 py-1 rounded">
                      UID: admin_test_{phaseCard.id}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {phaseCard.desc}
                  </p>

                  {pData && (
                    <div className="grid grid-cols-3 gap-2 bg-[#0B1220] p-2.5 rounded-lg text-[9px] font-mono border border-[#1E293B]">
                      <div>
                        <span className="text-zinc-500 block">Status PRO</span>
                        <span className={`font-bold ${pData.isPro ? "text-emerald-400" : "text-amber-400"}`}>
                          {pData.isPro ? "Ativo ✓" : "Gratuito"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Progresso</span>
                        <span className="text-white font-bold">
                          Dia {pData.activeDays} ({pData.completedLessons?.length || 0} Aulas)
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Diagnóstico</span>
                        <span className="text-[#38BDF8] font-bold">
                          {pData.genesisResult ? `${pData.genesisResult.indiceGenesis}/100` : "Pendente"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onActivateSimulation(phaseCard.id)}
                      className={`w-full bg-[#0B1220] border ${phaseCard.btnBg} py-2.5 px-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Simular Visão Aluno</span>
                    </button>

                    <button
                      onClick={() => onResetSimulationProfile(phaseCard.id)}
                      className="w-full bg-[#0B1220] hover:bg-rose-950/40 border border-rose-900/40 text-rose-300 py-2.5 px-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2"
                      title="Reiniciar este perfil isolado para o estado inicial"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reiniciar Simulação</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
