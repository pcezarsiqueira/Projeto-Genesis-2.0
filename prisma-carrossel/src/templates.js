// Templates por função narrativa. Cada template recebe o objeto do slide
// (vindo do carrossel.json) e devolve o HTML interno do slide.
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

function foto(f, classe = "") {
  if (!f || !f.arquivo) return "";
  // Ajustes permitidos: recorte/posição e exposição/contraste moderados.
  const lim = (v, a, b) => Math.min(b, Math.max(a, Number(v ?? 1)));
  const filtro = `brightness(${lim(f.exposicao, 0.85, 1.15)}) contrast(${lim(f.contraste, 0.85, 1.15)})`;
  return `<div class="foto ${classe}" data-sobrepor><img src="${esc(f.src)}" alt="${esc(f.descricao || "")}" style="object-position:${esc(f.posicao || "center")};filter:${filtro}"></div>`;
}

const T = {};

/* 1 — CAPA ---------------------------------------------------------------- */
T.capa = (s) => {
  const titulo = s.titulo.trim();
  const num = s.numero && titulo.startsWith(s.numero + " ") ? s.numero : null;
  const temFoto = Boolean(s.foto && s.foto.arquivo);
  const resto = num ? titulo.slice(num.length + 1) : titulo;
  return `
  ${temFoto ? foto(s.foto, "capa-foto") : ""}
  <div class="conteudo capa${temFoto ? " capa--foto" : ""}">
    ${temFoto ? "" : `<div class="capa-topo">
      ${num ? `<div class="capa-num" data-box="numero">${esc(num)}</div>` : ""}
      <div class="capa-grafico" data-box="grafico">${grafico("barras")}</div>
    </div>`}
    <h1 class="titulo capa-titulo" data-box="titulo" ${fit(132, 72, temFoto ? 380 : 520)}>${temFoto ? md(titulo) : md(resto)}</h1>
    <div class="capa-rodape" data-box="chamada">
      <span class="fio capa-fio"></span>
      <span class="rotulo">${esc(s.chamada || "")}</span>
      <span class="capa-seta">${icones.seta}</span>
    </div>
  </div>`;
};

/* 2 — PERGUNTA / IDENTIFICAÇÃO --------------------------------------------- */
T.pergunta = (s) => `
  <div class="conteudo pergunta">
    <h1 class="titulo pergunta-titulo" data-box="titulo" ${fit(128, 76, 700)}>${md(s.titulo)}</h1>
    <div class="pergunta-base">
      <hr class="fio" data-box="fio">
      <div class="pergunta-linha">
        <p class="complemento pergunta-complemento" data-box="complemento">${md(s.complemento)}</p>
        <div class="pergunta-grafico" data-box="grafico">${grafico(s.grafico, s)}</div>
      </div>
    </div>
  </div>`;

/* 3, 4, 7 — SINAL ---------------------------------------------------------- */
// Três composições para que sinais seguidos não fiquem idênticos:
//   a: número grande + gráfico no topo, título, texto
//   b: título e texto no topo, gráfico grande embaixo com o número vazado
//   c: gráfico largo no topo, título, texto e faixa de CTA na base
T.sinal = (s, ctx) => {
  const v = s.variante || (s.cta ? "c" : Number(s.numero) % 2 ? "a" : "b");
  const num = esc(s.numero);
  const rot = `<span class="rotulo sinal-rotulo">Sinal ${num} de ${ctx.totalSinais}</span>`;
  if (v === "a") {
    return `
  <div class="conteudo sinal sinal--a">
    <div class="sinal-topo">
      <div class="sinal-num" data-box="numero"><span>${num}.</span></div>
      <div class="sinal-grafico" data-box="grafico">${grafico(s.grafico, s)}</div>
    </div>
    <div class="sinal-corpo">
      <div data-box="rotulo">${rot}</div>
      <h1 class="titulo" data-box="titulo" ${fit(104, 64, 330)}>${md(s.titulo)}</h1>
      <span class="sinal-marca"></span>
      <p class="texto" data-box="texto">${md(s.texto)}</p>
    </div>
  </div>`;
  }
  if (v === "b") {
    return `
  <div class="conteudo sinal sinal--b">
    <div data-box="rotulo">${rot}</div>
    <h1 class="titulo" data-box="titulo" ${fit(96, 64, 400)}>${md(s.titulo)}</h1>
    <p class="texto" data-box="texto">${md(s.texto)}</p>
    <div class="sinal-base">
      <div class="sinal-num sinal-num--vazado" data-box="numero"><span>${num}</span></div>
      <div class="sinal-grafico" data-box="grafico">${grafico(s.grafico, s)}</div>
    </div>
  </div>`;
  }
  return `
  <div class="conteudo sinal sinal--c">
    <div class="sinal-grafico" data-box="grafico">${grafico(s.grafico, s)}</div>
    <div class="sinal-cabeca" data-box="rotulo"><span class="sinal-num sinal-num--mini">${num}.</span>${rot}</div>
    <h1 class="titulo" data-box="titulo" ${fit(84, 60, 270)}>${md(s.titulo)}</h1>
    <p class="texto" data-box="texto">${md(s.texto)}</p>
    ${s.cta ? `<div class="cta" data-box="cta"><span class="cta-icone">${icones[s.cta.icone] || ""}</span><span class="cta-texto">${md(s.cta.texto)}</span></div>` : ""}
  </div>`;
};

