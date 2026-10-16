// Estado do projeto aberto no editor: desfazer/refazer e salvamento
// automático com indicação de estado. Nada é perdido em caso de erro: o
// conteúdo continua na tela e uma nova tentativa é feita na próxima edição.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Carrossel } from "./tipos";
import { api, ErroApi } from "./api";

export type EstadoSalvamento = "salvo" | "pendente" | "salvando" | "erro" | "conflito";

type Historico = { passado: Carrossel[]; presente: Carrossel; futuro: Carrossel[] };
const LIMITE = 100;

export function useProjeto(inicial: Carrossel) {
  const [h, setH] = useState<Historico>({ passado: [], presente: inicial, futuro: [] });
  const [estado, setEstado] = useState<EstadoSalvamento>("salvo");
  const [erro, setErro] = useState<string>("");
  const revisao = useRef<number | undefined>(inicial.studio?.revisao);
  const salvoJson = useRef(JSON.stringify(inicial));
  const ultimoGrupo = useRef<{ chave: string; quando: number } | null>(null);
  const atual = useRef(h.presente);
  atual.current = h.presente;

  // grupo: edições seguidas no mesmo campo (digitação) viram um só passo de desfazer
  const alterar = useCallback((fn: (c: Carrossel) => Carrossel, grupo?: string) => {
    setH((ant) => {
      const novo = fn(ant.presente);
      if (novo === ant.presente) return ant;
      const agora = Date.now();
      const junta = grupo && ultimoGrupo.current?.chave === grupo && agora - ultimoGrupo.current.quando < 1200;
      ultimoGrupo.current = grupo ? { chave: grupo, quando: agora } : null;
      return {
        passado: junta ? ant.passado : [...ant.passado, ant.presente].slice(-LIMITE),
        presente: novo,
        futuro: [],
      };
    });
  }, []);

  const desfazer = useCallback(() => setH((a) => (a.passado.length ? {
    passado: a.passado.slice(0, -1), presente: a.passado[a.passado.length - 1], futuro: [a.presente, ...a.futuro],
  } : a)), []);
  const refazer = useCallback(() => setH((a) => (a.futuro.length ? {
    passado: [...a.passado, a.presente], presente: a.futuro[0], futuro: a.futuro.slice(1),
  } : a)), []);

  const salvarAgora = useCallback(async () => {
    const c = atual.current;
    const texto = JSON.stringify(c);
    if (texto === salvoJson.current) { setEstado("salvo"); return true; }
    setEstado("salvando");
    try {
      const r = await api.salvar(c.id, c, revisao.current);
      revisao.current = r.dados.studio?.revisao;
      salvoJson.current = texto;
      setErro("");
      setEstado(JSON.stringify(atual.current) === texto ? "salvo" : "pendente");
      return true;
    } catch (e) {
      const ea = e as ErroApi;
      setErro(ea.message);
      setEstado(ea.status === 409 ? "conflito" : "erro");
      return false;
    }
  }, []);

  // salvamento automático 800 ms após a última edição
  useEffect(() => {
    if (JSON.stringify(h.presente) === salvoJson.current) return;
    setEstado((e) => (e === "conflito" ? e : "pendente"));
    const t = setTimeout(() => { if (estadoRef.current !== "conflito") void salvarAgora(); }, 800);
    return () => clearTimeout(t);
  }, [h.presente, salvarAgora]);

  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  // Ao fechar a aba, recarregar ou sair do editor com algo pendente, envia
  // a gravação na hora (keepalive: a requisição sobrevive ao fechamento).
  useEffect(() => {
    const enviarPendente = () => {
      const c = atual.current;
      const texto = JSON.stringify(c);
      if (texto === salvoJson.current) return;
      salvoJson.current = texto;
      try {
        void fetch(`/api/projetos/${c.id}`, {
          method: "PUT", keepalive: true, headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dados: c, revisao: revisao.current }),
        });
      } catch { /* sem conexão: o aviso do navegador já protegeu o usuário */ }
    };
    const aviso = (ev: BeforeUnloadEvent) => {
      if (JSON.stringify(atual.current) !== salvoJson.current) { ev.preventDefault(); ev.returnValue = ""; }
    };
    window.addEventListener("beforeunload", aviso);
    window.addEventListener("pagehide", enviarPendente);
    return () => {
      window.removeEventListener("beforeunload", aviso);
      window.removeEventListener("pagehide", enviarPendente);
      enviarPendente(); // saiu do editor pela navegação interna
    };
  }, []);

  return {
    carrossel: h.presente, alterar, desfazer, refazer, salvarAgora,
    podeDesfazer: h.passado.length > 0, podeRefazer: h.futuro.length > 0,
    estado, erro,
  };
}
