// Persistência local dos projetos, em pastas:
//   dados/projetos/<id>/carrossel.json   conteúdo (mesmo formato do motor)
//   dados/projetos/<id>/fotos/           fotografias enviadas
//   dados/projetos/<id>/exportacao/      últimos arquivos gerados
//   dados/projetos/<id>/historico/       versões anteriores (gravação segura)
//   dados/lixeira/                       projetos excluídos (recuperáveis)
//   dados/backups/                       cópias feitas antes de migrações
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { validarDados } from "../src/documento.js";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Muda quando o motor de renderização muda, invalidando exportações antigas.
export const VERSAO_MOTOR = "2.0.0";
export const DADOS = path.resolve(process.env.PRISMA_DADOS || path.join(RAIZ, "dados"));
const PROJETOS = path.join(DADOS, "projetos");
const LIXEIRA = path.join(DADOS, "lixeira");
const BACKUPS = path.join(DADOS, "backups");
const MAX_HISTORICO = 40;

export const ID_VALIDO = /^[a-z0-9][a-z0-9-]{0,79}$/;

export class ErroUsuario extends Error {
  constructor(msg, status = 400, extra) { super(msg); this.status = status; this.extra = extra; }
}

export function garantirPastas() {
  for (const d of [PROJETOS, LIXEIRA, BACKUPS]) fs.mkdirSync(d, { recursive: true });
}

// Caminho seguro dentro de uma pasta autorizada (contra path traversal).
export function dentroDe(base, ...partes) {
  const alvo = path.resolve(base, ...partes);
  const rel = path.relative(base, alvo);
  if (rel.startsWith("..") || path.isAbsolute(rel)) throw new ErroUsuario("Caminho não permitido.", 403);
  return alvo;
}

export function dirProjeto(id) {
  if (!ID_VALIDO.test(String(id))) throw new ErroUsuario("Identificador de projeto inválido.", 400);
  return dentroDe(PROJETOS, id);
}
export const dirFotos = (id) => path.join(dirProjeto(id), "fotos");
export const dirExportacao = (id) => path.join(dirProjeto(id), "exportacao");

function escreverAtomico(arquivo, conteudo) {
  const tmp = `${arquivo}.tmp-${process.pid}-${crypto.randomBytes(4).toString("hex")}`;
  fs.writeFileSync(tmp, conteudo);
  fs.renameSync(tmp, arquivo);
}

export function slugificar(texto) {
  return String(texto || "carrossel")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 50) || "carrossel";
}

function idLivre(base) {
  let id = slugificar(base);
  if (!ID_VALIDO.test(id)) id = "carrossel";
  let n = 2, cand = id;
  while (fs.existsSync(path.join(PROJETOS, cand)) || fs.existsSync(path.join(LIXEIRA, cand))) cand = `${id}-${n++}`;
  return cand;
}

// Hash do conteúdo que influencia a arte (ignora metadados do Studio).
export function hashConteudo(c) {
  const { studio, id, ...resto } = c;
  // escolhas de referência (universalidade) não mudam a arte
  resto.slides = (resto.slides || []).map(({ universalidade, ...sl }) => sl);
  return crypto.createHash("sha256").update(VERSAO_MOTOR + JSON.stringify(resto)).digest("hex").slice(0, 16);
}

function normalizar(c, id) {
  const copia = JSON.parse(JSON.stringify(c));
  delete copia.__dirFotos;
  copia.id = id;
  copia.formato ||= { largura: 1080, altura: 1350 };
  copia.titulo = String(copia.titulo || "Sem título").slice(0, 200);
  return copia;
}

export function lerProjeto(id) {
  const arq = path.join(dirProjeto(id), "carrossel.json");
  if (!fs.existsSync(arq)) throw new ErroUsuario("Projeto não encontrado.", 404);
  return JSON.parse(fs.readFileSync(arq, "utf8"));
}

export function estadoExportacao(id) {
  try { return JSON.parse(fs.readFileSync(path.join(dirExportacao(id), "estado.json"), "utf8")); } catch { return null; }
}
export function gravarEstadoExportacao(id, estado) {
  fs.mkdirSync(dirExportacao(id), { recursive: true });
  escreverAtomico(path.join(dirExportacao(id), "estado.json"), JSON.stringify(estado, null, 2));
}

export function resumo(c) {
  const exp = estadoExportacao(c.id);
  const hash = hashConteudo(c);
  return {
    id: c.id, titulo: c.titulo, publicacao: c.publicacao || "", slides: c.slides.length,
    atualizadoEm: c.studio?.atualizadoEm || null,
    status: !exp ? "rascunho" : exp.hash === hash ? (exp.totalErros ? "exportado-com-erros" : "exportado") : "desatualizado",
    exportadoEm: exp?.quando || null,
  };
}

export function listarProjetos() {
  garantirPastas();
  return fs.readdirSync(PROJETOS)
    .filter((d) => ID_VALIDO.test(d) && fs.existsSync(path.join(PROJETOS, d, "carrossel.json")))
    .map((d) => { try { return lerProjeto(d); } catch { return null; } })
    .filter(Boolean)
    .sort((a, b) => String(b.studio?.atualizadoEm || "").localeCompare(String(a.studio?.atualizadoEm || "")));
}

