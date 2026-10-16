// Exportação completa de um carrossel:
//   node src/build.js [id-ou-pasta-do-carrossel]
// Gera em saida/<id>/: slide-01..NN.png, carrossel-completo.pdf,
// visao-geral.png, previa.html, relatorio-validacao.{json,md} e fonte/.
// A função exportarCarrossel() é a mesma usada pelo servidor do Studio.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { renderizarDocumento } from "./render.js";
import { htmlVisaoGeral, htmlPrevia } from "./saidas.js";
import { validarArquivos } from "./validacao.js";
import { pad2, textosEsperados } from "./util.js";
import { OPCOES_INSPECAO } from "./opcoes-inspecao.js";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function localizarCarrossel(arg) {
  const base = path.join(RAIZ, "carrosseis");
  let dir;
  if (arg) {
    const candidatos = [path.resolve(arg), path.join(base, arg)];
    dir = candidatos.find((c) => fs.existsSync(path.join(c, "carrossel.json")))
      ?? (arg.endsWith(".json") && fs.existsSync(path.resolve(arg)) ? path.dirname(path.resolve(arg)) : null);
    if (!dir) throw new Error(`Carrossel não encontrado: ${arg}`);
  } else {
    const pastas = fs.readdirSync(base).filter((d) => fs.existsSync(path.join(base, d, "carrossel.json"))).sort();
    if (!pastas.length) throw new Error("Nenhum carrossel em carrosseis/");
    dir = path.join(base, pastas[pastas.length - 1]);
  }
  const carrossel = JSON.parse(fs.readFileSync(path.join(dir, "carrossel.json"), "utf8"));
  carrossel.id ||= path.basename(dir);
  // Projetos do Studio guardam as fotos em <projeto>/fotos; os antigos, em assets/.
  const fotos = path.join(dir, "fotos");
  Object.defineProperty(carrossel, "__dirFotos", { value: fs.existsSync(fotos) ? fotos : undefined, enumerable: false });
  return carrossel;
}

export { OPCOES_INSPECAO };

export async function abrirSlides(browser, carrossel, htmlPath) {
  const { largura, altura } = carrossel.formato;
  const page = await browser.newPage({ viewport: { width: largura, height: altura }, deviceScaleFactor: 1 });
  const falhas = [];
  page.on("requestfailed", (r) => falhas.push(`${r.url()} (${r.failure()?.errorText})`));
  page.on("pageerror", (e) => falhas.push(`erro JS: ${e.message}`));
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
  await page.evaluate(() => window.__prismaPronto);
  await page.addScriptTag({ path: path.join(RAIZ, "src/navegador/inspecao.js") });
  const inspecao = await page.evaluate(
    (o) => window.__prismaInspecionar(o),
    { ...OPCOES_INSPECAO, largura, altura, esperados: carrossel.slides.map(textosEsperados) },
  );
  return { page, inspecao, falhas };
}

export function resumoMarkdown(carrossel, dom, arquivos, falhas) {
  const L = [];
  const totalErros = dom.slides.reduce((n, s) => n + s.erros.length, 0) + arquivos.erros.length + falhas.length + (dom.fontesOk ? 0 : 1);
  L.push(`# Relatório de validação — ${carrossel.titulo}`, "");
  L.push(`Gerado em ${new Date().toISOString()} · resultado: **${totalErros === 0 ? "APROVADO" : `${totalErros} erro(s)`}**`, "");
  L.push(`Fontes carregadas antes da captura: ${dom.fontesOk ? "sim" : "NÃO"} (${[...new Set(dom.fontesCarregadas)].join(", ")})`, "");
  if (falhas.length) L.push("Falhas de carregamento:", ...falhas.map((f) => `- ${f}`), "");
  L.push("| Slide | Template | Fundo | Título (px → celular) | Menor corpo (px → celular) | Menor contraste | Erros | Avisos |");
  L.push("|---|---|---|---|---|---|---|---|");
  for (const s of dom.slides) {
    L.push(`| ${pad2(s.slide)} | ${s.template} | ${s.fundo} | ${s.corpoTituloPx ?? "—"} → ${s.corpoTituloNoCelularPx ?? "—"} | ${s.menorCorpoPx} → ${s.menorCorpoNoCelularPx} | ${s.menorContraste}:1 | ${s.erros.length} | ${s.avisos.length} |`);
  }
  L.push("");
  for (const s of dom.slides) {
    if (s.erros.length || s.avisos.length) {
      L.push(`**Slide ${pad2(s.slide)}**`);
      s.erros.forEach((e) => L.push(`- ERRO: ${e}`));
      s.avisos.forEach((a) => L.push(`- aviso: ${a}`));
      L.push("");
    }
  }
  L.push("## Arquivos", "");
  arquivos.pngs.forEach((p) => L.push(`- ${p.arquivo}: ${p.largura}×${p.altura} px, ${p.kb} KB ${p.ok ? "✔" : "✘"}`));
  L.push(`- carrossel-completo.pdf: ${arquivos.pdf.paginas} páginas, ordem ${arquivos.pdf.ordemOk ? "✔" : "✘"}, tamanho de página ${arquivos.pdf.tamanhoOk ? "✔" : "✘"}`);
  L.push(`- visao-geral.png: ${arquivos.visaoGeral ? `${arquivos.visaoGeral.largura}×${arquivos.visaoGeral.altura} px ✔` : "✘"}`);
  L.push(`- previa.html: ${arquivos.previaOk ? "✔" : "✘"}`);
  if (arquivos.erros.length) L.push("", ...arquivos.erros.map((e) => `- ERRO: ${e}`));
  L.push("");
  return { md: L.join("\n"), totalErros };
}

