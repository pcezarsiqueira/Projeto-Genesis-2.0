// Minha Biblioteca: imagens reutilizáveis entre carrosséis.
//   dados/biblioteca/biblioteca.json   metadados (gravação atômica + histórico)
//   dados/biblioteca/imagens/          arquivos originais, nunca alterados
//
// Tipos de imagem e o que cada um permite:
//   pessoal     foto sua            → aprovada para exportação
//   propria     imagem de sua autoria → aprovada para exportação
//   licenciada  vinda de acervo/banco com licença informada → "condicionado"
//               até você confirmar que vai cumprir as condições
//   inspiracao  referência de estilo → nunca entra na arte
// Estados de uso: referencia | condicionado | aprovado
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DADOS, ErroUsuario, dentroDe } from "./persistencia.js";
import { obrigacoesDaLicenca } from "./conectores/licencas.js";

const DIR = path.join(DADOS, "biblioteca");
const IMAGENS = path.join(DIR, "imagens");
const ARQ = path.join(DIR, "biblioteca.json");
const HIST = path.join(DIR, "historico");

export const TIPOS = ["pessoal", "propria", "licenciada", "inspiracao"];
export const STATUS = ["referencia", "condicionado", "aprovado"];
export const ID_IMAGEM = /^img-[a-z0-9]{6,40}$/;
const ALBUNS_PADRAO = ["Fotos profissionais", "Fotos descontraídas", "Expressões faciais", "Fotos de estúdio", "Palestras", "Figurinos e personagens", "Objetos", "Referências gráficas", "Referências culturais"];

export function statusInicial(tipo) {
  return tipo === "pessoal" || tipo === "propria" ? "aprovado" : tipo === "licenciada" ? "condicionado" : "referencia";
}

function vazia() {
  return {
    versao: 1,
    albuns: ALBUNS_PADRAO.map((nome, i) => ({ id: `alb-padrao-${i + 1}`, nome })),
    imagens: [],
  };
}

export function lerBiblioteca() {
  fs.mkdirSync(IMAGENS, { recursive: true });
  if (!fs.existsSync(ARQ)) return vazia();
  return JSON.parse(fs.readFileSync(ARQ, "utf8"));
}

function gravar(b) {
  fs.mkdirSync(HIST, { recursive: true });
  if (fs.existsSync(ARQ)) {
    fs.copyFileSync(ARQ, path.join(HIST, `${new Date().toISOString().replace(/[:.]/g, "-")}.json`));
    const v = fs.readdirSync(HIST).sort();
    for (const x of v.slice(0, Math.max(0, v.length - 30))) fs.rmSync(path.join(HIST, x));
  }
  const tmp = `${ARQ}.tmp-${crypto.randomBytes(4).toString("hex")}`;
  fs.writeFileSync(tmp, JSON.stringify(b, null, 2));
  fs.renameSync(tmp, ARQ);
}

export function arquivoDaImagem(im) {
  return dentroDe(IMAGENS, path.basename(im.arquivo));
}

export function obterImagem(id) {
  if (!ID_IMAGEM.test(String(id))) throw new ErroUsuario("Imagem inválida.", 400);
  const im = lerBiblioteca().imagens.find((x) => x.id === id);
  if (!im) throw new ErroUsuario("Imagem não encontrada na biblioteca.", 404);
  return im;
}

const texto = (v, max) => String(v ?? "").slice(0, max);
const lista = (v, max = 30) => (Array.isArray(v) ? v : String(v || "").split(","))
  .map((x) => String(x).trim()).filter(Boolean).slice(0, max).map((x) => x.slice(0, 40));

