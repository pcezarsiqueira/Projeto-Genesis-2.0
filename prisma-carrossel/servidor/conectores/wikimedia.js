// Wikimedia Commons — API pública do MediaWiki (sem chave).
// Documentação: https://www.mediawiki.org/wiki/API:Imageinfo
import { obrigacoesDaLicenca, semHtml } from "./licencas.js";

const BASE = () => process.env.PRISMA_URL_COMMONS || "https://commons.wikimedia.org";
const CAMPOS = "LicenseShortName|LicenseUrl|Artist|Credit|AttributionRequired|UsageTerms|ObjectName|Restrictions";

export const wikimedia = {
  id: "wikimedia",
  nome: "Wikimedia Commons",
  precisaChave: false,
  descricao: "Acervo aberto da Wikimedia: fotos e ilustrações com licença informada arquivo por arquivo.",
  configurado: () => true,
  urlPesquisaManual: (termo) => `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(termo)}&title=Special:MediaSearch&type=image`,

  async buscar(termo, { http }) {
    const u = new URL("/w/api.php", BASE());
    Object.entries({
      action: "query", format: "json", formatversion: "2", origin: "*",
      generator: "search", gsrsearch: `${termo} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "24",
      prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "360", iiextmetadatafilter: CAMPOS,
    }).forEach(([k, v]) => u.searchParams.set(k, v));
    const dados = await http.json(u);
    const paginas = dados?.query?.pages || [];
    return paginas
      .map((p) => {
        const ii = p.imageinfo?.[0];
        if (!ii || !/^image\/(jpeg|png|webp)$/.test(ii.mime || "")) return null;
        const m = ii.extmetadata || {};
        const v = (k) => semHtml(m[k]?.value);
        const licenca = v("LicenseShortName");
        const atribuicaoExigida = String(m.AttributionRequired?.value).toLowerCase() === "true";
        const restricoes = v("Restrictions");
        return {
          fonte: "Wikimedia Commons",
          titulo: v("ObjectName") || String(p.title || "").replace(/^File:/, "").replace(/\.[a-z]+$/i, ""),
          miniatura: ii.thumburl || ii.url,
          urlOriginal: ii.descriptionurl,
          autor: v("Artist") || v("Credit") || null,
          licenca: licenca || null,
          licencaUrl: v("LicenseUrl") || null,
          obrigacoes: [...obrigacoesDaLicenca(licenca, { atribuicaoExigida }), ...(restricoes ? [`Restrições informadas pela fonte: ${restricoes}.`] : [])],
          largura: ii.width || 0, altura: ii.height || 0,
          status: licenca ? "condicionado" : "referencia",
          importavel: Boolean(licenca),
          _download: { tituloArquivo: p.title, largura: ii.width, urlOriginalArquivo: ii.url },
        };
      })
      .filter(Boolean);
  },

  // URL do arquivo para baixar: versão redimensionada pelo próprio Commons
  // quando o original for muito grande.
  async urlParaBaixar(r, { http }) {
    if (!r._download.largura || r._download.largura <= 2400) return r._download.urlOriginalArquivo;
    const u = new URL("/w/api.php", BASE());
    Object.entries({ action: "query", format: "json", formatversion: "2", titles: r._download.tituloArquivo, prop: "imageinfo", iiprop: "url", iiurlwidth: "2400" })
      .forEach(([k, v]) => u.searchParams.set(k, v));
    const d = await http.json(u);
    return d?.query?.pages?.[0]?.imageinfo?.[0]?.thumburl || r._download.urlOriginalArquivo;
  },
};
