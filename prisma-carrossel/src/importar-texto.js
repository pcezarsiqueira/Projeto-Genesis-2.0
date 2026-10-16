// Transforma um texto colado em blocos de slide, sem IA. A interface mostra
// os blocos para o usuário revisar e escolher o modelo de cada um antes de
// criar o carrossel.
//
// Ponto de extensão: uma integração futura (Claude, PRISMA etc.) só precisa
// devolver o mesmo formato de blocos — [{ titulo, texto, itens, modelo }] —
// e pode ser registrada em FONTES sem mudar o resto do aplicativo.
import { novoSlide } from "./catalogo.js";

const MARCADOR = /^\s*(?:slide|p[áa]gina|tela)\s*\d+\s*[:.\-–—)]?\s*(.*)$/i;
const SEPARADOR = /^\s*(?:-{3,}|={3,}|\*{3,})\s*$/;
const ROTULO = /^\s*(t[íi]tulo|texto|complemento|cta|chamada|perguntas?|itens|assinatura)\s*:\s*(.*)$/i;
const ITEM = /^\s*(?:[-•–—*]|\d+[.)])\s+(.+)$/;

function dividir(texto) {
  const linhas = texto.replace(/\r\n?/g, "\n").split("\n");
  const temMarcador = linhas.some((l) => MARCADOR.test(l));
  const temSeparador = linhas.some((l) => SEPARADOR.test(l));
  const blocos = [];
  let atual = [];
  const fechar = () => { if (atual.some((l) => l.trim())) blocos.push(atual); atual = []; };
  for (const l of linhas) {
    if (temMarcador && MARCADOR.test(l)) { fechar(); const resto = l.match(MARCADOR)[1]; if (resto.trim()) atual.push(resto); continue; }
    if (temSeparador && SEPARADOR.test(l)) { fechar(); continue; }
    if (!temMarcador && !temSeparador && !l.trim()) { fechar(); continue; }
    atual.push(l);
  }
  fechar();
  return blocos;
}

function interpretar(linhas) {
  const b = { titulo: "", texto: "", itens: [], cta: "", numero: "" };
  const soltas = [];
  let campo = null;
  for (const l of linhas) {
    if (!l.trim()) { if (campo === "texto") b.texto += "\n\n"; continue; }
    const r = l.match(ROTULO);
    if (r) {
      const nome = r[1].toLowerCase();
      campo = nome.startsWith("t") && nome !== "texto" ? "titulo" : nome.startsWith("pergunta") || nome === "itens" ? "itens" : nome === "cta" || nome === "chamada" ? "cta" : "texto";
      if (r[2].trim()) campo === "itens" ? b.itens.push(r[2].trim()) : (b[campo] += (b[campo] ? " " : "") + r[2].trim());
      continue;
    }
    if (campo === "itens" || (ITEM.test(l) && b.titulo)) { b.itens.push((l.match(ITEM)?.[1] || l).trim()); continue; }
    if (campo) { b[campo] += (b[campo] && !b[campo].endsWith("\n\n") ? " " : "") + l.trim(); continue; }
    soltas.push(l.trim());
  }
  if (!b.titulo && soltas.length) b.titulo = soltas.shift();
  if (soltas.length) b.texto = [b.texto.trim(), soltas.join(" ")].filter(Boolean).join("\n\n");
  b.texto = b.texto.trim();
  const n = b.titulo.match(/^(\d{1,2})[.)]\s+(.+)$/);
  if (n) { b.numero = n[1]; b.titulo = n[2]; }
  // Perguntas soltas no texto viram itens de checklist
  if (!b.itens.length) {
    const perguntas = b.texto.split(/\n+|(?<=\?)\s+/).map((x) => x.trim()).filter((x) => x.endsWith("?"));
    if (perguntas.length >= 2 && perguntas.join(" ").length >= b.texto.replace(/\s+/g, " ").length * 0.8) { b.itens = perguntas; b.texto = ""; }
  }
  return b;
}

export function sugerirModelo(b, i, total) {
  if (i === 0) return "capa-impacto";
  if (i === total - 1 && total > 2) return "encerramento";
  if (b.numero) return "lista-numerada";
  if (b.itens.length >= 2) return "checklist";
  if (/salve|salvar/i.test(b.titulo + b.texto)) return "cta-salvar";
  if (/compartilh|envie|mande/i.test(b.titulo + b.texto)) return "cta-compartilhar";
  if (b.titulo.trim().endsWith("?")) return "provocacao";
  return "explicacao";
}

export function textoParaBlocos(texto) {
  const brutos = dividir(String(texto || ""));
  return brutos.map((l, i) => {
    const b = interpretar(l);
    return { ...b, modelo: sugerirModelo(b, i, brutos.length) };
  });
}

// Converte um bloco revisado em slide do modelo escolhido, sem perder texto.
export function blocoParaSlide(b, perfil = "") {
  const s = novoSlide(b.modelo, perfil);
  const titulo = (b.titulo || "").trim();
  const texto = (b.texto || "").trim();
  if (titulo) s.titulo = titulo;
  switch (s.template) {
    case "capa":
      s.numero = (titulo.match(/^(\d{1,2})\s/) || [])[1] || "";
      if (texto) s.chamada = texto.slice(0, 40);
      break;
    case "pergunta": case "destaque": s.complemento = texto || b.itens.join(" "); break;
    case "sinal": s.numero = b.numero || s.numero; s.texto = texto || b.itens.join(" "); break;
    case "explicacao": case "exemplo": s.texto = texto || b.itens.join("\n\n"); break;
    case "checklist": s.itens = b.itens.length ? b.itens : texto.split(/\n+/).filter(Boolean); break;
    case "comparacao": {
      const partes = b.itens.length >= 2 ? b.itens : texto.split(/\n+/).filter(Boolean);
      s.blocos = s.blocos.map((x, k) => ({ ...x, texto: partes[k] || x.texto }));
      break;
    }
    case "sinal-duplo": break;
    case "encerramento":
      if (b.cta || texto) s.cta = { icone: "comentar", texto: (b.cta || texto.split(/\n+/)[0]).trim() };
      break;
  }
  return s;
}

export const FONTES = {
  "texto-colado": { nome: "Texto colado", blocos: textoParaBlocos },
};
