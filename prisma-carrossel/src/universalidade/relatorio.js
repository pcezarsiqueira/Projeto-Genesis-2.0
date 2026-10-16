// Documento de universalidade de um carrossel (Markdown). Módulo puro.
import { CRITERIOS, NIVEL_FAMILIARIDADE, NIVEL_DISTRACAO } from "./recomendar.js";

export function markdownUniversalidade(c, rel) {
  const L = [`# Universalidade visual — ${c.titulo}`, "", "Gerado pelo PRISMA Studio com o repertório curado e regras locais (sem IA). Pontuações são estimativas editoriais de 0 a 100, não previsões de alcance; familiaridade é hipótese, sem dados de audiência.", ""];
  for (const s of rel) {
    L.push(`## Slide ${s.slide} · ${s.titulo}`, "", `- **Função:** ${s.funcao}`, `- **Conceito central:** ${s.conceitoCentral}`, `- **Reação pretendida:** ${s.emocao}`, `- **Layout recomendado:** ${s.layout}`, `- **Apenas tipografia:** ${s.tipografia.pontuacao}/100. ${s.tipografia.justificativa}`, "");
    for (const r of s.referencias) {
      L.push(`### ${r.pontuacao.total}/100 · ${r.nome}${r.ficha ? ` (${r.ficha})` : ""}`, `${r.rotuloTipo}. ${r.conexao}`, "",
        `Familiaridade estimada: ${NIVEL_FAMILIARIDADE[r.familiaridade]} (hipótese) · força metafórica ${r.metafora}/3 · risco de distração ${NIVEL_DISTRACAO[r.distracao]} · imagem: ${r.statusImagem.rotulo}.`);
      if (r.imagem?.nota) L.push(`Imagem: ${r.imagem.nota}`);
      if (r.verificar) L.push(`⚠ Verificar: ${r.verificar}`);
      L.push("");
    }
    if (s.fotosSugeridas.length) L.push("**Da sua biblioteca:** " + s.fotosSugeridas.map((f) => `${f.imagem.nome} (${f.motivos.join("; ")})`).join(" · "), "");
  }
  L.push("## Critérios da pontuação", "", ...CRITERIOS.map((x) => `- ${x}`), "");
  return L.join("\n");
}
