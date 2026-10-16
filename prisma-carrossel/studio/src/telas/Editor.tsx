// Editor do carrossel: slides à esquerda, prévia real no centro, propriedades
// (Slide · Carrossel · Exportar) à direita. Salvamento automático.
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";
import type { Carrossel, Inspecao } from "../tipos";
import { useProjeto, type EstadoSalvamento } from "../useProjeto";
import { QuadroSlide } from "../componentes/QuadroSlide";
import { PainelSlides } from "../componentes/PainelSlides";
import { PainelSlide } from "../componentes/PainelSlide";
import { PainelCarrossel } from "../componentes/PainelCarrossel";
import { PainelExportar } from "../componentes/PainelExportar";
import { PainelReferencias } from "../componentes/PainelReferencias";
import { useAvisos } from "../componentes/Avisos";
import { Marca } from "./Biblioteca";
// @ts-ignore
import { avisosDeTamanho } from "../../../src/catalogo.js";

const TEXTO_ESTADO: Record<EstadoSalvamento, string> = {
  salvo: "Salvo",
  pendente: "Alterações não salvas",
  salvando: "Salvando…",
  erro: "Erro ao salvar",
  conflito: "Conflito: recarregue",
};

export function Editor({ id }: { id: string }) {
  const [inicial, setInicial] = useState<Carrossel | null>(null);
  const [erro, setErro] = useState("");
  useEffect(() => {
    api.abrir(id).then((r) => setInicial(r.dados)).catch((e) => setErro(e.message));
  }, [id]);
  if (erro) return <div className="pagina"><header className="barra-topo"><Marca /></header><div className="faixa-erro margem">{erro} <a href="#/">Voltar à biblioteca</a></div></div>;
  if (!inicial) return <div className="carregando">Abrindo carrossel…</div>;
  return <EditorCarregado inicial={inicial} />;
}

type Modo = "slide" | "mosaico";
type Aba = "slide" | "referencias" | "carrossel" | "exportar";

