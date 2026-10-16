// Unsplash — exige chave de acesso (Access Key) gratuita criada pelo usuário
// em https://unsplash.com/developers. Segue as diretrizes da API: miniaturas
// exibidas direto do Unsplash, crédito ao fotógrafo e registro de download
// (download_location) quando a foto é efetivamente usada.
import { obrigacoesDaLicenca } from "./licencas.js";

export const unsplash = {
  id: "unsplash",
  nome: "Unsplash",
  precisaChave: true,
  descricao: "Banco de fotos com licença própria (uso livre, inclusive comercial). Requer uma Access Key sua.",
  configurado: (cfg) => Boolean(cfg.unsplash?.chave),
  urlPesquisaManual: (termo) => `https://unsplash.com/s/photos/${encodeURIComponent(termo)}`,

  async buscar(termo, { http, cfg }) {
    const u = new URL("https://api.unsplash.com/search/photos");
    u.searchParams.set("query", termo);
    u.searchParams.set("per_page", "24");
    const dados = await http.json(u, { headers: { Authorization: `Client-ID ${cfg.unsplash.chave}`, "Accept-Version": "v1" } });
    return (dados?.results || []).map((p) => ({
      fonte: "Unsplash",
      titulo: p.description || p.alt_description || "Foto do Unsplash",
      miniatura: p.urls?.small,
      urlOriginal: p.links?.html,
      autor: p.user?.name || null,
      licenca: "Licença Unsplash",
      licencaUrl: "https://unsplash.com/license",
      atribuicaoPronta: p.user?.name ? `Foto de ${p.user.name} no Unsplash` : null,
      obrigacoes: obrigacoesDaLicenca("Unsplash"),
      largura: p.width || 0, altura: p.height || 0,
      status: "condicionado",
      importavel: true,
      _download: { raw: p.urls?.raw, registro: p.links?.download_location },
    }));
  },
  async urlParaBaixar(r, { http, cfg }) {
    if (r._download.registro) {
      await http.json(new URL(r._download.registro), { headers: { Authorization: `Client-ID ${cfg.unsplash.chave}` } }).catch(() => {});
    }
    return `${r._download.raw}&w=2160&fm=jpg&q=85`;
  },
};