/* 5 — DESTAQUE / SALVAMENTO ------------------------------------------------ */
T.destaque = (s) => `
  <div class="conteudo destaque">
    <div class="destaque-icone" data-box="icone">${icones.salvar}</div>
    <h1 class="titulo destaque-titulo" data-box="titulo" ${fit(112, 76, 580)}>${md(s.titulo)}</h1>
    <div class="destaque-base">
      <p class="complemento destaque-complemento" data-box="complemento">${md(s.complemento)}</p>
      ${s.progresso ? `<div data-box="progresso">${progresso(s.progresso)}</div>` : ""}
    </div>
  </div>`;

/* 6 — DOIS SINAIS ---------------------------------------------------------- */
T["sinal-duplo"] = (s, ctx) => `
  <div class="conteudo duplo">
    ${s.blocos.map((b, i) => `
    ${i > 0 ? `<hr class="fio duplo-fio" data-box="divisor-${i}">` : ""}
    <section class="duplo-bloco">
      <div class="sinal-num duplo-num" data-box="numero-${i + 1}"><span>${esc(b.numero)}.</span></div>
      <div class="duplo-corpo">
        <div data-box="rotulo-${i + 1}"><span class="rotulo">Sinal ${esc(b.numero)} de ${ctx.totalSinais}</span></div>
        <h2 class="titulo duplo-titulo" data-box="titulo-${i + 1}" data-fit-grupo="duplo" ${fit(80, 58, 180)}>${md(b.titulo)}</h2>
        <p class="texto duplo-texto" data-box="texto-${i + 1}">${md(b.texto)}</p>
        <div class="duplo-grafico" data-box="grafico-${i + 1}">${grafico(b.grafico, b)}</div>
      </div>
    </section>`).join("")}
  </div>`;

/* 8 — CHECKLIST / APLICAÇÃO ------------------------------------------------ */
T.checklist = (s) => `
  <div class="conteudo checklist">
    <h1 class="titulo checklist-titulo" data-box="titulo" ${fit(96, 66, 300)}>${md(s.titulo)}</h1>
    <div class="cartao" data-box="cartao">
      <span class="cartao-tesoura">${icones.tesoura}</span>
      <ol class="cartao-lista">
        ${s.itens.map((it, i) => `<li><span class="cartao-n">${i + 1}</span><span class="cartao-item">${md(it)}</span></li>`).join("")}
      </ol>
    </div>
  </div>`;

/* 9 — ENCERRAMENTO --------------------------------------------------------- */
T.encerramento = (s, ctx) => `
  <div class="conteudo encerramento">
    <h1 class="titulo encerramento-titulo" data-box="titulo" ${fit(104, 70, 560)}>${md(s.titulo)}</h1>
    <div class="cta cta--grande" data-box="cta"><span class="cta-icone">${icones[s.cta.icone] || ""}</span><span class="cta-texto">${md(s.cta.texto)}</span></div>
  </div>
  <div class="faixa fundo-escuro">
    <div class="faixa-conteudo" data-box="assinatura">
      <span class="rotulo">${esc(ctx.autor)}</span>
      <p class="faixa-texto">${md(s.assinatura).replace(esc(ctx.perfil), `<strong>${esc(ctx.perfil)}</strong>`)}</p>
    </div>
  </div>`;

export const templates = T;
export const templatesDisponiveis = Object.keys(T);
