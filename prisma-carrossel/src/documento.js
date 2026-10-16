// Montagem do documento HTML dos slides. Módulo puro (sem Node): é usado
// pelo exportador (Playwright) e pela prévia ao vivo do PRISMA Studio, para
// que o que se vê no editor seja exatamente o que vai para o PNG.
import { esc, pad2 } from "./util.js";
import { templates, templatesDisponiveis } from "./templates.js";

export const FUNDOS = ["escuro", "claro", "suave", "acento"];

export function validarDados(c) {
  const erros = [];
  if (!c || typeof c !== "object") erros.push("conteúdo vazio");
  if (!Array.isArray(c?.slides) || c.slides.length === 0) erros.push("carrossel sem slides");
  if (c?.formato && (!(c.formato.largura > 0) || !(c.formato.altura > 0))) erros.push("formato inválido");
  (c?.slides || []).forEach((s, i) => {
    const n = `slide ${i + 1}`;
    if (!templates[s?.template]) erros.push(`${n}: template "${s?.template}" inexistente (${templatesDisponiveis.join(", ")})`);
    if (!FUNDOS.includes(s?.fundo)) erros.push(`${n}: fundo "${s?.fundo}" inválido (${FUNDOS.join(", ")})`);
  });
  if (erros.length) {
    const e = new Error("Dados inválidos:\n  - " + erros.join("\n  - "));
    e.lista = erros;
    throw e;
  }
}

export function contexto(carrossel, opcoes = {}) {
  const slides = carrossel.slides || [];
  return {
    perfil: carrossel.perfil || "",
    autor: carrossel.autor || "",
    total: slides.length,
    rotuloLista: carrossel.rotulo_lista ?? "Sinal",
    totalSinais: carrossel.total_sinais
      ?? slides.reduce((m, s) => Math.max(m, Number(s.numero) || 0, ...(s.blocos || []).map((b) => Number(b.numero) || 0)), 0),
    urlFoto: opcoes.urlFoto,
  };
}

const limitar = (v, a, b) => Math.min(b, Math.max(a, Number(v) || 1));

// Crédito exigido pela licença da foto, impresso na arte (opcional por slide).
function creditoFoto(slide) {
  const f = slide.foto;
  if (!f?.arquivo || !f.origem?.credito || f.creditoNaArte === false) return "";
  return `\n  <div class="credito-foto" data-box="credito" data-zona="meta"><span>${esc(f.origem.credito)}</span></div>`;
}

export function renderSlide(slide, i, ctx) {
  const id = `slide-${pad2(i + 1)}`;
  const corpo = templates[slide.template](slide, ctx);
  // Ajustes seguros por slide: escala de título/texto (limitada) e alinhamento.
  const escT = slide.escala_titulo ? limitar(slide.escala_titulo, 0.85, 1.15) : 1;
  const escX = slide.escala_texto ? limitar(slide.escala_texto, 0.9, 1.1) : 1;
  const estilo = escX !== 1 ? ` style="--tam-texto:${(42 * escX).toFixed(1)}px;--tam-complemento:${(46 * escX).toFixed(1)}px"` : "";
  const alinhar = slide.alinhamento === "centro" ? " alinhar-centro" : "";
  return `<section class="slide fundo-${slide.fundo} t-${slide.template}${alinhar}" id="${id}" data-indice="${i + 1}" data-escala-titulo="${escT}"${estilo}>
  <header class="meta" data-box="meta" data-zona="meta">
    <span class="perfil">${esc(ctx.perfil)}</span>
    <span class="pag"><b>${pad2(i + 1)}</b> / ${pad2(ctx.total)}</span>
  </header>${corpo}${creditoFoto(slide)}
</section>`;
}

// urls: { tokens, base, templates, ajuste, inspecao? } — onde o navegador acha cada arquivo.
// apenas: índice de um único slide (prévia) ou undefined (todos).
export function montarDocumento(carrossel, { urls, urlFoto, apenas } = {}) {
  validarDados(carrossel);
  const ctx = contexto(carrossel, { urlFoto });
  const { largura, altura } = carrossel.formato || { largura: 1080, altura: 1350 };
  const indices = apenas === undefined ? carrossel.slides.map((_, i) => i) : [apenas];
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${largura}">
<title>${esc(carrossel.titulo || "Carrossel")} — slides</title>
<link rel="stylesheet" href="${urls.tokens}">
<link rel="stylesheet" href="${urls.base}">
<link rel="stylesheet" href="${urls.templates}">
<style>
  :root { --largura: ${largura}px; --altura: ${altura}px; }
  @page { size: ${largura}px ${altura}px; margin: 0; }
  @media print { html, body { background: none; } }
</style>
</head>
<body>
${indices.map((i) => renderSlide(carrossel.slides[i], i, ctx)).join("\n")}
<script src="${urls.ajuste}"></script>
${urls.inspecao ? `<script src="${urls.inspecao}"></script>` : ""}
</body>
</html>`;
}
