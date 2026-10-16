// Propriedades do slide selecionado. O formulário é gerado a partir do
// catálogo de modelos: cada modelo declara seus campos e limites.
import { useEffect, useRef, useState } from "react";
import type { Carrossel, Slide } from "../tipos";
import { api, type Foto } from "../api";
import { urlFoto } from "../motor";
import { useAvisos } from "./Avisos";
import { SeletorImagem } from "./SeletorImagem";
import { aplicarImagem, avisoResolucao } from "./aplicarImagem";
// @ts-ignore
import { MODELOS, MODOS_FOTO, FUNDOS_ROTULOS, modeloDoSlide, trocarModelo, obterCampo, definirCampo } from "../../../src/catalogo.js";

type Alterar = (fn: (c: Carrossel) => Carrossel, grupo?: string) => void;
type Campo = { chave: string; rotulo: string; tipo: string; max?: number; maxItem?: number; destaque?: boolean; dica?: string; opcoes?: { valor: string; rotulo: string }[]; campos?: Campo[]; quantidade?: number; min?: number };

const CORES: Record<string, string> = { escuro: "#1d1e21", claro: "#f4efe6", suave: "#e2dcd1", acento: "#e3b23c" };

export function PainelSlide({ carrossel: c, indice, alterar }: { carrossel: Carrossel; indice: number; alterar: Alterar }) {
  const s = c.slides[indice];
  const modelo = modeloDoSlide(s);
  const setSlide = (fn: (s: Slide) => Slide, grupo?: string) =>
    alterar((x) => ({ ...x, slides: x.slides.map((y, k) => (k === indice ? fn(y) : y)) }), grupo && `${indice}:${grupo}`);
  const setCampo = (chave: string, valor: any, grupo = true) => setSlide((y) => definirCampo(y, chave, valor), grupo ? chave : undefined);

  return (
    <div className="painel" data-testid="painel-slide">
      <section className="secao">
        <h3>Modelo</h3>
        <select
          aria-label="Modelo do slide"
          value={modelo.id}
          onChange={(e) => setSlide((y) => trocarModelo(y, e.target.value, c.perfil))}
        >
          {MODELOS.map((m: any) => <option key={m.id} value={m.id}>{m.categoria}{m.nome ? ` · ${m.nome}` : ""}</option>)}
        </select>
        <p className="dica">{modelo.descricao} Ao trocar, título e texto são mantidos.</p>
      </section>

      <section className="secao">
        <h3>Conteúdo</h3>
        <p className="dica">Para destacar palavras na cor de acento, selecione o trecho e clique em <b>Destacar</b> (ou escreva entre *asteriscos*).</p>
        {(modelo.campos as Campo[]).map((campo) => (
          <CampoEditor key={`${indice}-${campo.chave}`} campo={campo} valor={obterCampo(s, campo.chave)} onMudar={(v, g) => setCampo(campo.chave, v, g)} idBase={`s${indice}`} />
        ))}
      </section>

      <section className="secao">
        <h3>Aparência</h3>
        <span className="campo-rotulo">Cor de fundo</span>
        <div className="amostras" role="radiogroup" aria-label="Cor de fundo">
          {Object.entries(FUNDOS_ROTULOS as Record<string, string>).map(([v, r]) => (
            <button key={v} role="radio" aria-checked={s.fundo === v} className={`amostra${s.fundo === v ? " ativa" : ""}`} onClick={() => setCampo("fundo", v, false)} title={r}>
              <i style={{ background: CORES[v] }} /> {r}
            </button>
          ))}
        </div>
        {modelo.alinhamento && (
          <>
            <span className="campo-rotulo">Alinhamento</span>
            <div className="segmentado segmentado--largo" role="group" aria-label="Alinhamento">
              <button className={s.alinhamento !== "centro" ? "ativo" : ""} onClick={() => setCampo("alinhamento", "esquerda", false)}>À esquerda</button>
              <button className={s.alinhamento === "centro" ? "ativo" : ""} onClick={() => setCampo("alinhamento", "centro", false)}>Centralizado</button>
            </div>
          </>
        )}
        <Deslizante rotulo="Tamanho do título" min={85} max={115} passo={1} valor={Math.round((s.escala_titulo || 1) * 100)} sufixo="%"
          onMudar={(v) => setCampo("escala_titulo", v / 100)} dica="O título nunca fica menor que o mínimo legível; se não couber, o aviso aparece abaixo da prévia." />
        <Deslizante rotulo="Tamanho do texto" min={90} max={110} passo={1} valor={Math.round((s.escala_texto || 1) * 100)} sufixo="%"
          onMudar={(v) => setCampo("escala_texto", v / 100)} />
        {(s.escala_titulo && s.escala_titulo !== 1) || (s.escala_texto && s.escala_texto !== 1) ? (
          <button className="botao botao--pequeno" onClick={() => setSlide((y) => { const { escala_titulo, escala_texto, ...r } = y; return r as Slide; })}>Voltar ao tamanho padrão</button>
        ) : null}
      </section>

      <SecaoFoto carrossel={c} slide={s} indice={indice} alterar={alterar} modos={modelo.fotos || []} setSlide={setSlide} />
    </div>
  );
}

