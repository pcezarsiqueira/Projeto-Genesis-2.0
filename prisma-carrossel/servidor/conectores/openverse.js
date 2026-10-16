// Openverse — buscador aberto de mídia com licenças Creative Commons (sem chave,
// com limite de requisições). Documentação: https://api.openverse.org/v1/
import { obrigacoesDaLicenca } from "./licencas.js";

const BASE = () => process.env.PRISMA_URL_OPENVERSE || "https://api.openverse.org";
const NOME_LICENCA = (l, v) => (l === "cc0" ? "CC0 1.0" : l === "pdm" ? "Public Domain Mark 1.0" : `CC ${String(l || "").toUpperCase()} ${v || ""}`.trim());

export const openverse = {
  id: "openverse",
  nome: "Openverse",
  precisaChave: false,
  descricao: "Buscador de imagens com licenças Creative Commons de vários acervos (Flickr, museus, Wikimedia…).",
  configurado: () => true,
  urlPesquisaManual: (termo) => `https://openverse.org/search/image?q=${encodeURIComponent(termo)}`,

  async buscar(termo, { http }) {
    const u = new URL("/v1/images/", BASE());
    u.searchParams.set("q", termo);
    u.searchParams.set("page_size", "24");
    const dados = await http.json(u);
    return (dados?.results || [])
      .filter((r) => !r.filetype || /^(jpg|jpeg|png|webp)$/i.test(r.filetype))
      .map((r) => {
        const licenca = r.license ? NOME_LICENCA(r.license, r.license_version) : null;
        return {
          fonte: `Openverse${r.source ? ` · ${r.source}` : ""}`,
          titulo: r.title || "Sem título",
          miniatura: r.thumbnail || r.url,
          urlOriginal: r.foreign_landing_url || r.url,
          autor: r.creator || null,
          licenca,
          licencaUrl: r.license_url || null,
          atribuicaoPronta: r.attribution || null,
          obrigacoes: obrigacoesDaLicenca(licenca || ""),
          largura: r.width || 0, altura: r.height || 0,
          status: licenca ? "condicionado" : "referencia",
          importavel: Boolean(licenca && r.url),
          _download: { url: r.url },
        };
      });
  },
  urlParaBaixar: async (r) => r._download.url,
};
