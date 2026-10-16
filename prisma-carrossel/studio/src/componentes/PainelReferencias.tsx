// Aba "Referências e Universalidade" do editor. Mostra, para o slide
// selecionado, a função editorial, o conceito central, referências do
// repertório curado com justificativa e pontuação, fotos da sua biblioteca e
// a busca em acervos externos. Nada muda na arte sem você confirmar.
import { useEffect, useMemo, useRef, useState } from "react";
import type { Carrossel, Slide } from "../tipos";
import { apiUniv, ROTULO_STATUS, type ImagemBiblioteca } from "../api";
import { useAvisos } from "./Avisos";
import { BuscaExterna } from "./BuscaExterna";
import { SeletorImagem } from "./SeletorImagem";
import { aplicarImagem } from "./aplicarImagem";
// @ts-ignore módulos puros do motor
import { recomendarParaSlide, FILTROS, CRITERIOS, NIVEL_FAMILIARIDADE, NIVEL_DISTRACAO } from "../../../src/universalidade/recomendar.js";

type Alterar = (fn: (c: Carrossel) => Carrossel, grupo?: string) => void;
const TOM: Record<string, string> = { propria: "ok", condicionado: "alerta", referencia: "neutro" };
const NOMES_PARTES: Record<string, string> = { aderencia: "aderência", familiaridade: "familiaridade (hipótese)", metafora: "força metafórica", disponibilidade: "imagem disponível", funcao: "função do slide", distracao: "distração" };

