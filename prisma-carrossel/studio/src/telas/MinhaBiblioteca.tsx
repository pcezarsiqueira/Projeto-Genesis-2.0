// Minha Biblioteca: fotos pessoais, imagens próprias, licenciadas e
// referências de inspiração, com álbuns, etiquetas, favoritos, recorte
// (ponto de interesse) e controle de direitos de uso.
import { useEffect, useMemo, useRef, useState } from "react";
import { apiUniv, ROTULO_STATUS, ROTULO_TIPO_IMAGEM, type Album, type ImagemBiblioteca } from "../api";
import { useAvisos } from "../componentes/Avisos";
import { NavPrincipal } from "../componentes/NavPrincipal";
import { BuscaExterna } from "../componentes/BuscaExterna";
import { Marca } from "./Biblioteca";

const TOM_STATUS: Record<string, string> = { aprovado: "ok", condicionado: "alerta", referencia: "neutro" };

export function MinhaBiblioteca() {
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [imagens, setImagens] = useState<ImagemBiblioteca[] | null>(null);
  const [album, setAlbum] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [tipoEnvio, setTipoEnvio] = useState("pessoal");
  const [enviando, setEnviando] = useState("");
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  const { avisar, confirmar } = useAvisos();

  async function carregar() {
    try { const b = await apiUniv.biblioteca(); setAlbuns(b.albuns); setImagens(b.imagens); } catch (e: any) { avisar(e.message, "erro"); }
  }
  useEffect(() => { void carregar(); }, []); // eslint-disable-line

  const visiveis = useMemo(() => {
    const q = busca.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
    return (imagens || []).filter((im) => {
      if (album === "favoritas" && !im.favorita) return false;
      if (album !== "todas" && album !== "favoritas" && !im.albuns.includes(album)) return false;
      if (filtroTipo && im.tipo !== filtroTipo) return false;
      if (!q) return true;
      const alvo = [im.nome, im.descricao, im.contexto, ...im.etiquetas].join(" ").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
      return q.split(/\s+/).every((p) => alvo.includes(p));
    });
  }, [imagens, album, busca, filtroTipo]);

  async function enviar(arquivos: FileList | null) {
    if (!arquivos?.length) return;
    const lista = Array.from(arquivos);
    let ok = 0;
    for (let i = 0; i < lista.length; i++) {
      const f = lista[i];
      setEnviando(`Enviando ${i + 1} de ${lista.length}…`);
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { avisar(`${f.name}: formato não aceito (use JPG, PNG ou WebP).`, "erro"); continue; }
      if (f.size > 20 * 1024 * 1024) { avisar(`${f.name}: maior que 20 MB.`, "erro"); continue; }
      try {
        const r = await apiUniv.enviarImagem(f, tipoEnvio, album.startsWith("alb-") ? [album] : []);
        ok++;
        if (r.aviso) avisar(`${f.name}: ${r.aviso}`, "info");
      } catch (e: any) { avisar(`${f.name}: ${e.message}`, "erro"); }
    }
    setEnviando("");
    if (entrada.current) entrada.current.value = "";
    if (ok) avisar(`${ok} ${ok === 1 ? "imagem adicionada" : "imagens adicionadas"} à biblioteca.`);
    await carregar();
  }

  async function novoAlbum() {
    const nome = window.prompt("Nome do novo álbum:");
    if (!nome?.trim()) return;
    try { const a = await apiUniv.criarAlbum(nome.trim()); await carregar(); setAlbum(a.id); } catch (e: any) { avisar(e.message, "erro"); }
  }
  async function excluirAlbum(a: Album) {
    if (!(await confirmar({ titulo: `Remover o álbum “${a.nome}”?`, texto: "As imagens continuam na biblioteca; só deixam de estar neste álbum.", confirmar: "Remover álbum", perigo: true }))) return;
    try { await apiUniv.removerAlbum(a.id); if (album === a.id) setAlbum("todas"); await carregar(); } catch (e: any) { avisar(e.message, "erro"); }
  }
  async function alternarFavorita(im: ImagemBiblioteca) {
    try { await apiUniv.atualizarImagem(im.id, { favorita: !im.favorita }); await carregar(); } catch (e: any) { avisar(e.message, "erro"); }
  }

  const selecionada = imagens?.find((x) => x.id === sel) || null;
  const contar = (f: (im: ImagemBiblioteca) => boolean) => (imagens || []).filter(f).length;

  return (
    <div className="pagina pagina--cheia">
      <header className="barra-topo">
        <Marca />
        <NavPrincipal ativa="biblioteca" />
        <div className="barra-topo-acoes">
          <button className="botao" onClick={() => setMostrarBusca((v) => !v)} aria-expanded={mostrarBusca}>{mostrarBusca ? "Fechar busca" : "Buscar em acervos"}</button>
          <select value={tipoEnvio} onChange={(e) => setTipoEnvio(e.target.value)} aria-label="Tipo das imagens a enviar" title="Como as próximas imagens serão classificadas">
            <option value="pessoal">Enviar como: foto pessoal</option>
            <option value="propria">Enviar como: imagem própria</option>
            <option value="licenciada">Enviar como: licenciada (informar licença)</option>
            <option value="inspiracao">Enviar como: referência de inspiração</option>
          </select>
          <input ref={entrada} type="file" multiple accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => enviar(e.target.files)} data-testid="enviar-biblioteca" />
          <button className="botao botao--primario" disabled={!!enviando} onClick={() => entrada.current?.click()}>{enviando || "+ Enviar fotos"}</button>
        </div>
      </header>

      <div className="mb-corpo">
        <aside className="mb-albuns" aria-label="Álbuns">
          <button className={`mb-album${album === "todas" ? " ativo" : ""}`} onClick={() => setAlbum("todas")}>Todas <em>{contar(() => true)}</em></button>
          <button className={`mb-album${album === "favoritas" ? " ativo" : ""}`} onClick={() => setAlbum("favoritas")}>★ Favoritas <em>{contar((i) => i.favorita)}</em></button>
          <div className="mb-albuns-titulo">Álbuns</div>
          {albuns.map((a) => (
            <div key={a.id} className="mb-album-linha">
              <button className={`mb-album${album === a.id ? " ativo" : ""}`} onClick={() => setAlbum(a.id)}>{a.nome} <em>{contar((i) => i.albuns.includes(a.id))}</em></button>
              <button className="mb-album-x" aria-label={`Remover álbum ${a.nome}`} onClick={() => excluirAlbum(a)}>✕</button>
            </div>
          ))}
          <button className="botao botao--pequeno" onClick={novoAlbum}>+ Novo álbum</button>
        </aside>

        <main className="mb-principal">
          {mostrarBusca && (
            <section className="mb-busca">
              <h2>Buscar em acervos abertos</h2>
              <BuscaExterna albuns={album.startsWith("alb-") ? [album] : []} onImportada={(im) => { void carregar(); setSel(im.id); }} />
            </section>
          )}
          <div className="mb-ferramentas">
            <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, etiqueta ou descrição" aria-label="Buscar na biblioteca" />
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} aria-label="Filtrar por tipo">
              <option value="">Todos os tipos</option>
              {Object.entries(ROTULO_TIPO_IMAGEM).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
            </select>
            <span className="dica">{visiveis.length} de {imagens?.length ?? 0}</span>
          </div>
          {imagens && imagens.length === 0 && (
            <div className="vazio">
              <p>Sua biblioteca está vazia. Envie fotos suas (palestras, estúdio, expressões) para reutilizar nos carrosséis.</p>
              <button className="botao botao--primario" onClick={() => entrada.current?.click()}>Enviar as primeiras fotos</button>
            </div>
          )}
          <div className="mb-grade">
            {visiveis.map((im) => (
              <article key={im.id} className={`mb-item${sel === im.id ? " ativo" : ""}`} data-imagem={im.id}>
                <button className="mb-item-img" onClick={() => setSel(im.id)} aria-label={`Abrir ${im.nome}`}>
                  <img src={apiUniv.urlImagem(im.id, im.atualizadaEm)} alt={im.descricao || im.nome} loading="lazy" style={{ objectPosition: `${im.foco.x}% ${im.foco.y}%` }} />
                </button>
                <button className={`mb-estrela${im.favorita ? " ativa" : ""}`} aria-label={im.favorita ? "Remover dos favoritos" : "Marcar como favorita"} aria-pressed={im.favorita} onClick={() => alternarFavorita(im)}>★</button>
                <div className="mb-item-info">
                  <b title={im.nome}>{im.nome}</b>
                  <span className={`selo selo--${TOM_STATUS[im.status]}`}>{ROTULO_STATUS[im.status]}</span>
                </div>
              </article>
            ))}
          </div>
        </main>

        {selecionada && <DetalheImagem key={selecionada.id} im={selecionada} albuns={albuns} onMudou={carregar} onFechar={() => setSel(null)} />}
      </div>
    </div>
  );
}