function EditorCarregado({ inicial }: { inicial: Carrossel }) {
  const p = useProjeto(inicial);
  const { carrossel: c, alterar } = p;
  const [sel, setSel] = useState(0);
  const [modo, setModo] = useState<Modo>("slide");
  const [aba, setAba] = useState<Aba>("slide");
  const [zoom, setZoom] = useState<number | "ajustar">("ajustar");
  const [inspecao, setInspecao] = useState<Inspecao | null>(null);
  const centro = useRef<HTMLDivElement>(null);
  const [areaCentro, setAreaCentro] = useState({ w: 600, h: 700 });
  const { avisar } = useAvisos();
  const indice = Math.min(sel, c.slides.length - 1);

  useEffect(() => {
    const el = centro.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAreaCentro({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // atalhos: desfazer, refazer, salvar
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) { e.preventDefault(); p.desfazer(); }
      else if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); p.refazer(); }
      else if (k === "s") { e.preventDefault(); void p.salvarAgora(); }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [p.desfazer, p.refazer, p.salvarAgora]);

  useEffect(() => { if (p.estado === "erro") avisar(p.erro || "Erro ao salvar.", "erro"); }, [p.estado]); // eslint-disable-line

  const onInspecao = useCallback((r: Inspecao | null) => setInspecao(r), []);
  useEffect(() => setInspecao(null), [indice]);

  const larguraAjustada = Math.max(240, Math.min(areaCentro.w - 64, (areaCentro.h - 96) * (c.formato.largura / c.formato.altura)));
  const largura = zoom === "ajustar" ? larguraAjustada : c.formato.largura * zoom;
  const avisosTam: string[] = c.slides[indice] ? avisosDeTamanho(c.slides[indice]) : [];

  return (
    <div className="editor">
      <header className="barra-topo">
        <Marca />
        <a className="botao botao--pequeno" href="#/" onClick={() => void p.salvarAgora()}>← Biblioteca</a>
        <div className="barra-titulo">
          <strong title={c.titulo}>{c.titulo}</strong>
          <span className={`estado-salvo estado-salvo--${p.estado}`} data-estado={p.estado} title={p.erro}>{TEXTO_ESTADO[p.estado]}</span>
        </div>
        <div className="barra-topo-acoes">
          <button className="botao botao--pequeno" onClick={p.desfazer} disabled={!p.podeDesfazer} title="Desfazer (Ctrl+Z)">↶ Desfazer</button>
          <button className="botao botao--pequeno" onClick={p.refazer} disabled={!p.podeRefazer} title="Refazer (Ctrl+Shift+Z)">↷ Refazer</button>
          {(p.estado === "erro" || p.estado === "pendente") && <button className="botao botao--pequeno" onClick={() => void p.salvarAgora()}>Salvar agora</button>}
          {p.estado === "conflito" && <button className="botao botao--pequeno botao--perigo" onClick={() => location.reload()}>Recarregar</button>}
          <button className="botao botao--primario botao--pequeno" onClick={() => setAba("exportar")}>Exportar e baixar</button>
        </div>
      </header>

      <div className="editor-corpo">
        <PainelSlides
          carrossel={c} selecionado={indice} onSelecionar={(i) => { setSel(i); setModo("slide"); setAba((a) => (a === "referencias" ? a : "slide")); }}
          alterar={alterar}
        />

        <section className="editor-centro" aria-label="Visualização">
          <div className="centro-ferramentas">
            <div className="segmentado" role="group" aria-label="Modo de visualização">
              <button className={modo === "slide" ? "ativo" : ""} onClick={() => setModo("slide")}>Slide</button>
              <button className={modo === "mosaico" ? "ativo" : ""} onClick={() => setModo("mosaico")}>Visão geral</button>
            </div>
            {modo === "slide" && (
              <div className="segmentado" role="group" aria-label="Zoom">
                {(["ajustar", 0.5, 0.75, 1] as const).map((z) => (
                  <button key={String(z)} className={zoom === z ? "ativo" : ""} onClick={() => setZoom(z)}>{z === "ajustar" ? "Ajustar" : `${z * 100}%`}</button>
                ))}
              </div>
            )}
            <span className="centro-info">{modo === "slide" ? `Slide ${indice + 1} de ${c.slides.length} · ${c.formato.largura} × ${c.formato.altura}` : `${c.slides.length} slides`}</span>
          </div>

          <div className="centro-palco" ref={centro}>
            {modo === "slide" ? (
              <div className="palco-slide">
                <QuadroSlide carrossel={c} indice={indice} largura={Math.round(largura)} inspecionar onInspecao={onInspecao} rotulo={`Slide ${indice + 1}`} />
              </div>
            ) : (
              <div className="mosaico">
                {c.slides.map((_, i) => (
                  <button key={i} className={`mosaico-item${i === indice ? " ativo" : ""}`} onClick={() => { setSel(i); setModo("slide"); }}>
                    <QuadroSlide carrossel={c} indice={i} largura={220} rotulo={`Slide ${i + 1}`} />
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {modo === "slide" && <Diagnostico inspecao={inspecao} avisosTamanho={avisosTam} />}
        </section>

        <aside className="editor-direita" aria-label="Propriedades">
          <div className="abas abas--painel" role="tablist">
            {([["slide", "Slide"], ["referencias", "Referências"], ["carrossel", "Carrossel"], ["exportar", "Exportar"]] as [Aba, string][]).map(([v, r]) => (
              <button key={v} role="tab" aria-selected={aba === v} className={`aba${aba === v ? " aba--ativa" : ""}`} onClick={() => setAba(v)}>{r}</button>
            ))}
          </div>
          <div className="painel-rolagem">
            {aba === "slide" && c.slides[indice] && <PainelSlide carrossel={c} indice={indice} alterar={alterar} />}
            {aba === "referencias" && c.slides[indice] && <PainelReferencias key={indice} carrossel={c} indice={indice} alterar={alterar} />}
            {aba === "carrossel" && <PainelCarrossel carrossel={c} alterar={alterar} />}
            {aba === "exportar" && <PainelExportar carrossel={c} indice={indice} salvarAgora={p.salvarAgora} estadoSalvamento={p.estado} />}
          </div>
        </aside>
      </div>
    </div>
  );
}

// Mensagens técnicas da inspeção → linguagem de quem edita.
const NOMES: Record<string, string> = { titulo: "o título", texto: "o texto", complemento: "o complemento", cta: "a chamada", cartao: "o cartão", grafico: "o gráfico", assinatura: "a assinatura", chamada: "a chamada", numero: "o número", cena: "a cena", progresso: "a barra de progresso", rotulo: "o rótulo", icone: "o ícone" };
const nome = (b: string) => NOMES[b.replace(/-\d+$/, "")] || b;
function traduzirErro(e: string): string {
  let m;
  if ((m = e.match(/^texto não coube.*\[(.+)\]$/))) return `${nome(m[1])} não cabe no espaço, mesmo no menor tamanho legível`;
  if ((m = e.match(/^fora da área de segurança: \[(.+?)\]/))) return `${nome(m[1])} passou da margem de segurança`;
  if ((m = e.match(/^sobreposição: \[(.+?)\] × \[(.+?)\]/))) return `${nome(m[1])} está sobre ${nome(m[2])}`;
  if (/^texto cortado pela borda/.test(e)) return "há texto cortado na borda do slide";
  if (/^texto (fora da área de segurança|escapa da caixa)/.test(e)) return "há texto saindo do espaço reservado";
  if (/^texto encoberto/.test(e)) return "há texto escondido atrás de outro elemento";
  if (/^transbordamento horizontal/.test(e)) return "uma palavra é larga demais para a linha";
  if (/^contraste insuficiente/.test(e)) return "contraste baixo entre texto e fundo";
  if (/^texto ausente/.test(e)) return "um texto do slide não apareceu na arte";
  if (/^corpo pequeno demais/.test(e)) return "texto pequeno demais para leitura no celular";
  return e;
}

function Diagnostico({ inspecao, avisosTamanho }: { inspecao: Inspecao | null; avisosTamanho: string[] }) {
  const erros = [...new Set((inspecao?.erros || []).map(traduzirErro))];
  const avisos = [...avisosTamanho, ...(inspecao?.avisos || [])];
  const traduzir = (t: string) => t
    .replace(/^corpo reduzido automaticamente: \[(.+?)\] (\d+)→(\d+)px$/, (_, b, a, d) => `${nome(b)[0].toUpperCase() + nome(b).slice(1)} foi reduzido automaticamente para caber (${a} → ${d} px).`)
    .replace(/^palavra curta isolada.*: "(.+)"$/, 'Palavra curta sozinha na última linha do título ("$1"). Considere reescrever.')
    .replace(/^linha longa: (\d+) caracteres.*$/, "Linha de texto longa ($1 caracteres); frases mais curtas leem melhor no celular.");
  return (
    <div className={`diagnostico${erros.length ? " diagnostico--erro" : ""}`} data-testid="diagnostico" aria-live="polite">
      {!inspecao ? <span className="diag-neutro">Verificando layout…</span>
        : erros.length === 0 ? <span className="diag-ok" data-diag="ok">✓ Layout validado: nenhum corte, sobreposição ou texto fora da área segura{inspecao.menorCorpoNoCelularPx ? ` · menor texto ≈ ${inspecao.menorCorpoNoCelularPx}px no celular` : ""}</span>
        : <span className="diag-erro" data-diag="erro">⚠ Atenção: {erros.slice(0, 3).join("; ")}{erros.length > 3 ? "…" : ""}. Encurte o texto, reduza o tamanho do título ou troque o modelo. A exportação vai apontar este slide como problema.</span>}
      {avisos.length > 0 && (
        <details className="diag-avisos">
          <summary>{avisos.length} aviso(s) de leitura</summary>
          <ul>{avisos.map((a, i) => <li key={i}>{traduzir(a)}</li>)}</ul>
        </details>
      )}
    </div>
  );
}
