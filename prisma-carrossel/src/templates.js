// Templates por função narrativa. Cada template recebe o objeto do slide
// (vindo do carrossel.json) e devolve o HTML interno do slide.
// Este módulo é puro (sem Node): roda no exportador e na prévia do Studio.
//
// Convenções usadas pela validação:
//   data-box="nome"   caixa que deve ficar dentro da área de segurança e não
//                     pode se sobrepor a outras caixas do mesmo slide
//   data-zona="meta"  caixa da faixa de assinatura/numeração (margem menor)
//   data-fit          texto com ajuste automático de corpo:
//                     data-fit-max / data-fit-min (px) e data-fit-h (altura máx.)
import { esc, md } from "./util.js";
import { grafico, icones, progresso } from "./graficos.js";

const fit = (max, min, h) => `data-fit data-fit-max="${max}" data-fit-min="${min}" data-fit-h="${h}"`;
const txt = (v) => (typeof v === "string" ? v : "");

// Fotografia do usuário. Ajustes permitidos: recorte (posição + zoom) e
// exposição/contraste moderados. Nenhum filtro altera o conteúdo da foto.
export function fotoHtml(f, ctx, classe = "") {
  if (!f || !f.arquivo) return "";
  const lim = (v, a, b, d = 1) => Math.min(b, Math.max(a, Number.isFinite(Number(v)) && v !== null && v !== "" ? Number(v) : d));
  const filtro = `brightness(${lim(f.exposicao, 0.85, 1.15)}) contrast(${lim(f.contraste, 0.85, 1.15)})`;
  const x = lim(f.x, 0, 100, 50), y = lim(f.y, 0, 100, 50), z = lim(f.zoom, 1, 2.5, 1);
  const pos = f.posicao && f.x === undefined ? f.posicao : `${x}% ${y}%`;
  const src = ctx.urlFoto ? ctx.urlFoto(f.arquivo) : f.arquivo;
  return `<div class="foto ${classe}" data-sobrepor><img src="${esc(src)}" alt="${esc(f.descricao || "")}" style="object-position:${esc(pos)};transform-origin:${esc(pos)};transform:scale(${z});filter:${filtro}"></div>`;
}
const modoFoto = (s, padrao) => (s.foto && s.foto.arquivo ? s.foto.modo || padrao : null);

const T = {};

/* CAPA --------------------------------------------------------------------- */
// Sem foto: numeral gigante + barras. Foto "topo": foto enquadrada acima do
// título. Foto "fundo": foto sangrada com o texto sobre um painel sólido.
T.capa = (s, ctx) => {
  const titulo = txt(s.titulo).trim();
  const num = s.numero && titulo.startsWith(s.numero + " ") ? s.numero : null;
  const modo = modoFoto(s, "topo");
  const resto = num ? titulo.slice(num.length + 1) : titulo;
  const rodape = `<div class="capa-rodape" data-box="chamada">
      <span class="fio capa-fio"></span>
      <span class="rotulo">${esc(txt(s.chamada))}</span>
      <span class="capa-seta">${icones.seta}</span>
    </div>`;
  if (modo === "fundo") {
    return `
  ${fotoHtml(s.foto, ctx, "capa-foto-fundo")}
  <div class="capa-painel fundo-escuro" data-sobrepor></div>
  <div class="conteudo capa capa--fundo">
    <h1 class="titulo capa-titulo" data-box="titulo" ${fit(120, 64, 330)}>${md(titulo)}</h1>
    ${rodape}
  </div>`;
  }
  return `
  ${modo ? fotoHtml(s.foto, ctx, "capa-foto") : ""}
  <div class="conteudo capa${modo ? " capa--foto" : ""}">
    ${modo ? "" : `<div class="capa-topo">
      ${num ? `<div class="capa-num" data-box="numero">${esc(num)}</div>` : ""}
      <div class="capa-grafico" data-box="grafico">${grafico("barras")}</div>
    </div>`}
    <h1 class="titulo capa-titulo" data-box="titulo" ${fit(132, 72, modo ? 380 : 520)}>${modo ? md(titulo) : md(resto)}</h1>
    ${rodape}
  </div>`;
};

/* PERGUNTA / PROVOCAÇÃO ---------------------------------------------------- */
// Foto "detalhe": ocupa o espaço do gráfico, sem mexer no título.
const detalhe = (s, ctx, classe) => (modoFoto(s, "detalhe") === "detalhe" ? fotoHtml(s.foto, ctx, `foto-detalhe ${classe}`) : "");

T.pergunta = (s, ctx) => `
  <div class="conteudo pergunta">
    <h1 class="titulo pergunta-titulo" data-box="titulo" ${fit(128, 76, 700)}>${md(txt(s.titulo))}</h1>
    <div class="pergunta-base">
      <hr class="fio" data-box="fio">
      <div class="pergunta-linha${s.grafico || detalhe(s, ctx, "") ? "" : " pergunta-linha--so-texto"}">
        <p class="complemento pergunta-complemento" data-box="complemento">${md(txt(s.complemento))}</p>
        ${detalhe(s, ctx, "") ? `<div class="pergunta-grafico pergunta-foto" data-box="grafico">${detalhe(s, ctx, "foto-detalhe--pergunta")}</div>`
          : s.grafico ? `<div class="pergunta-grafico" data-box="grafico">${grafico(s.grafico, s)}</div>` : ""}
      </div>
    </div>
  </div>`;

