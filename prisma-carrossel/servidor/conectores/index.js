// Registro dos conectores de busca. Para adicionar uma fonte, crie um módulo
// com { id, nome, precisaChave, configurado(cfg), buscar(termo, ctx),
// urlParaBaixar?(resultado, ctx), urlPesquisaManual(termo) } e inclua aqui.
import crypto from "node:crypto";
import { wikimedia } from "./wikimedia.js";
import { openverse } from "./openverse.js";
import { unsplash } from "./unsplash.js";
import { tmdb } from "./tmdb.js";

export const CONECTORES = [wikimedia, openverse, unsplash, tmdb];
const UA = "PRISMA-Studio/2.1 (aplicativo local; https://github.com/pcezarsiqueira/Projeto-Genesis-2.0)";
const TAMANHO_MAX = 20 * 1024 * 1024;

export class ErroConector extends Error {
  constructor(msg, status = 502) { super(msg); this.status = status; }
}

function http(cfg) {
  const ua = cfg.contato ? `${UA} contato: ${cfg.contato}` : UA;
  async function pedir(url, opcoes = {}) {
    let r;
    try {
      r = await fetch(url, { ...opcoes, headers: { "User-Agent": ua, ...(opcoes.headers || {}) }, signal: AbortSignal.timeout(15000), redirect: "follow" });
    } catch (e) {
      throw new ErroConector(`Não foi possível acessar ${new URL(url).host} a partir deste computador (sem internet, bloqueio de rede ou serviço fora do ar). Detalhe: ${e.cause?.code || e.message}`);
    }
    if (r.status === 401 || r.status === 403) throw new ErroConector(`${new URL(url).host} recusou o acesso (${r.status}). Verifique a chave em Integrações.`, 502);
    if (r.status === 429) throw new ErroConector(`${new URL(url).host} pediu para esperar (limite de buscas). Tente em alguns minutos.`, 429);
    if (!r.ok) throw new ErroConector(`${new URL(url).host} respondeu com erro ${r.status}.`);
    return r;
  }
  return {
    json: async (url, opcoes) => (await pedir(url, opcoes)).json(),
    // baixa com limite de tamanho, lendo em partes
    bytes: async (url) => {
      const r = await pedir(url);
      const declarado = Number(r.headers.get("content-length") || 0);
      if (declarado > TAMANHO_MAX) throw new ErroConector("Arquivo maior que 20 MB.", 413);
      const partes = [];
      let total = 0;
      for await (const p of r.body) {
        total += p.length;
        if (total > TAMANHO_MAX) throw new ErroConector("Arquivo maior que 20 MB.", 413);
        partes.push(p);
      }
      return Buffer.concat(partes);
    },
  };
}

// Resultados ficam no servidor: a importação recebe só o id do resultado,
// nunca uma URL vinda do navegador (evita usar o servidor para baixar
// endereços arbitrários).
const cache = new Map();
const VALIDADE = 2 * 60 * 60 * 1000;

export async function buscar(fonteId, termo, cfg) {
  const c = CONECTORES.find((x) => x.id === fonteId);
  if (!c) throw new ErroConector("Fonte desconhecida.", 404);
  const t = String(termo || "").trim().slice(0, 120);
  if (!t) throw new ErroConector("Digite o que procurar.", 400);
  if (!c.configurado(cfg)) throw new ErroConector(`${c.nome} não está configurado. Adicione a chave em Integrações ou use a pesquisa manual.`, 409);
  const consultadoEm = new Date().toISOString();
  const brutos = await c.buscar(t, { http: http(cfg), cfg });
  const agora = Date.now();
  for (const [k, v] of cache) if (agora - v.quando > VALIDADE) cache.delete(k);
  return brutos.map((r) => {
    const id = `res-${crypto.randomBytes(6).toString("hex")}`;
    cache.set(id, { quando: agora, fonteId, termo: t, consultadoEm, r });
    const { _download, ...publico } = r;
    return { id, ...publico, termo: t, consultadoEm };
  });
}

export async function baixarResultado(resultadoId, cfg) {
  const item = cache.get(String(resultadoId));
  if (!item) throw new ErroConector("Resultado expirado. Faça a busca de novo.", 410);
  const c = CONECTORES.find((x) => x.id === item.fonteId);
  if (!item.r.importavel || !c.urlParaBaixar) throw new ErroConector("Este resultado é só referência: não pode ser importado como imagem utilizável.", 422);
  const h = http(cfg);
  const url = await c.urlParaBaixar(item.r, { http: h, cfg });
  const testeLocal = process.env.PRISMA_TESTE_FONTES === "1" && /^http:\/\/127\.0\.0\.1:/.test(url);
  if (!/^https:\/\//.test(url) && !testeLocal) throw new ErroConector("Endereço de download inválido.", 422);
  const buf = await h.bytes(url);
  const { _download, ...meta } = item.r;
  return { buf, meta: { ...meta, termo: item.termo, consultadoEm: item.consultadoEm, urlArquivo: url } };
}

export function descreverConectores(cfg) {
  return CONECTORES.map((c) => ({
    id: c.id, nome: c.nome, descricao: c.descricao, precisaChave: c.precisaChave,
    somenteReferencia: Boolean(c.somenteReferencia), configurado: c.configurado(cfg),
  }));
}

export function urlManual(fonteId, termo) {
  const c = CONECTORES.find((x) => x.id === fonteId);
  return c ? c.urlPesquisaManual(String(termo || "")) : null;
}