export function adicionarImagem({ buf, info, nome, tipo = "pessoal", albuns = [], origem = null, etiquetas = [], descricao = "" }) {
  if (!TIPOS.includes(tipo)) throw new ErroUsuario("Tipo de imagem inválido.");
  const b = lerBiblioteca();
  const id = `img-${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`;
  const arquivo = `${id}.${info.ext}`;
  fs.writeFileSync(dentroDe(IMAGENS, arquivo), buf);
  const im = {
    id, arquivo, nome: texto(nome || "Imagem sem nome", 120), descricao: texto(descricao, 600), contexto: "",
    etiquetas: lista(etiquetas), albuns: albuns.filter((a) => b.albuns.some((x) => x.id === a)),
    favorita: false, tipo, status: statusInicial(tipo),
    largura: info.largura || 0, altura: info.altura || 0, bytes: buf.length,
    sha256: crypto.createHash("sha256").update(buf).digest("hex"),
    foco: { x: 50, y: 50 }, origem, autorizacao: null, projetos: [],
    criadaEm: new Date().toISOString(), atualizadaEm: new Date().toISOString(),
  };
  b.imagens.unshift(im);
  gravar(b);
  return im;
}

// Edição de metadados. Regras de direitos aplicadas no servidor:
// - "inspiracao" nunca vira aprovada;
// - "licenciada" só vira aprovada com confirmação das condições OU com
//   autorização/licença registrada pelo usuário;
// - mudar o tipo recalcula o estado.
export function atualizarImagem(id, dados) {
  const b = lerBiblioteca();
  const im = b.imagens.find((x) => x.id === id);
  if (!im) throw new ErroUsuario("Imagem não encontrada.", 404);
  if (dados.nome !== undefined) im.nome = texto(dados.nome, 120) || im.nome;
  if (dados.descricao !== undefined) im.descricao = texto(dados.descricao, 600);
  if (dados.contexto !== undefined) im.contexto = texto(dados.contexto, 600);
  if (dados.etiquetas !== undefined) im.etiquetas = lista(dados.etiquetas);
  if (dados.albuns !== undefined) im.albuns = lista(dados.albuns, 50).filter((a) => b.albuns.some((x) => x.id === a));
  if (dados.favorita !== undefined) im.favorita = Boolean(dados.favorita);
  if (dados.foco) im.foco = { x: Math.max(0, Math.min(100, Number(dados.foco.x) || 50)), y: Math.max(0, Math.min(100, Number(dados.foco.y) || 50)) };
  if (dados.zoom !== undefined) im.zoom = Math.max(1, Math.min(2.5, Number(dados.zoom) || 1));
  if (dados.tipo !== undefined && dados.tipo !== im.tipo) {
    if (!TIPOS.includes(dados.tipo)) throw new ErroUsuario("Tipo inválido.");
    if (im.origem?.fonte && ["pessoal", "propria"].includes(dados.tipo)) {
      throw new ErroUsuario("Esta imagem veio de um acervo externo e não pode ser marcada como sua.", 422);
    }
    im.tipo = dados.tipo;
    im.status = statusInicial(dados.tipo);
    if (im.tipo === "licenciada" && im.autorizacao) im.status = "aprovado";
  }
  // Origem registrada à mão (imagem achada na pesquisa manual e baixada por você).
  if (dados.origemManual !== undefined) {
    if (im.origem && !im.origem.manual) throw new ErroUsuario("A origem desta imagem veio da fonte e não pode ser editada.", 422);
    const o = dados.origemManual || {};
    const url = texto(o.urlOriginal, 500);
    if (url && !/^https?:\/\//.test(url)) throw new ErroUsuario("O endereço original deve começar com http:// ou https://", 422);
    im.origem = { manual: true, fonte: texto(o.fonte, 80), titulo: texto(o.titulo, 160), autor: texto(o.autor, 120), licenca: texto(o.licenca, 80), licencaUrl: texto(o.licencaUrl, 300), urlOriginal: url, registradaEm: new Date().toISOString() };
    im.origem.obrigacoes = obrigacoesDaLicenca(im.origem.licenca);
    if (im.tipo === "licenciada" && !im.autorizacao) { im.status = "condicionado"; im.condicoesConfirmadas = null; }
  }
  if (dados.autorizacao !== undefined) {
    if (im.tipo === "inspiracao") throw new ErroUsuario("Referências de inspiração não podem ser aprovadas. Mude o tipo se você tiver os direitos.", 422);
    const a = dados.autorizacao;
    if (a && texto(a.descricao, 600).trim().length < 10) throw new ErroUsuario("Descreva a licença ou autorização obtida (pelo menos 10 caracteres).", 422);
    im.autorizacao = a ? { descricao: texto(a.descricao, 600), data: texto(a.data, 10) || new Date().toISOString().slice(0, 10), registradaEm: new Date().toISOString() } : null;
    if (im.tipo === "licenciada") im.status = im.autorizacao ? "aprovado" : "condicionado";
  }
  if (dados.confirmarCondicoes !== undefined) {
    if (im.tipo !== "licenciada") throw new ErroUsuario("Só imagens licenciadas têm condições a confirmar.", 422);
    if (!im.origem?.licenca) throw new ErroUsuario("Sem licença identificada: informe a licença na origem ou registre uma autorização obtida.", 422);
    im.condicoesConfirmadas = dados.confirmarCondicoes ? { em: new Date().toISOString(), licenca: im.origem.licenca } : null;
    im.status = dados.confirmarCondicoes || im.autorizacao ? "aprovado" : "condicionado";
  }
  im.atualizadaEm = new Date().toISOString();
  gravar(b);
  return im;
}

export function substituirArquivo(id, buf, info) {
  const b = lerBiblioteca();
  const im = b.imagens.find((x) => x.id === id);
  if (!im) throw new ErroUsuario("Imagem não encontrada.", 404);
  if (im.origem?.fonte) throw new ErroUsuario("Imagens de acervo externo não podem ter o arquivo trocado (a licença vale para o arquivo original).", 422);
  const antigo = arquivoDaImagem(im);
  const novo = `${im.id}-${Date.now().toString(36)}.${info.ext}`;
  fs.writeFileSync(dentroDe(IMAGENS, novo), buf);
  im.arquivo = novo;
  Object.assign(im, { largura: info.largura || 0, altura: info.altura || 0, bytes: buf.length, sha256: crypto.createHash("sha256").update(buf).digest("hex"), atualizadaEm: new Date().toISOString() });
  gravar(b);
  try { fs.rmSync(antigo); } catch { /* já removido */ }
  return im;
}

export function removerImagem(id) {
  const b = lerBiblioteca();
  const i = b.imagens.findIndex((x) => x.id === id);
  if (i < 0) throw new ErroUsuario("Imagem não encontrada.", 404);
  const [im] = b.imagens.splice(i, 1);
  gravar(b);
  // vai para a lixeira, não some
  const lixo = path.join(DADOS, "lixeira", "biblioteca");
  fs.mkdirSync(lixo, { recursive: true });
  try { fs.renameSync(arquivoDaImagem(im), path.join(lixo, path.basename(im.arquivo))); } catch { /* arquivo ausente */ }
  fs.writeFileSync(path.join(lixo, `${im.id}.json`), JSON.stringify(im, null, 2));
  return { removida: im.id, usadaEm: im.projetos };
}

export function criarAlbum(nome) {
  const b = lerBiblioteca();
  const n = texto(nome, 60).trim();
  if (!n) throw new ErroUsuario("Dê um nome ao álbum.");
  if (b.albuns.some((a) => a.nome.toLowerCase() === n.toLowerCase())) throw new ErroUsuario("Já existe um álbum com esse nome.", 409);
  const alb = { id: `alb-${Date.now().toString(36)}`, nome: n };
  b.albuns.push(alb);
  gravar(b);
  return alb;
}

export function removerAlbum(id) {
  const b = lerBiblioteca();
  b.albuns = b.albuns.filter((a) => a.id !== id);
  b.imagens.forEach((im) => { im.albuns = im.albuns.filter((a) => a !== id); });
  gravar(b);
  return { ok: true };
}

export function registrarUso(id, projetoId) {
  const b = lerBiblioteca();
  const im = b.imagens.find((x) => x.id === id);
  if (im && !im.projetos.includes(projetoId)) { im.projetos.push(projetoId); gravar(b); }
}

// Texto de crédito a partir dos metadados de origem (nunca inventado).
export function creditoDe(im) {
  const o = im.origem;
  if (!o) return null;
  const partes = [o.titulo ? `“${o.titulo}”` : null, o.autor ? `por ${o.autor}` : null, o.licenca || null, o.fonte ? `via ${o.fonte}` : null].filter(Boolean);
  return partes.length ? partes.join(", ") : null;
}
