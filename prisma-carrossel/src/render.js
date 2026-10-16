// Renderização para arquivo: dados do carrossel → slides.html, com caminhos
// relativos para o sistema de design e para as fotografias.
import fs from "node:fs";
import path from "node:path";
import { montarDocumento, validarDados, renderSlide } from "./documento.js";

export { validarDados, renderSlide };

// dirFotos: pasta onde estão os arquivos de foto (padrão: <raiz>/assets).
export function renderizarDocumento(carrossel, { raiz, destinoHtml, dirFotos }) {
  validarDados(carrossel);
  const dir = path.dirname(destinoHtml);
  const fotos = dirFotos || path.join(raiz, "assets");
  const rel = (abs) => path.relative(dir, abs).split(path.sep).join("/");

  for (const s of carrossel.slides) {
    if (s.foto?.arquivo) {
      const abs = path.join(fotos, path.basename(s.foto.arquivo));
      if (!fs.existsSync(abs)) throw new Error(`Foto não encontrada: ${s.foto.arquivo}`);
    }
  }
  return montarDocumento(carrossel, {
    urls: {
      tokens: rel(path.join(raiz, "design/tokens.css")),
      base: rel(path.join(raiz, "design/base.css")),
      templates: rel(path.join(raiz, "design/templates.css")),
      ajuste: rel(path.join(raiz, "src/navegador/ajuste.js")),
    },
    urlFoto: (arquivo) => rel(path.join(fotos, path.basename(arquivo))).split("/").map(encodeURIComponent).join("/"),
  });
}
