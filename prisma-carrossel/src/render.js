// Componente de renderização: dados do carrossel → documento HTML com um
// <section class="slide"> por slide, pronto para captura pelo Playwright.
import fs from "node:fs";
import path from "node:path";
import { esc, pad2 } from "./util.js";
import { templates, templatesDisponiveis } from "./templates.js";

const FUNDOS = new Set(["escuro", "claro", "suave", "acento"]);

export function validarDados(c) {
  const erros = [];
  if (!Array.isArray(c.slides) || c.slides.length === 0) erros.push("carrossel sem slides");
  (c.slides || []).forEach((s, i) => {
    const n = `slide ${i + 1}`;
    if (!templates[s.template]) erros.push(`${n}: template "${s.template}" inexistente (${templatesDisponiveis.join(", ")})`);
    if (!FUNDOS.has(s.fundo)) erros.push(`${n}: fundo "${s.fundo}" inválido (${[...FUNDOS].join(", ")})`);
  });
  if (erros.length) throw new Error("Dados inválidos:\n  - " + erros.join("\n  - "));
}

export function renderSlide(slide, i, ctx) {
  const id = `slide-${pad2(i + 1)}`;
  const corpo = templates[slide.template](slide, ctx);
  return `<section class="slide fundo-${slide.fundo} t-${slide.template}" id="${id}" data-indice="${i + 1}">
  <header class="meta" data-box="meta" data-zona="meta">
    <span class="perfil">${esc(ctx.perfil)}</span>
    <span class="pag"><b>${pad2(i + 1)}</b> / ${pad2(ctx.total)}</span>
  </header>${corpo}
</section>`;
}

export function renderizarDocumento(carrossel, { raiz, destinoHtml }) {
  validarDados(carrossel);
  const dir = path.dirname(destinoHtml);
  const rel = (p) => path.relative(dir, path.join(raiz, p)).split(path.sep).join("/");

  // Fotos do usuário: caminho relativo a assets/ e verificação de existência.
  for (const s of carrossel.slides) {
    if (s.foto?.arquivo) {
      const abs = path.join(raiz, "assets", s.foto.arquivo);
      if (!fs.existsSync(abs)) throw new Error(`Foto não encontrada: assets/${s.foto.arquivo}`);
      s.foto.src = rel(path.join("assets", s.foto.arquivo));
    }
  }

  const ctx = {
    perfil: carrossel.perfil,
    autor: carrossel.autor,
    total: carrossel.slides.length,
    totalSinais: carrossel.total_sinais
      ?? carrossel.slides.reduce((m, s) => Math.max(m, Number(s.numero) || 0, ...(s.blocos || []).map((b) => Number(b.numero) || 0)), 0),
  };

  const { largura, altura } = carrossel.formato;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${largura}">
<title>${esc(carrossel.titulo)} — slides</title>
<link rel="stylesheet" href="${rel("design/tokens.css")}">
<link rel="stylesheet" href="${rel("design/base.css")}">
<link rel="stylesheet" href="${rel("design/templates.css")}">
<style>
  :root { --largura: ${largura}px; --altura: ${altura}px; }
  @page { size: ${largura}px ${altura}px; margin: 0; }
  @media print { html, body { background: none; } }
</style>
</head>
<body>
${carrossel.slides.map((s, i) => renderSlide(s, i, ctx)).join("\n")}
<script src="${rel("src/navegador/ajuste.js")}"></script>
</body>
</html>`;
}