// revisao: controle simples de concorrência — recusa gravar por cima de uma
// versão mais nova (ex.: o mesmo projeto aberto em duas abas).
export function salvarProjeto(id, dados, { revisaoEsperada } = {}) {
  const dir = dirProjeto(id);
  const arq = path.join(dir, "carrossel.json");
  if (!fs.existsSync(arq)) throw new ErroUsuario("Projeto não encontrado.", 404);
  const atual = lerProjeto(id);
  const revAtual = atual.studio?.revisao || 0;
  if (revisaoEsperada !== undefined && revisaoEsperada !== revAtual) {
    throw new ErroUsuario("Este projeto foi alterado em outra janela. Recarregue para continuar.", 409, { revisao: revAtual });
  }
  const novo = normalizar(dados, id);
  try { validarDados(novo); } catch (e) { throw new ErroUsuario(e.message, 422, { erros: e.lista }); }
  novo.studio = { ...(atual.studio || {}), revisao: revAtual + 1, atualizadoEm: new Date().toISOString() };

  // versão anterior vai para o histórico antes de sobrescrever
  const hist = path.join(dir, "historico");
  fs.mkdirSync(hist, { recursive: true });
  fs.copyFileSync(arq, path.join(hist, `${new Date().toISOString().replace(/[:.]/g, "-")}-r${revAtual}.json`));
  const versoes = fs.readdirSync(hist).sort();
  for (const v of versoes.slice(0, Math.max(0, versoes.length - MAX_HISTORICO))) fs.rmSync(path.join(hist, v));

  escreverAtomico(arq, JSON.stringify(novo, null, 2));
  return novo;
}

export function criarProjeto(dados, { origemFotos } = {}) {
  garantirPastas();
  const id = idLivre(dados.id || `${dados.publicacao || ""}-${dados.titulo || "carrossel"}`);
  const novo = normalizar(dados, id);
  try { validarDados(novo); } catch (e) { throw new ErroUsuario(e.message, 422, { erros: e.lista }); }
  const agora = new Date().toISOString();
  novo.studio = { criadoEm: agora, atualizadoEm: agora, revisao: 1 };
  const dir = path.join(PROJETOS, id);
  fs.mkdirSync(path.join(dir, "fotos"), { recursive: true });
  if (origemFotos && fs.existsSync(origemFotos)) {
    for (const f of fs.readdirSync(origemFotos)) fs.copyFileSync(path.join(origemFotos, f), path.join(dir, "fotos", f));
  }
  escreverAtomico(path.join(dir, "carrossel.json"), JSON.stringify(novo, null, 2));
  return novo;
}

export function duplicarProjeto(id) {
  const c = lerProjeto(id);
  const { studio, ...resto } = c;
  return criarProjeto({ ...resto, id: undefined, titulo: `${c.titulo} (cópia)` }, { origemFotos: dirFotos(id) });
}

export function excluirProjeto(id) {
  const dir = dirProjeto(id);
  if (!fs.existsSync(dir)) throw new ErroUsuario("Projeto não encontrado.", 404);
  garantirPastas();
  const destino = path.join(LIXEIRA, `${id}--${Date.now()}`);
  fs.renameSync(dir, destino);
  return { movidoPara: path.relative(DADOS, destino) };
}

// Primeira execução: importa os carrosséis do motor (carrosseis/<id>/) que
// ainda não existem no Studio. Faz backup dos dados antes de qualquer migração.
export function importarCarrosseisDoMotor() {
  garantirPastas();
  const base = path.join(RAIZ, "carrosseis");
  if (!fs.existsSync(base)) return [];
  const importados = [];
  for (const pasta of fs.readdirSync(base).sort()) {
    const arq = path.join(base, pasta, "carrossel.json");
    if (!fs.existsSync(arq) || !ID_VALIDO.test(pasta)) continue;
    if (fs.existsSync(path.join(PROJETOS, pasta)) || fs.readdirSync(LIXEIRA).some((d) => d.startsWith(pasta + "--"))) continue;
    const c = JSON.parse(fs.readFileSync(arq, "utf8"));
    const backup = path.join(BACKUPS, `importacao-${pasta}-${Date.now()}.json`);
    fs.copyFileSync(arq, backup);
    const dir = path.join(PROJETOS, pasta);
    fs.mkdirSync(path.join(dir, "fotos"), { recursive: true });
    for (const s of c.slides || []) {
      if (s.foto?.arquivo) {
        const origem = path.join(RAIZ, "assets", path.basename(s.foto.arquivo));
        if (fs.existsSync(origem)) fs.copyFileSync(origem, path.join(dir, "fotos", path.basename(s.foto.arquivo)));
      }
    }
    const agora = new Date().toISOString();
    const novo = normalizar(c, pasta);
    novo.studio = { criadoEm: agora, atualizadoEm: agora, revisao: 1, importadoDe: `carrosseis/${pasta}` };
    escreverAtomico(path.join(dir, "carrossel.json"), JSON.stringify(novo, null, 2));
    importados.push(pasta);
  }
  return importados;
}