/* ---------- detalhe e direitos ---------- */
const FUNCOES_POR_PALAVRA: [RegExp, string][] = [
  [/desconfi|serio|olhar|cetic/, "Capa de impacto ou Provocação"],
  [/pensativ|duvid|refle/, "Provocação"],
  [/sorri|descontra|rindo|alegr/, "Encerramento e comentário (retrato na assinatura)"],
  [/palestra|palco|aula|microfone/, "Capa de impacto (foto de fundo) ou Explicação (foto lateral)"],
  [/estudio|profissional|retrato/, "Encerramento (retrato na assinatura)"],
  [/objeto|cotidian|celular|lupa|mesa/, "Lista numerada (foto de detalhe)"],
  [/figurino|personagem|perciwaldo/, "Capa de impacto ou slide de humor (Exemplo)"],
];

export function sugestoesDeUso(im: ImagemBiblioteca): string[] {
  const t = [im.nome, im.descricao, im.contexto, ...im.etiquetas].join(" ").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const s = new Set<string>();
  for (const [re, f] of FUNCOES_POR_PALAVRA) if (re.test(t)) s.add(f);
  if (im.largura > im.altura * 1.15) s.add("Formato horizontal: foto acima do título na capa ou foto de detalhe larga (composição C)");
  if (im.altura > im.largura * 1.15) s.add("Formato vertical: foto lateral (Explicação) ou retrato na assinatura");
  if (im.largura && im.largura < 1080) s.add(`Resolução ${im.largura} px: evite usar como foto de fundo da capa (pede 1080 px)`);
  return [...s];
}