export function PainelReferencias({ carrossel: c, indice, alterar }: { carrossel: Carrossel; indice: number; alterar: Alterar }) {
  const s = c.slides[indice];
  const [imagens, setImagens] = useState<ImagemBiblioteca[]>([]);
  const [filtro, setFiltro] = useState<string>("todas");
  const [verMais, setVerMais] = useState(false);
  const [termoBusca, setTermoBusca] = useState<string | null>(null);
  const [seletor, setSeletor] = useState(false);
  const [ia, setIa] = useState<string>("");
  const buscaRef = useRef<HTMLDivElement>(null);
  const { avisar, confirmar } = useAvisos();

  const carregarImagens = () => apiUniv.biblioteca().then((b) => setImagens(b.imagens)).catch(() => {});
  useEffect(() => { void carregarImagens(); apiUniv.integracoes().then((x) => setIa(x.ia.ativo ? `IA ativa: ${x.ia.provedor}` : "")).catch(() => {}); }, []);

  const univ = s.universalidade || {};
  const rec = useMemo(() => recomendarParaSlide(s, { imagens, rejeitadas: univ.rejeitadas || [], limite: 40 }), [JSON.stringify(s), imagens]); // eslint-disable-line
  const setUniv = (patch: Record<string, any>) =>
    alterar((x) => ({ ...x, slides: x.slides.map((y, k) => (k === indice ? { ...y, universalidade: { ...(y.universalidade || {}), ...patch } } as Slide : y)) }));

  const referencias = (rec.referencias as any[]).filter((r) => filtro === "todas" || r.filtros.includes(filtro));
  const exibidas = filtro === "todas" && !verMais ? referencias.slice(0, 6) : referencias;
  const escolhida = univ.escolhida;

  function buscarImagens(termo: string) {
    setTermoBusca(termo);
    requestAnimationFrame(() => buscaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  async function usar(im: ImagemBiblioteca) {
    setSeletor(false);
    await aplicarImagem({ carrossel: c, indice, imagem: im, alterar, confirmar, avisar });
  }
  async function soTipografia() {
    if (s.foto?.arquivo && !(await confirmar({ titulo: "Remover a foto deste slide?", texto: "O slide volta a ser só tipografia. Você pode desfazer com Ctrl+Z.", confirmar: "Remover foto" }))) return;
    alterar((x) => ({ ...x, slides: x.slides.map((y, k) => { if (k !== indice) return y; const { foto, ...r } = y; return { ...r, universalidade: { ...(y.universalidade || {}), escolhida: { id: "tipografia", nome: "Apenas tipografia", em: new Date().toISOString() } } } as Slide; }) }));
  }

  const minhas = imagens.filter((im) => im.tipo === "pessoal" || im.tipo === "propria");
  const licenciadas = imagens.filter((im) => im.tipo === "licenciada");

  return (
    <div className="painel" data-testid="painel-referencias">
      <section className="secao">
        <h3>Referências e Universalidade</h3>
        <dl className="univ-resumo">
          <dt>Função</dt><dd>{rec.funcao}</dd>
          <dt>Conceito central</dt><dd data-testid="conceito-central">{rec.conceitoCentral}</dd>
          <dt>Reação pretendida</dt><dd>{rec.emocao}</dd>
          <dt>Layout recomendado</dt><dd>{rec.layout}</dd>
        </dl>
        <p className="dica">{ia || "Sugestões do repertório curado do PRISMA cruzado com o texto do slide por regras locais (sem IA)."}</p>
        <details className="univ-criterios"><summary>Como a pontuação é calculada</summary><ul>{(CRITERIOS as string[]).map((x) => <li key={x}>{x}</li>)}</ul><p>{rec.aviso}</p></details>
        {escolhida && (
          <div className="univ-escolhida" data-testid="referencia-escolhida">
            <span>Referência escolhida: <b>{escolhida.nome}</b></span>
            <button className="botao botao--pequeno" onClick={() => setUniv({ escolhida: null })}>Substituir</button>
          </div>
        )}
        {s.foto?.origem?.credito && <p className="dica">Crédito da foto atual: {s.foto.origem.credito}</p>}
      </section>

      <div className="univ-filtros" role="group" aria-label="Filtros">
        <button className={filtro === "todas" ? "ativo" : ""} onClick={() => setFiltro("todas")}>Todas</button>
        {Object.entries(FILTROS as Record<string, string>).map(([k, r]) => <button key={k} className={filtro === k ? "ativo" : ""} onClick={() => setFiltro(k)} data-filtro={k}>{r}</button>)}
      </div>

      {filtro === "minhas-fotos" && (
        <section className="secao">
          <h3>Minhas fotos</h3>
          {rec.fotosSugeridas.length > 0 && <p className="dica">Sugeridas pelas etiquetas que você escreveu (sem análise automática de imagem):</p>}
          {(rec.fotosSugeridas as any[]).map((f) => (
            <div className="univ-foto" key={f.imagem.id}>
              <img src={apiUniv.urlImagem(f.imagem.id, f.imagem.atualizadaEm)} alt="" style={{ objectPosition: `${f.imagem.foco.x}% ${f.imagem.foco.y}%` }} />
              <div><b>{f.imagem.nome}</b><span className="dica">{f.motivos.join(" · ")}</span><button className="botao botao--pequeno botao--primario" onClick={() => usar(f.imagem)}>Inserir no slide</button></div>
            </div>
          ))}
          {minhas.length === 0 ? <p className="dica">Nenhuma foto pessoal ainda.</p> : <p className="dica">{minhas.length} foto(s) pessoal(is) ou própria(s) na biblioteca.</p>}
          <button className="botao botao--pequeno" onClick={() => setSeletor(true)}>Usar foto pessoal…</button>
        </section>
      )}

      {filtro === "licenciadas" && (
        <section className="secao">
          <h3>Imagens licenciadas da biblioteca</h3>
          {licenciadas.length === 0 && <p className="dica">Nenhuma ainda. Busque abaixo e importe.</p>}
          {licenciadas.map((im) => (
            <div className="univ-foto" key={im.id} data-licenciada={im.status}>
              <img src={apiUniv.urlImagem(im.id, im.atualizadaEm)} alt="" />
              <div>
                <b>{im.nome}</b>
                <span className="dica">{im.origem?.fonte} · {im.origem?.licenca || "licença não informada"} · {ROTULO_STATUS[im.status]}</span>
                {im.status === "aprovado"
                  ? <button className="botao botao--pequeno botao--primario" onClick={() => usar(im)}>Inserir no slide</button>
                  : <a className="botao botao--pequeno" href="#/biblioteca">Conferir licença e aprovar</a>}
              </div>
            </div>
          ))}
          <div ref={buscaRef}><BuscaExterna termoInicial={termoBusca || ""} onImportada={() => void carregarImagens()} compacto /></div>
        </section>
      )}

      {filtro === "tipografia" || filtro === "todas" ? (
        <section className="secao univ-cartao univ-cartao--tipo" data-ref="tipografia">
          <div className="univ-cartao-cabeca"><b>Apenas tipografia</b><span className="univ-pontos">{rec.tipografia.pontuacao}</span></div>
          <p>{rec.tipografia.justificativa}</p>
          <button className="botao botao--pequeno" onClick={soTipografia}>{s.foto?.arquivo ? "Remover foto e manter só tipografia" : "Marcar como escolha deste slide"}</button>
        </section>
      ) : null}

      {!["minhas-fotos", "licenciadas", "tipografia"].includes(filtro) && (
        <section className="secao">
          {exibidas.length === 0 && <p className="dica">Nenhuma referência do repertório para este filtro e este texto. Use a busca manual abaixo.</p>}
          {exibidas.map((r: any) => (
            <article key={r.id} className={`univ-cartao${escolhida?.id === r.id ? " escolhida" : ""}`} data-ref={r.id}>
              <div className="univ-cartao-cabeca">
                <b>{r.nome}</b>
                <span className="univ-pontos" title="Estimativa editorial (0–100)">{r.pontuacao.total}</span>
              </div>
              {r.ficha && <span className="dica">{r.ficha}</span>}
              <div className="univ-selos">
                <span className="selo selo--neutro">{r.rotuloTipo}</span>
                <span className={`selo selo--${TOM[r.statusImagem.estado]}`}>{r.statusImagem.rotulo}</span>
              </div>
              <p className="univ-conexao">{r.conexao}</p>
              <p className="dica">Cobre: {r.conceitosCobertos.join(", ")} · familiaridade {(NIVEL_FAMILIARIDADE as any)[r.familiaridade]} (hipótese) · distração {(NIVEL_DISTRACAO as any)[r.distracao]}</p>
              {r.verificar && <p className="dica dica--erro">⚠ Verificar antes de citar: {r.verificar}</p>}
              {r.imagem?.nota && <p className="dica">{r.imagem.nota}</p>}
              <details><summary>Pontuação</summary><ul>{Object.entries(r.pontuacao.partes).map(([k, v]) => <li key={k}>{NOMES_PARTES[k] || k}: {Number(v) > 0 ? "+" : ""}{String(v)}</li>)}</ul></details>
              <div className="univ-acoes">
                {escolhida?.id === r.id
                  ? <button className="botao botao--pequeno" onClick={() => setUniv({ escolhida: null })}>Substituir</button>
                  : <button className="botao botao--pequeno botao--primario" onClick={() => setUniv({ escolhida: { id: r.id, nome: r.nome, em: new Date().toISOString() } })}>Selecionar</button>}
                {r.imagem?.termos?.length > 0 && <button className="botao botao--pequeno" onClick={() => { setFiltro("licenciadas"); buscarImagens(r.imagem.termos[0]); }}>Buscar imagens</button>}
                <button className="botao botao--pequeno" onClick={() => setSeletor(true)}>Usar foto pessoal</button>
                <button className="botao botao--pequeno botao--fantasma-perigo" onClick={() => setUniv({ rejeitadas: [...(univ.rejeitadas || []), r.id], escolhida: escolhida?.id === r.id ? null : escolhida })}>Rejeitar</button>
              </div>
            </article>
          ))}
          <div className="linha-botoes">
            {filtro === "todas" && referencias.length > 6 && <button className="botao botao--pequeno" onClick={() => setVerMais((v) => !v)}>{verMais ? "Mostrar menos" : `Buscar alternativas (${referencias.length - 6} no repertório)`}</button>}
            {(univ.rejeitadas || []).length > 0 && <button className="botao-link" onClick={() => setUniv({ rejeitadas: [] })}>Restaurar {univ.rejeitadas.length} rejeitada(s)</button>}
            <button className="botao botao--pequeno" onClick={() => { setFiltro("licenciadas"); buscarImagens(""); }}>Busca manual em acervos</button>
          </div>
          <p className="dica">“Selecionar” registra a referência escolhida para o slide (não altera a arte). Para mudar a imagem, use “Usar foto pessoal” ou importe e aprove uma imagem licenciada.</p>
        </section>
      )}

      {seletor && <SeletorImagem onEscolher={usar} onFechar={() => { setSeletor(false); void carregarImagens(); }} />}
    </div>
  );
}
