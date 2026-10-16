// Ponte entre a interface e o motor: usa o MESMO código de templates do
// exportador para montar a prévia. O que aparece aqui é o que vai para o PNG.
// @ts-ignore módulo JS puro do motor
import { montarDocumento, renderSlide, contexto, validarDados } from "../../src/documento.js";
// @ts-ignore
import { OPCOES_INSPECAO } from "../../src/opcoes-inspecao.js";
// @ts-ignore
import { textosEsperados } from "../../src/util.js";
import type { Carrossel } from "./tipos";

export const URLS = {
  tokens: "/motor/design/tokens.css",
  base: "/motor/design/base.css",
  templates: "/motor/design/templates.css",
  ajuste: "/motor/navegador/ajuste.js",
  inspecao: "/motor/navegador/inspecao.js",
};

export const urlFoto = (id: string) => (arquivo: string) =>
  `/api/projetos/${encodeURIComponent(id)}/fotos/${encodeURIComponent(arquivo)}`;

export function documentoDoSlide(c: Carrossel, indice: number): string {
  return montarDocumento(c, { urls: URLS, urlFoto: urlFoto(c.id), apenas: indice });
}

export function htmlDoSlide(c: Carrossel, indice: number): string {
  const ctx = contexto(c, { urlFoto: urlFoto(c.id) });
  return renderSlide(c.slides[indice], indice, ctx);
}

// Impressão digital do que afeta a aparência de um slide (inclui numeração
// e total de itens, que dependem do carrossel inteiro).
export function chaveDoSlide(c: Carrossel, indice: number): string {
  const ctx = contexto(c, {});
  return JSON.stringify([c.slides[indice], indice, ctx.total, ctx.totalSinais, ctx.rotuloLista, c.perfil, c.autor]);
}

export function errosDeDados(c: Carrossel): string[] {
  try { validarDados(c); return []; } catch (e: any) { return e.lista || [String(e.message)]; }
}

export function opcoesInspecao(c: Carrossel, indice: number) {
  return { ...OPCOES_INSPECAO, largura: c.formato.largura, altura: c.formato.altura, esperados: [textosEsperados(c.slides[indice])] };
}
