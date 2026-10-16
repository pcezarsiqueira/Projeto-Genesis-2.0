// TMDB (The Movie Database) — catálogo de filmes e séries. Requer token de
// leitura da API (gratuito) criado pelo usuário. Os resultados são SEMPRE
// "referência cultural": cartazes e cenas são protegidos e não entram na arte.
// Aviso exigido pelo TMDB: este produto usa a API do TMDB, mas não é
// endossado nem certificado pelo TMDB.

export const tmdb = {
  id: "tmdb",
  nome: "TMDB (filmes e séries)",
  precisaChave: true,
  somenteReferencia: true,
  descricao: "Catálogo para identificar filmes e séries citados como referência. Imagens não são reutilizáveis.",
  configurado: (cfg) => Boolean(cfg.tmdb?.token),
  urlPesquisaManual: (termo) => `https://www.themoviedb.org/search?query=${encodeURIComponent(termo)}`,

  async buscar(termo, { http, cfg }) {
    const u = new URL("https://api.themoviedb.org/3/search/multi");
    u.searchParams.set("query", termo);
    u.searchParams.set("language", "pt-BR");
    const dados = await http.json(u, { headers: { Authorization: `Bearer ${cfg.tmdb.token}`, accept: "application/json" } });
    return (dados?.results || [])
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .map((r) => ({
        fonte: "TMDB",
        titulo: `${r.title || r.name}${(r.release_date || r.first_air_date) ? ` (${String(r.release_date || r.first_air_date).slice(0, 4)})` : ""}`,
        miniatura: r.poster_path ? `https://image.tmdb.org/t/p/w185${r.poster_path}` : null,
        urlOriginal: `https://www.themoviedb.org/${r.media_type}/${r.id}`,
        autor: null,
        licenca: null,
        licencaUrl: null,
        resumo: r.overview || "",
        obrigacoes: ["Obra protegida por direitos autorais: use apenas como referência cultural, citação no texto ou inspiração para uma foto sua."],
        largura: 0, altura: 0,
        status: "referencia",
        importavel: false,
      }));
  },
};