/* LISTA NUMERADA (sinal) --------------------------------------------------- */
// Três composições para que itens seguidos não fiquem idênticos:
//   a: número grande + gráfico no topo, título, texto
//   b: título e texto no topo, gráfico grande embaixo com o número vazado
//   c: gráfico largo no topo, título, texto e faixa de CTA na base
T.sinal = (s, ctx) => {
  const v = s.variante || (s.cta ? "c" : Number(s.numero) % 2 ? "a" : "b");
  const num = esc(s.numero ?? "");
  const rot = `<span class="rotulo sinal-rotulo">${esc(ctx.rotuloLista)} ${num} de ${ctx.totalSinais}</span>`;
  const foto = detalhe(s, ctx, `foto-detalhe--sinal-${v}`);
  const graf = foto || (s.grafico ? grafico(s.grafico, s) : "");
  if (v === "a") {
    return `
  <div class="conteudo sinal sinal--a">
    <div class="sinal-topo">
      <div class="sinal-num" data-box="numero"><span>${num}.</span></div>
      ${graf ? `<div class="sinal-grafico" data-box="grafico">${graf}</div>` : ""}
    </div>
    <div class="sinal-corpo">
      <div data-box="rotulo">${rot}</div>
      <h1 class="titulo" data-box="titulo" ${fit(104, 64, 330)}>${md(txt(s.titulo))}</h1>
      <span class="sinal-marca"></span>
      <p class="texto" data-box="texto">${md(txt(s.texto))}</p>
    </div>
  </div>`;
  }
  if (v === "b") {
    return `
  <div class="conteudo sinal sinal--b">
    <div data-box="rotulo">${rot}</div>
    <h1 class="titulo" data-box="titulo" ${fit(96, 64, 400)}>${md(txt(s.titulo))}</h1>
    <p class="texto" data-box="texto">${md(txt(s.texto))}</p>
    <div class="sinal-base">
      <div class="sinal-num sinal-num--vazado" data-box="numero"><span>${num}</span></div>
      ${graf ? `<div class="sinal-grafico" data-box="grafico">${graf}</div>` : ""}
    </div>
  </div>`;
  }
  return `
  <div class="conteudo sinal sinal--c">
    ${graf ? `<div class="sinal-grafico" data-box="grafico">${graf}</div>` : ""}
    <div class="sinal-cabeca" data-box="rotulo"><span class="sinal-num sinal-num--mini">${num}.</span>${rot}</div>
    <h1 class="titulo" data-box="titulo" ${fit(84, 60, 270)}>${md(txt(s.titulo))}</h1>
    <p class="texto" data-box="texto">${md(txt(s.texto))}</p>
    ${s.cta && txt(s.cta.texto) ? `<div class="cta" data-box="cta"><span class="cta-icone">${icones[s.cta.icone] || ""}</span><span class="cta-texto">${md(s.cta.texto)}</span></div>` : ""}
  </div>`;
};

/* DESTAQUE: suspense, CTA de salvar ou de compartilhar --------------------- */
T.destaque = (s) => `
  <div class="conteudo destaque">
    <div class="destaque-icone" data-box="icone">${icones[s.icone] || icones.salvar}</div>
    <h1 class="titulo destaque-titulo" data-box="titulo" ${fit(112, 76, 580)}>${md(txt(s.titulo))}</h1>
    <div class="destaque-base">
      <p class="complemento destaque-complemento" data-box="complemento">${md(txt(s.complemento))}</p>
      ${s.progresso && Number(s.progresso.total) > 0 ? `<div data-box="progresso">${progresso(s.progresso)}</div>` : ""}
    </div>
  </div>`;

/* DOIS ITENS DA LISTA NO MESMO SLIDE --------------------------------------- */
T["sinal-duplo"] = (s, ctx) => `
  <div class="conteudo duplo">
    ${(s.blocos || []).slice(0, 2).map((b, i) => `
    ${i > 0 ? `<hr class="fio duplo-fio" data-box="divisor-${i}">` : ""}
    <section class="duplo-bloco">
      <div class="sinal-num duplo-num" data-box="numero-${i + 1}"><span>${esc(b.numero ?? "")}.</span></div>
      <div class="duplo-corpo">
        <div data-box="rotulo-${i + 1}"><span class="rotulo">${esc(ctx.rotuloLista)} ${esc(b.numero ?? "")} de ${ctx.totalSinais}</span></div>
        <h2 class="titulo duplo-titulo" data-box="titulo-${i + 1}" data-fit-grupo="duplo" ${fit(80, 58, 180)}>${md(txt(b.titulo))}</h2>
        <p class="texto duplo-texto" data-box="texto-${i + 1}">${md(txt(b.texto))}</p>
        ${b.grafico ? `<div class="duplo-grafico" data-box="grafico-${i + 1}">${grafico(b.grafico, b)}</div>` : ""}
      </div>
    </section>`).join("")}
  </div>`;

