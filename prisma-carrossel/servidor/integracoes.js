// Configuração local das integrações (dados/config.json). As chaves ficam só
// neste computador e nunca são devolvidas ao navegador.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DADOS, ErroUsuario } from "./persistencia.js";

const ARQ = path.join(DADOS, "config.json");

export function lerConfig() {
  try { return JSON.parse(fs.readFileSync(ARQ, "utf8")); } catch { return {}; }
}
export function salvarConfig(patch) {
  const cfg = lerConfig();
  const limpar = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);
  if (patch.unsplash) cfg.unsplash = patch.unsplash.chave === "" ? undefined : { chave: limpar(patch.unsplash.chave) };
  if (patch.tmdb) cfg.tmdb = patch.tmdb.token === "" ? undefined : { token: limpar(patch.tmdb.token, 600) };
  if (patch.contato !== undefined) {
    const c = limpar(patch.contato, 120) || "";
    if (c && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) throw new ErroUsuario("Contato deve ser um e-mail válido (ou vazio).");
    cfg.contato = c;
  }
  if (patch.ia !== undefined) cfg.ia = { ...(cfg.ia || {}), consentimentoImagens: Boolean(patch.ia.consentimentoImagens) };
  fs.mkdirSync(DADOS, { recursive: true });
  const tmp = `${ARQ}.tmp-${crypto.randomBytes(4).toString("hex")}`;
  fs.writeFileSync(tmp, JSON.stringify(cfg, null, 2));
  fs.renameSync(tmp, ARQ);
  return cfg;
}
export function publico(cfg) {
  const mascara = (s) => (s ? `••••${String(s).slice(-4)}` : null);
  return { unsplash: mascara(cfg.unsplash?.chave), tmdb: mascara(cfg.tmdb?.token), contato: cfg.contato || "", ia: { consentimentoImagens: Boolean(cfg.ia?.consentimentoImagens) } };
}
