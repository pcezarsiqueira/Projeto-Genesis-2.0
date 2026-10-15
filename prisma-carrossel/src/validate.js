// Revalida um carrossel já exportado, sem renderizar de novo:
//   node src/validate.js [id-ou-pasta-do-carrossel]
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { RAIZ, localizarCarrossel, abrirSlides, resumoMarkdown } from "./build.js";
import { validarArquivos } from "./validacao.js";

const carrossel = localizarCarrossel(process.argv[2]);
const dirSaida = path.join(RAIZ, "saida", carrossel.id);
const html = path.join(dirSaida, "fonte", "slides.html");
if (!fs.existsSync(html)) {
  console.error(`✘ ${path.relative(process.cwd(), html)} não existe. Rode "npm run build" primeiro.`);
  process.exit(1);
}
const browser = await chromium.launch();
try {
  const { inspecao, falhas } = await abrirSlides(browser, carrossel, html);
  const arquivos = await validarArquivos(carrossel, dirSaida);
  const { md, totalErros } = resumoMarkdown(carrossel, inspecao, arquivos, falhas);
  console.log(md);
  process.exitCode = totalErros ? 1 : 0;
} finally {
  await browser.close();
}