function DetalheImagem({ im, albuns, onMudou, onFechar }: { im: ImagemBiblioteca; albuns: Album[]; onMudou: () => Promise<void>; onFechar: () => void }) {
  const [f, setF] = useState({ nome: im.nome, descricao: im.descricao, contexto: im.contexto, etiquetas: im.etiquetas.join(", ") });
  const [origem, setOrigem] = useState({ fonte: im.origem?.fonte || "", titulo: im.origem?.titulo || "", autor: im.origem?.autor || "", licenca: im.origem?.licenca || "", licencaUrl: im.origem?.licencaUrl || "", urlOriginal: im.origem?.urlOriginal || "" });
  const [autorizacao, setAutorizacao] = useState(im.autorizacao?.descricao || "");
  const [aceite, setAceite] = useState(false);
  const substituto = useRef<HTMLInputElement>(null);
  const { avisar, confirmar } = useAvisos();
  const salvar = async (dados: Record<string, any>, msg = "Alterações salvas.") => {
    try { await apiUniv.atualizarImagem(im.id, dados); await onMudou(); avisar(msg); } catch (e: any) { avisar(e.message, "erro"); }
  };
  const alterado = f.nome !== im.nome || f.descricao !== im.descricao || f.contexto !== im.contexto || f.etiquetas !== im.etiquetas.join(", ");

  async function substituir(arq?: File) {
    if (!arq) return;
    if (!(await confirmar({ titulo: "Substituir o arquivo?", texto: "Os dados (nome, etiquetas, álbuns) ficam. Carrosséis que já usam esta foto mantêm a versão antiga, que foi copiada para eles.", confirmar: "Substituir" }))) return;
    try { await apiUniv.substituirArquivo(im.id, arq); await onMudou(); avisar("Arquivo substituído."); } catch (e: any) { avisar(e.message, "erro"); }
  }
  async function remover() {
    const usos = im.projetos.length ? ` Ela foi usada em ${im.projetos.length} carrossel(éis); as artes já feitas não mudam.` : "";
    if (!(await confirmar({ titulo: "Remover da biblioteca?", texto: `“${im.nome}” vai para a lixeira do PRISMA (dados/lixeira/biblioteca).${usos}`, confirmar: "Remover", perigo: true }))) return;
    try { await apiUniv.removerImagem(im.id); onFechar(); await onMudou(); avisar("Imagem removida."); } catch (e: any) { avisar(e.message, "erro"); }
  }
  const sugestoes = sugestoesDeUso(im);
  const origemDaFonte = im.origem && !im.origem.manual;

  return (
    <aside className="mb-detalhe" aria-label="Detalhes da imagem" data-testid="detalhe-imagem">
      <div className="mb-detalhe-cabeca">
        <b>Detalhes</b>
        <button className="botao botao--icone" aria-label="Fechar" onClick={onFechar}>×</button>
      </div>
      <div className="mb-foco-moldura"><div className="mb-foco" title="Clique no ponto mais importante da foto (rosto, objeto). Os recortes vão preservá-lo."
        onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); void salvar({ foco: { x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100) } }, "Ponto de interesse definido."); }}>
        <img src={apiUniv.urlImagem(im.id, im.atualizadaEm)} alt={im.descricao || im.nome} />
        <i className="mb-foco-ponto" style={{ left: `${im.foco.x}%`, top: `${im.foco.y}%` }} />
      </div></div>
      <p className="dica">Clique na foto para marcar o ponto de interesse (ex.: seu rosto). Ele é usado como centro do recorte nos slides. {im.largura}×{im.altura} px · {(im.bytes / 1024 / 1024).toFixed(1)} MB</p>

      <section className="secao">
        <h3>Uso e direitos</h3>
        <div className="mb-direitos">
          <span className={`selo selo--${TOM_STATUS[im.status]}`} data-status={im.status}>{ROTULO_STATUS[im.status]}</span>
          <select value={im.tipo} aria-label="Tipo da imagem" onChange={(e) => salvar({ tipo: e.target.value }, "Tipo alterado.")}>
            {Object.entries(ROTULO_TIPO_IMAGEM).map(([v, r]) => <option key={v} value={v} disabled={!!origemDaFonte && (v === "pessoal" || v === "propria")}>{r}</option>)}
          </select>
        </div>
        {im.tipo === "inspiracao" && <p className="dica">Referência de estilo: fica só para consulta e <b>nunca</b> entra na arte exportada.</p>}
        {(im.tipo === "pessoal" || im.tipo === "propria") && <p className="dica">Você declarou que a imagem é sua: pode entrar na publicação. Se houver outras pessoas reconhecíveis, garanta a autorização delas.</p>}
        {im.tipo === "licenciada" && (
          <>
            {origemDaFonte ? (
              <dl className="mb-origem">
                <dt>Fonte</dt><dd>{im.origem!.fonte}</dd>
                {im.origem!.titulo && <><dt>Título</dt><dd>{im.origem!.titulo}</dd></>}
                <dt>Autor</dt><dd>{im.origem!.autor || "não informado"}</dd>
                <dt>Licença</dt><dd>{im.origem!.licencaUrl ? <a href={im.origem!.licencaUrl} target="_blank" rel="noopener noreferrer">{im.origem!.licenca}</a> : im.origem!.licenca || "não informada"}</dd>
                {im.origem!.urlOriginal && <><dt>Original</dt><dd><a href={im.origem!.urlOriginal} target="_blank" rel="noopener noreferrer">abrir página</a></dd></>}
                {im.origem!.consultadoEm && <><dt>Consulta</dt><dd>{new Date(im.origem!.consultadoEm).toLocaleString("pt-BR")}{im.origem!.termo ? ` · busca “${im.origem!.termo}”` : ""}</dd></>}
              </dl>
            ) : (
              <div className="mb-origem-manual">
                <p className="dica">Informe de onde veio a imagem. Nada é preenchido automaticamente.</p>
                {(["fonte", "titulo", "autor", "licenca", "licencaUrl", "urlOriginal"] as const).map((k) => (
                  <label className="campo" key={k}><span className="campo-rotulo">{{ fonte: "Fonte (site/acervo)", titulo: "Título", autor: "Autor", licenca: "Licença (ex.: CC BY 4.0)", licencaUrl: "Link da licença", urlOriginal: "Página original" }[k]}</span>
                    <input value={origem[k]} onChange={(e) => setOrigem({ ...origem, [k]: e.target.value })} /></label>
                ))}
                <button className="botao botao--pequeno" onClick={() => salvar({ origemManual: origem }, "Origem registrada.")}>Registrar origem</button>
              </div>
            )}
            {im.origem?.obrigacoes?.length ? <ul className="mb-obrigacoes">{im.origem.obrigacoes.map((o) => <li key={o}>{o}</li>)}</ul> : null}
            {im.status !== "aprovado" && im.origem?.licenca && (
              <div className="mb-aprovar">
                <label className="mb-aceite"><input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} /> Li as condições acima e vou cumpri-las (incluindo o crédito na arte ou na legenda).</label>
                <button className="botao botao--primario botao--pequeno" disabled={!aceite} onClick={() => salvar({ confirmarCondicoes: true }, "Imagem aprovada para exportação.")}>Aprovar para exportação</button>
              </div>
            )}
            {im.condicoesConfirmadas && <p className="dica dica--ok">Condições confirmadas em {new Date(im.condicoesConfirmadas.em).toLocaleDateString("pt-BR")}. <button className="botao-link" onClick={() => salvar({ confirmarCondicoes: false }, "Aprovação revogada.")}>Revogar</button></p>}
          </>
        )}
        {im.tipo !== "inspiracao" && im.tipo !== "pessoal" && im.tipo !== "propria" && (
          <label className="campo">
            <span className="campo-rotulo">Licença ou autorização obtida (opcional)</span>
            <textarea rows={2} value={autorizacao} onChange={(e) => setAutorizacao(e.target.value)} placeholder="Ex.: Autorização por e-mail do fotógrafo em 10/10/2026 para uso no Instagram." />
            <div className="linha-botoes">
              <button className="botao botao--pequeno" disabled={autorizacao.trim().length < 10} onClick={() => salvar({ autorizacao: { descricao: autorizacao } }, "Autorização registrada.")}>Registrar autorização</button>
              {im.autorizacao && <button className="botao-link" onClick={() => { setAutorizacao(""); void salvar({ autorizacao: null }, "Autorização removida."); }}>Remover</button>}
            </div>
          </label>
        )}
      </section>

      <section className="secao">
        <h3>Descrição</h3>
        <label className="campo"><span className="campo-rotulo">Nome</span><input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></label>
        <label className="campo"><span className="campo-rotulo">Descrição (o que aparece na foto)</span><textarea rows={2} value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} /></label>
        <label className="campo"><span className="campo-rotulo">Contexto (onde, quando, para quê)</span><textarea rows={2} value={f.contexto} onChange={(e) => setF({ ...f, contexto: e.target.value })} /></label>
        <label className="campo"><span className="campo-rotulo">Etiquetas (separe por vírgula)</span><input value={f.etiquetas} onChange={(e) => setF({ ...f, etiquetas: e.target.value })} placeholder="pensativo, palestra, fundo escuro" /></label>
        <button className="botao botao--primario botao--pequeno" disabled={!alterado} onClick={() => salvar(f)}>Salvar descrição</button>
      </section>

      <section className="secao">
        <h3>Álbuns</h3>
        <div className="mb-checks">
          {albuns.map((a) => (
            <label key={a.id}><input type="checkbox" checked={im.albuns.includes(a.id)} onChange={(e) => salvar({ albuns: e.target.checked ? [...im.albuns, a.id] : im.albuns.filter((x) => x !== a.id) }, "Álbuns atualizados.")} /> {a.nome}</label>
          ))}
        </div>
      </section>

      <section className="secao">
        <h3>Sugestões de uso</h3>
        <p className="dica">Sem análise automática de imagem: baseadas nas etiquetas e na descrição que você escreveu e no formato do arquivo.</p>
        {sugestoes.length ? <ul className="mb-obrigacoes">{sugestoes.map((s) => <li key={s}>{s}</li>)}</ul> : <p className="dica">Adicione etiquetas (ex.: “pensativo”, “sorrindo”, “palestra”) para receber sugestões.</p>}
        {im.projetos.length > 0 && <p className="dica">Usada em {im.projetos.length} carrossel(éis).</p>}
      </section>

      <section className="secao">
        <input ref={substituto} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => substituir(e.target.files?.[0])} />
        <div className="linha-botoes">
          {!origemDaFonte && <button className="botao botao--pequeno" onClick={() => substituto.current?.click()}>Substituir arquivo</button>}
          <button className="botao botao--pequeno botao--fantasma-perigo" onClick={remover}>Remover da biblioteca</button>
        </div>
      </section>
    </aside>
  );
}