/* ---------- campos ---------- */
function contar(t: unknown) { return String(t || "").replace(/\*/g, "").length; }

function CampoEditor({ campo, valor, onMudar, idBase }: { campo: Campo; valor: any; onMudar: (v: any, grupo?: boolean) => void; idBase: string }) {
  const id = `${idBase}-${campo.chave}`;
  if (campo.tipo === "opcoes") {
    return (
      <label className="campo">
        <span className="campo-rotulo">{campo.rotulo}</span>
        <select id={id} value={valor ?? ""} onChange={(e) => onMudar(e.target.value, false)}>
          {campo.opcoes!.map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
        </select>
      </label>
    );
  }
  if (campo.tipo === "numero") {
    return (
      <label className="campo campo--estreito">
        <span className="campo-rotulo">{campo.rotulo}</span>
        <input id={id} type="number" min={campo.min} max={campo.max} value={valor ?? 0}
          onChange={(e) => onMudar(Math.max(campo.min ?? 0, Math.min(campo.max ?? 99, Number(e.target.value) || 0)))} />
      </label>
    );
  }
  if (campo.tipo === "lista") {
    const itens: string[] = Array.isArray(valor) ? valor : [];
    return (
      <div className="campo">
        <span className="campo-rotulo">{campo.rotulo} <em>({itens.length}{campo.max ? ` de até ${campo.max}` : ""})</em></span>
        {itens.map((it, i) => (
          <div className="item-lista" key={i}>
            <TextoComDestaque id={`${id}-${i}`} valor={it} max={campo.maxItem} curto rotulo={`${campo.rotulo} ${i + 1}`}
              onMudar={(v) => onMudar(itens.map((x, k) => (k === i ? v : x)))} />
            <button className="botao botao--icone" aria-label={`Remover item ${i + 1}`} onClick={() => onMudar(itens.filter((_, k) => k !== i), false)}>✕</button>
          </div>
        ))}
        <button className="botao botao--pequeno" disabled={!!campo.max && itens.length >= campo.max} onClick={() => onMudar([...itens, ""], false)}>+ Item</button>
      </div>
    );
  }
  if (campo.tipo === "blocos") {
    const blocos: any[] = Array.isArray(valor) ? valor : [];
    return (
      <div className="campo">
        {Array.from({ length: campo.quantidade || blocos.length }, (_, i) => (
          <fieldset className="grupo-bloco" key={i}>
            <legend>{campo.rotulo} · {i + 1}</legend>
            {campo.campos!.map((sub) => (
              <CampoEditor key={sub.chave} campo={sub} valor={obterCampo(blocos[i] || {}, sub.chave)} idBase={`${id}-${i}`}
                onMudar={(v, g) => onMudar(Array.from({ length: Math.max(blocos.length, campo.quantidade || 0) }, (_, k) => (k === i ? definirCampo(blocos[k] || {}, sub.chave, v) : blocos[k] || {})), g)} />
            ))}
          </fieldset>
        ))}
      </div>
    );
  }
  return (
    <div className="campo">
      <label className="campo-rotulo" htmlFor={id}>{campo.rotulo}</label>
      <TextoComDestaque id={id} valor={valor ?? ""} max={campo.max} curto={campo.tipo === "curto" && (campo.max ?? 99) < 50} semQuebra={campo.tipo === "curto"}
        destaque={campo.destaque ?? campo.tipo === "longo"} rotulo={campo.rotulo} onMudar={onMudar} />
      {campo.dica && <span className="dica">{campo.dica}</span>}
    </div>
  );
}

function TextoComDestaque({ id, valor, max, curto, semQuebra, destaque = true, rotulo, onMudar }: { id: string; valor: string; max?: number; curto?: boolean; semQuebra?: boolean; destaque?: boolean; rotulo: string; onMudar: (v: string) => void }) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const n = contar(valor);
  const excedeu = max !== undefined && n > max;
  function destacar() {
    const el = ref.current;
    if (!el) return;
    const [a, b] = [el.selectionStart ?? 0, el.selectionEnd ?? 0];
    if (a === b) return;
    const trecho = valor.slice(a, b);
    // alterna: se já está destacado, remove os asteriscos
    const novo = /^\*.*\*$/.test(trecho) ? valor.slice(0, a) + trecho.slice(1, -1) + valor.slice(b)
      : valor[a - 1] === "*" && valor[b] === "*" ? valor.slice(0, a - 1) + trecho + valor.slice(b + 1)
      : `${valor.slice(0, a)}*${trecho}*${valor.slice(b)}`;
    onMudar(novo);
    requestAnimationFrame(() => el.focus());
  }
  // títulos não têm quebra manual: o motor balanceia as linhas sozinho
  const props = { id, ref, value: valor, "aria-label": rotulo, "aria-invalid": excedeu,
    onChange: (e: any) => onMudar(semQuebra ? e.target.value.replace(/\s*\n\s*/g, " ") : e.target.value) };
  return (
    <div className="texto-destaque">
      {curto ? <input {...props} /> : <textarea rows={semQuebra ? 2 : 3} {...props} />}
      <div className="texto-destaque-rodape">
        {destaque ? <button type="button" className="botao-link" onMouseDown={(e) => e.preventDefault()} onClick={destacar}>Destacar seleção</button> : <span />}
        {max !== undefined && <span className={`contador${excedeu ? " contador--excedeu" : ""}`}>{n}/{max}{excedeu ? " · longo demais" : ""}</span>}
      </div>
    </div>
  );
}