/* CHECKLIST ---------------------------------------------------------------- */
T.checklist = (s) => `
  <div class="conteudo checklist">
    <h1 class="titulo checklist-titulo" data-box="titulo" ${fit(96, 66, 300)}>${md(txt(s.titulo))}</h1>
    <div class="cartao" data-box="cartao">
      <span class="cartao-tesoura">${icones.tesoura}</span>
      <ol class="cartao-lista">
        ${(s.itens || []).filter((it) => txt(it).trim()).map((it, i) => `<li><span class="cartao-n">${i + 1}</span><span class="cartao-item">${md(it)}</span></li>`).join("")}
      </ol>
    </div>
  </div>`;

/* ENCERRAMENTO ------------------------------------------------------------- */
// Foto opcional: retrato do autor na faixa de assinatura.
T.encerramento = (s, ctx) => {
  const comFoto = Boolean(modoFoto(s, "retrato"));
  const assinatura = md(txt(s.assinatura)).replace(esc(ctx.perfil), `<strong>${esc(ctx.perfil)}</strong>`);
  return `
  <div class="conteudo encerramento">
    <h1 class="titulo encerramento-titulo" data-box="titulo" ${fit(104, 70, 560)}>${md(txt(s.titulo))}</h1>
    ${s.cta && txt(s.cta.texto) ? `<div class="cta cta--grande" data-box="cta"><span class="cta-icone">${icones[s.cta.icone] || icones.comentar}</span><span class="cta-texto">${md(s.cta.texto)}</span></div>` : ""}
  </div>
  <div class="faixa fundo-escuro${comFoto ? " faixa--foto" : ""}">
    ${comFoto ? fotoHtml(s.foto, ctx, "faixa-retrato") : ""}
    <div class="faixa-conteudo" data-box="assinatura">
      <span class="rotulo">${esc(ctx.autor)}</span>
      <p class="faixa-texto">${assinatura}</p>
    </div>
  </div>`;
};

/* EXPLICAÇÃO --------------------------------------------------------------- */
// Rótulo + título + texto corrido. Foto "lateral" ocupa a metade direita.
T.explicacao = (s, ctx) => {
  const lateral = modoFoto(s, "lateral") === "lateral";
  const paragrafos = txt(s.texto).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return `
  ${lateral ? fotoHtml(s.foto, ctx, "explicacao-foto") : ""}
  <div class="conteudo explicacao${lateral ? " explicacao--foto" : ""}">
    ${txt(s.rotulo) ? `<div data-box="rotulo"><span class="rotulo">${esc(s.rotulo)}</span></div>` : ""}
    <h1 class="titulo explicacao-titulo" data-box="titulo" ${lateral ? fit(80, 56, 420) : fit(100, 64, 420)}>${md(txt(s.titulo))}</h1>
    <div class="explicacao-corpo" data-box="texto">
      ${paragrafos.map((p) => `<p class="texto">${md(p)}</p>`).join("")}
    </div>
  </div>`;
};

/* COMPARAÇÃO --------------------------------------------------------------- */
// Dois cartões lado a lado (ex.: "Parece" × "Na verdade").
T.comparacao = (s) => {
  const b = [...(s.blocos || []), {}, {}].slice(0, 2);
  return `
  <div class="conteudo comparacao">
    <h1 class="titulo comparacao-titulo" data-box="titulo" ${fit(96, 62, 380)}>${md(txt(s.titulo))}</h1>
    <div class="comparacao-grade">
      ${b.map((x, i) => `
      <div class="comparacao-cartao comparacao-cartao--${i ? "b" : "a"}" data-box="lado-${i + 1}">
        <span class="rotulo">${esc(txt(x.rotulo))}</span>
        <p class="comparacao-texto">${md(txt(x.texto))}</p>
      </div>`).join("")}
    </div>
  </div>`;
};

/* EXEMPLO ------------------------------------------------------------------ */
// Uma cena concreta em destaque, com legenda opcional de contexto.
T.exemplo = (s) => `
  <div class="conteudo exemplo">
    <div data-box="rotulo"><span class="rotulo">${esc(txt(s.rotulo) || "Exemplo")}</span></div>
    <h1 class="titulo exemplo-titulo" data-box="titulo" ${fit(104, 64, 360)}>${md(txt(s.titulo))}</h1>
    <figure class="exemplo-cena" data-box="cena">
      <svg class="exemplo-aspas" viewBox="0 0 90 64" width="90" height="64" aria-hidden="true"><path d="M0 64V38C0 16 10 4 32 0l4 9C24 13 18 20 18 30h16v34Zm52 0V38C52 16 62 4 84 0l4 9C76 13 70 20 70 30h16v34Z" fill="var(--cor-dourado)"/></svg>
      <blockquote class="complemento exemplo-texto">${md(txt(s.texto))}</blockquote>
      ${txt(s.legenda) ? `<figcaption class="rotulo exemplo-legenda">${esc(s.legenda)}</figcaption>` : ""}
    </figure>
  </div>`;

export const templates = T;
export const templatesDisponiveis = Object.keys(T);
