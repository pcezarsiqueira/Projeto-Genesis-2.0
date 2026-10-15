// Validação dos arquivos exportados (fora do navegador):
// dimensões dos PNGs, quantidade/ordem/tamanho das páginas do PDF,
// existência da visão geral e da prévia.
import fs from "node:fs";
import path from "node:path";
import { pad2, normalizar, textosEsperados } from "./util.js";

export function dimensoesPng(arquivo) {
  const buf = fs.readFileSync(arquivo);
  const assinatura = buf.subarray(0, 8).toString("hex");
  if (assinatura !== "89504e470d0a1a0a") throw new Error(`${path.basename(arquivo)} não é um PNG válido`);
  return { largura: buf.readUInt32BE(16), altura: buf.readUInt32BE(20) };
}

const compacto = (s) => normalizar(s).replace(/\s+/g, "");

export async function validarArquivos(carrossel, dirSaida) {
  const { largura, altura } = carrossel.formato;
  const n = carrossel.slides.length;
  const erros = [];
  const itens = [];

  // PNGs
  for (let i = 1; i <= n; i++) {
    const nome = `slide-${pad2(i)}.png`;
    const arq = path.join(dirSaida, nome);
    if (!fs.existsSync(arq)) { erros.push(`${nome} não foi gerado`); continue; }
    const d = dimensoesPng(arq);
    const ok = d.largura === largura && d.altura === altura;
    if (!ok) erros.push(`${nome} tem ${d.largura}×${d.altura}, esperado ${largura}×${altura}`);
    itens.push({ arquivo: nome, ...d, kb: Math.round(fs.statSync(arq).size / 1024), ok });
  }
  const extras = fs.readdirSync(dirSaida).filter((f) => /^slide-\d+\.png$/.test(f) && Number(f.match(/\d+/)[0]) > n);
  if (extras.length) erros.push(`PNGs sobrando de uma versão anterior: ${extras.join(", ")}`);

  // PDF
  const pdfArq = path.join(dirSaida, "carrossel-completo.pdf");
  const pdf = { arquivo: "carrossel-completo.pdf", paginas: 0, ordemOk: false, tamanhoOk: false };
  if (!fs.existsSync(pdfArq)) {
    erros.push("carrossel-completo.pdf não foi gerado");
  } else {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(pdfArq)), disableFontFace: true, verbosity: 0 }).promise;
    pdf.paginas = doc.numPages;
    if (doc.numPages !== n) erros.push(`PDF tem ${doc.numPages} páginas, esperado ${n}`);
    const ptL = (largura * 72) / 96, ptA = (altura * 72) / 96;
    let ordemOk = true, tamanhoOk = true;
    pdf.detalhe = [];
    for (let p = 1; p <= Math.min(doc.numPages, n); p++) {
      const pg = await doc.getPage(p);
      const vp = pg.getViewport({ scale: 1 });
      const tc = await pg.getTextContent();
      const texto = compacto(tc.items.map((it) => it.str).join(" "));
      const chave = textosEsperados(carrossel.slides[p - 1])[0] || "";
      const contem = texto.includes(compacto(chave));
      const tam = Math.abs(vp.width - ptL) < 1 && Math.abs(vp.height - ptA) < 1;
      if (!contem) { ordemOk = false; erros.push(`PDF página ${p} não contém o título do slide ${p}`); }
      if (!tam) { tamanhoOk = false; erros.push(`PDF página ${p} mede ${vp.width}×${vp.height} pt`); }
      pdf.detalhe.push({ pagina: p, tituloEncontrado: contem, larguraPt: vp.width, alturaPt: vp.height });
    }
    pdf.ordemOk = ordemOk && doc.numPages === n;
    pdf.tamanhoOk = tamanhoOk;
    pdf.kb = Math.round(fs.statSync(pdfArq).size / 1024);
  }

  // Visão geral e prévia
  const visao = path.join(dirSaida, "visao-geral.png");
  const visaoInfo = fs.existsSync(visao) ? dimensoesPng(visao) : null;
  if (!visaoInfo) erros.push("visao-geral.png não foi gerada");
  const previa = path.join(dirSaida, "previa.html");
  let previaOk = false;
  if (!fs.existsSync(previa)) erros.push("previa.html não foi gerada");
  else {
    const html = fs.readFileSync(previa, "utf8");
    previaOk = Array.from({ length: n }, (_, i) => `slide-${pad2(i + 1)}.png`).every((f) => html.includes(f));
    if (!previaOk) erros.push("previa.html não referencia todos os slides");
  }

  return { erros, pngs: itens, pdf, visaoGeral: visaoInfo, previaOk };
}