function Deslizante({ rotulo, min, max, passo, valor, sufixo, onMudar, dica }: { rotulo: string; min: number; max: number; passo: number; valor: number; sufixo: string; onMudar: (v: number) => void; dica?: string }) {
  return (
    <label className="campo">
      <span className="campo-rotulo">{rotulo} <em>{valor}{sufixo}</em></span>
      <input type="range" min={min} max={max} step={passo} value={valor} onChange={(e) => onMudar(Number(e.target.value))} />
      {dica && <span className="dica">{dica}</span>}
    </label>
  );
}

/* ---------- fotografia ---------- */
function SecaoFoto({ carrossel: c, slide: s, indice, alterar, modos, setSlide }: { carrossel: Carrossel; slide: Slide; indice: number; alterar: Alterar; modos: string[]; setSlide: (fn: (s: Slide) => Slide, grupo?: string) => void }) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [seletor, setSeletor] = useState(false);
  const { avisar, confirmar } = useAvisos();
  const entrada = useRef<HTMLInputElement>(null);
  useEffect(() => { api.fotos(c.id).then(setFotos).catch(() => {}); }, [c.id]);

  if (!modos.length) {
    return (
      <section className="secao">
        <h3>Fotografia</h3>
        <p className="dica">Este modelo é exclusivamente tipográfico. Fotos estão disponíveis em: Capa de impacto, Provocação, Lista numerada (foto de detalhe), Explicação (lateral) e Encerramento (retrato na assinatura).</p>
        <button className="botao botao--pequeno" onClick={() => setSeletor(true)}>Usar foto da biblioteca (oferece trocar o modelo)…</button>
        {seletor && <SeletorImagem onFechar={() => setSeletor(false)} onEscolher={(im) => { setSeletor(false); void aplicarImagem({ carrossel: c, indice, imagem: im, alterar, confirmar, avisar }); }} />}
      </section>
    );
  }
  const f = s.foto || null;
  const setFoto = (patch: any, grupo?: string) => setSlide((y) => ({ ...y, foto: { ...(y.foto || {}), ...patch } }), grupo);

  async function enviar(arquivo?: File) {
    if (!arquivo) return;
    if (!/^image\/(jpeg|png|webp)$/.test(arquivo.type)) return avisar("Formato não aceito. Use JPG, PNG ou WebP.", "erro");
    if (arquivo.size > 20 * 1024 * 1024) return avisar("Arquivo grande demais (máximo 20 MB).", "erro");
    setEnviando(true);
    try {
      const r = await api.enviarFoto(c.id, arquivo);
      setFotos((x) => [...x, r]);
      setFoto({ arquivo: r.arquivo, modo: f?.modo && modos.includes(f.modo) ? f.modo : modos[0], x: 50, y: 50, zoom: 1, exposicao: 1, contraste: 1 });
      avisar(r.aviso || "Foto adicionada.", r.aviso ? "info" : "ok");
    } catch (e: any) { avisar(e.message, "erro"); } finally { setEnviando(false); if (entrada.current) entrada.current.value = ""; }
  }

  return (
    <section className="secao" data-testid="secao-foto">
      <h3>Fotografia</h3>
      <div className="segmentado segmentado--largo" role="group" aria-label="Uso de foto">
        <button className={!f?.arquivo ? "ativo" : ""} onClick={() => setSlide((y) => { const { foto, ...r } = y; return r as Slide; })}>Só tipografia</button>
        {modos.map((m) => (
          <button key={m} className={f?.arquivo && (f.modo || modos[0]) === m ? "ativo" : ""} disabled={!f?.arquivo && !fotos.length}
            onClick={() => setFoto({ arquivo: f?.arquivo || fotos[fotos.length - 1]?.arquivo, modo: m })}>{(MODOS_FOTO as Record<string, string>)[m]}</button>
        ))}
      </div>
      <input ref={entrada} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => enviar(e.target.files?.[0])} data-testid="enviar-foto" />
      <div className="linha-botoes">
        <button className="botao botao--pequeno" onClick={() => setSeletor(true)}>Usar da Minha Biblioteca…</button>
        <button className="botao botao--pequeno" disabled={enviando} onClick={() => entrada.current?.click()}>{enviando ? "Enviando…" : "Enviar foto só para este projeto"}</button>
      </div>
      {seletor && <SeletorImagem onFechar={() => setSeletor(false)} onEscolher={(im) => { setSeletor(false); void aplicarImagem({ carrossel: c, indice, imagem: im, alterar, confirmar, avisar }).then(() => api.fotos(c.id).then(setFotos).catch(() => {})); }} />}
      {fotos.length > 0 && (
        <div className="galeria" role="listbox" aria-label="Fotos do projeto">
          {fotos.map((x) => (
            <button key={x.arquivo} role="option" aria-selected={f?.arquivo === x.arquivo} className={`galeria-item${f?.arquivo === x.arquivo ? " ativa" : ""}`}
              onClick={() => setFoto({ arquivo: x.arquivo, modo: f?.modo && modos.includes(f.modo) ? f.modo : modos[0] })} title={`${x.largura}×${x.altura}`}>
              <img src={urlFoto(c.id)(x.arquivo)} alt="" />
            </button>
          ))}
        </div>
      )}
      {f?.arquivo && (
        <>
          <p className="dica">Recorte e posição não alteram a foto: só escolhem a parte visível. Rosto, pele e cenário ficam como no original.</p>
          {(() => { const info = fotos.find((x) => x.arquivo === f.arquivo); const av = info ? avisoResolucao(s, f.modo || modos[0], info.largura, f.zoom ?? 1) : null; return av ? <p className="dica dica--erro" data-testid="aviso-resolucao">{av}</p> : null; })()}
          {f.origem?.credito && (
            <div className="credito-config">
              <p className="dica"><b>Origem:</b> {f.origem.credito}{f.origem.licenca ? "" : ""}</p>
              <label className="mb-aceite"><input type="checkbox" checked={f.creditoNaArte !== false} onChange={(e) => setFoto({ creditoNaArte: e.target.checked })} /> Mostrar o crédito na arte (sempre incluído em creditos.txt)</label>
            </div>
          )}
          <Deslizante rotulo="Posição horizontal" min={0} max={100} passo={1} valor={Math.round(f.x ?? 50)} sufixo="%" onMudar={(v) => setFoto({ x: v }, "foto-x")} />
          <Deslizante rotulo="Posição vertical" min={0} max={100} passo={1} valor={Math.round(f.y ?? 50)} sufixo="%" onMudar={(v) => setFoto({ y: v }, "foto-y")} />
          <Deslizante rotulo="Aproximação" min={100} max={250} passo={5} valor={Math.round((f.zoom ?? 1) * 100)} sufixo="%" onMudar={(v) => setFoto({ zoom: v / 100 }, "foto-z")} />
          <Deslizante rotulo="Exposição" min={85} max={115} passo={1} valor={Math.round((f.exposicao ?? 1) * 100)} sufixo="%" onMudar={(v) => setFoto({ exposicao: v / 100 }, "foto-e")} />
          <Deslizante rotulo="Contraste" min={85} max={115} passo={1} valor={Math.round((f.contraste ?? 1) * 100)} sufixo="%" onMudar={(v) => setFoto({ contraste: v / 100 }, "foto-c")} />
          <label className="campo">
            <span className="campo-rotulo">Descrição da foto (acessibilidade)</span>
            <input value={f.descricao || ""} onChange={(e) => setFoto({ descricao: e.target.value }, "foto-d")} maxLength={140} />
          </label>
        </>
      )}
    </section>
  );
}