// Exporta um carrossel completo para dirSaida. Reutilizável pelo servidor do
// Studio. Se "browser" não for passado, abre e fecha um Chromium próprio.
export async function exportarCarrossel({ carrossel, dirSaida, dirFotos, browser: navegadorExterno, log = () => {} }) {
  const t0 = Date.now();
  const dirFonte = path.join(dirSaida, "fonte");
  fs.mkdirSync(dirFonte, { recursive: true });
  for (const f of fs.readdirSync(dirSaida)) if (/^slide-\d+\.png$/.test(f)) fs.rmSync(path.join(dirSaida, f));

  const htmlPath = path.join(dirFonte, "slides.html");
  fs.writeFileSync(htmlPath, renderizarDocumento(carrossel, { raiz: RAIZ, destinoHtml: htmlPath, dirFotos }));

  const browser = navegadorExterno || (await chromium.launch());
  const paginas = [];
  try {
    const { page, inspecao, falhas } = await abrirSlides(browser, carrossel, htmlPath);
    paginas.push(page);

    // 1. PNGs individuais
    for (let i = 1; i <= carrossel.slides.length; i++) {
      await page.locator(`#slide-${pad2(i)}`).screenshot({ path: path.join(dirSaida, `slide-${pad2(i)}.png`), animations: "disabled" });
    }
    log("PNGs");

    // 2. PDF multipágina (vetorial, texto selecionável)
    const { largura, altura } = carrossel.formato;
    await page.pdf({
      path: path.join(dirSaida, "carrossel-completo.pdf"),
      width: `${largura}px`, height: `${altura}px`,
      printBackground: true, preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    log("PDF");

    // 3. Visão geral (folha de contato)
    const visaoHtml = path.join(dirFonte, "visao-geral.html");
    const relV = (f) => path.relative(dirFonte, path.join(dirSaida, f)).split(path.sep).join("/");
    const tokens = path.relative(dirFonte, path.join(RAIZ, "design/tokens.css")).split(path.sep).join("/");
    fs.writeFileSync(visaoHtml, htmlVisaoGeral(carrossel, relV, tokens));
    const pv = await browser.newPage({ viewport: { width: 1196, height: 800 }, deviceScaleFactor: 1 });
    paginas.push(pv);
    await pv.goto(pathToFileURL(visaoHtml).href, { waitUntil: "load" });
    await pv.evaluate(() => document.fonts.ready);
    await pv.locator(".folha").screenshot({ path: path.join(dirSaida, "visao-geral.png") });
    log("visão geral");

    // 4. Prévia navegável
    fs.writeFileSync(path.join(dirSaida, "previa.html"), htmlPrevia(carrossel));
    log("prévia");

    // 5. Validação
    const arquivos = await validarArquivos(carrossel, dirSaida);
    const { md, totalErros } = resumoMarkdown(carrossel, inspecao, arquivos, falhas);
    fs.writeFileSync(path.join(dirSaida, "relatorio-validacao.md"), md);
    fs.writeFileSync(path.join(dirSaida, "relatorio-validacao.json"), JSON.stringify({ dom: inspecao, arquivos, falhas }, null, 2));
    return { md, totalErros, inspecao, arquivos, falhas, segundos: (Date.now() - t0) / 1000 };
  } finally {
    for (const p of paginas) await p.close().catch(() => {});
    if (!navegadorExterno) await browser.close();
  }
}

async function main() {
  const carrossel = localizarCarrossel(process.argv[2]);
  const dirSaida = path.join(RAIZ, "saida", carrossel.id);
  console.log(`▸ ${carrossel.titulo} (${carrossel.slides.length} slides) → ${path.relative(process.cwd(), dirSaida)}`);
  const r = await exportarCarrossel({ carrossel, dirSaida, dirFotos: carrossel.__dirFotos, log: (m) => console.log(`  ✔ ${m}`) });
  console.log("\n" + r.md);
  console.log(`Concluído em ${r.segundos.toFixed(1)} s.`);
  process.exitCode = r.totalErros ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((e) => { console.error("✘", e.message); process.exit(1); });
}
