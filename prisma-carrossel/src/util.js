// Utilitários de texto compartilhados por templates, renderização e validação.

export function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Palavras de uma letra (a, o, e, é, à) não ficam soltas no fim
// da linha: o espaço seguinte vira espaço inseparável.
export function amarrarCurtas(s = "") {
  return String(s).replace(/(?<=^|[\s*])([A-Za-zÀ-ÿ]) +(?=\S)/g, "$1\u00a0");
}

// *trecho* → destaque na cor de acento. Demais caracteres são escapados.
export function md(s = "") {
  return esc(amarrarCurtas(s)).replace(/\*([^*]+)\*/g, '<em class="hl">$1</em>');
}

export function semMarcacao(s = "") {
  return String(s).replace(/\*/g, "");
}

export function normalizar(s = "") {
  return String(s)
    .replace(/\u00ad/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

export const pad2 = (n) => String(n).padStart(2, "0");

// Campos de texto que precisam aparecer na arte (usado pela validação).
const CHAVES_TEXTO = new Set([
  "titulo", "complemento", "texto", "chamada", "assinatura", "itens", "grafico_rotulos",
]);

export function textosEsperados(slide) {
  const out = [];
  const visitar = (obj) => {
    if (Array.isArray(obj)) return obj.forEach(visitar);
    if (!obj || typeof obj !== "object") return;
    for (const [k, v] of Object.entries(obj)) {
      if (CHAVES_TEXTO.has(k)) {
        (Array.isArray(v) ? v : [v]).forEach((t) => typeof t === "string" && out.push(semMarcacao(t)));
      } else if (typeof v === "object") {
        visitar(v);
      }
    }
  };
  visitar(slide);
  return out;
}
