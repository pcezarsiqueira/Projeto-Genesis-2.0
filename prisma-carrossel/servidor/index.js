// PRISMA Studio — servidor local.
// Escuta apenas em 127.0.0.1. Serve a interface (studio/dist), a API de
// projetos, fotos e exportações, e os downloads com os bytes reais.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import net from "node:net";
import { spawn } from "node:child_process";
import express from "express";
import yazl from "yazl";
import {
  RAIZ, DADOS, ErroUsuario, dentroDe, dirProjeto, dirFotos, dirExportacao,
  lerProjeto, listarProjetos, salvarProjeto, criarProjeto, duplicarProjeto, excluirProjeto,
  importarCarrosseisDoMotor, resumo, estadoExportacao, garantirPastas,
} from "./persistencia.js";
import { exportar, exportacaoValida, exportando, navegadorEmUso, fecharNavegador } from "./exportador.js";
import { identificarImagem, TAMANHO_MAXIMO, NOME_FOTO, MIME_POR_EXT } from "./imagens.js";
import { DESTINOS } from "../src/destinos.js";
import {
  lerBiblioteca, obterImagem, adicionarImagem, atualizarImagem, substituirArquivo, removerImagem,
  criarAlbum, removerAlbum, registrarUso, arquivoDaImagem, creditoDe, TIPOS,
} from "./biblioteca.js";
import { buscar, baixarResultado, descreverConectores, urlManual } from "./conectores/index.js";
import { lerConfig, salvarConfig, publico } from "./integracoes.js";
import { statusIA } from "./ia.js";
import { relatorioUniversalidade, FILTROS, CRITERIOS } from "../src/universalidade/recomendar.js";

const HOST = "127.0.0.1";
const PORTA_INICIAL = Number(process.env.PRISMA_PORTA) || 4317;
const DIST = path.join(RAIZ, "studio", "dist");
const pad2 = (n) => String(n).padStart(2, "0");

const app = express();
app.disable("x-powered-by");

// Só aceita requisições endereçadas ao próprio computador (evita DNS rebinding).
let portaAtual = PORTA_INICIAL;
app.use((req, res, next) => {
  const host = String(req.headers.host || "");
  const ok = [`127.0.0.1:${portaAtual}`, `localhost:${portaAtual}`].includes(host);
  if (!ok) return res.status(403).send("Acesso permitido apenas pelo próprio computador.");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

const assincrono = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ---------- arquivos estáticos ---------- */
app.use("/motor/design", express.static(path.join(RAIZ, "design"), { fallthrough: false, index: false }));
app.use("/motor/navegador", express.static(path.join(RAIZ, "src", "navegador"), { fallthrough: false, index: false }));

/* ---------- API ---------- */
const api = express.Router();
api.use(express.json({ limit: "4mb" }));

api.get("/saude", (req, res) => res.json({ ok: true, app: "prisma-studio", navegador: navegadorEmUso() }));
api.get("/destinos", (req, res) => res.json(DESTINOS));

api.get("/projetos", (req, res) => {
  res.json(listarProjetos().map((c) => ({ ...resumo(c), exportando: exportando(c.id), dados: c })));
});

api.get("/projetos/:id", (req, res) => {
  const c = lerProjeto(req.params.id);
  res.json({ dados: c, resumo: { ...resumo(c), exportando: exportando(c.id) }, exportacao: estadoExportacao(c.id) });
});

api.put("/projetos/:id", (req, res) => {
  const { dados, revisao } = req.body || {};
  if (!dados) throw new ErroUsuario("Corpo da requisição sem dados.");
  const salvo = salvarProjeto(req.params.id, dados, { revisaoEsperada: revisao });
  res.json({ dados: salvo, resumo: resumo(salvo) });
});

api.post("/projetos", (req, res) => {
  const { dados, duplicarDe } = req.body || {};
  const novo = duplicarDe ? duplicarProjeto(duplicarDe) : criarProjeto(dados || {});
  res.status(201).json({ dados: novo, resumo: resumo(novo) });
});

api.delete("/projetos/:id", (req, res) => {
  if (req.query.confirmar !== "sim") throw new ErroUsuario("Confirmação necessária para excluir.");
  res.json(excluirProjeto(req.params.id));
});

/* fotos */
api.get("/projetos/:id/fotos", (req, res) => {
  const dir = dirFotos(req.params.id);
  const lista = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => NOME_FOTO.test(f) || /\.(jpe?g|png|webp)$/i.test(f)) : [];
  res.json(lista.map((arquivo) => {
    const info = identificarImagem(fs.readFileSync(path.join(dir, arquivo)).subarray(0, 65536)) || {};
    return { arquivo, largura: info.largura || 0, altura: info.altura || 0 };
  }));
});

api.post("/projetos/:id/fotos", express.raw({ type: () => true, limit: TAMANHO_MAXIMO }), (req, res) => {
  const dir = dirFotos(req.params.id);
  lerProjeto(req.params.id);
  const buf = req.body;
  if (!Buffer.isBuffer(buf) || !buf.length) throw new ErroUsuario("Nenhum arquivo recebido.");
  const info = identificarImagem(buf);
  if (!info) throw new ErroUsuario("Formato não aceito. Envie JPG, PNG ou WebP.", 415);
  if (info.largura && (info.largura < 400 || info.altura < 400)) throw new ErroUsuario(`Imagem muito pequena (${info.largura}×${info.altura}). Use pelo menos 400 px no menor lado.`, 422);
  fs.mkdirSync(dir, { recursive: true });
  const arquivo = `foto-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}.${info.ext}`;
  fs.writeFileSync(dentroDe(dir, arquivo), buf);
  res.status(201).json({
    arquivo, largura: info.largura, altura: info.altura,
    aviso: info.largura && info.largura < 1080 ? `Resolução baixa (${info.largura} px de largura). Pode ficar sem nitidez em tela cheia.` : null,
  });
});

api.get("/projetos/:id/fotos/:arquivo", (req, res) => {
  const nome = path.basename(req.params.arquivo);
  const ext = nome.split(".").pop().toLowerCase().replace("jpeg", "jpg");
  if (!MIME_POR_EXT[ext]) throw new ErroUsuario("Arquivo não permitido.", 403);
  const arq = dentroDe(dirFotos(req.params.id), nome);
  if (!fs.existsSync(arq)) throw new ErroUsuario("Foto não encontrada.", 404);
  res.type(MIME_POR_EXT[ext]).sendFile(arq);
});

/* exportação */
api.post("/projetos/:id/exportar", assincrono(async (req, res) => {
  const estado = await exportar(req.params.id, { forcar: req.query.forcar === "sim" });
  res.json({ estado, valida: exportacaoValida(req.params.id) });
}));

api.get("/projetos/:id/exportacao", (req, res) => {
  res.json({ estado: estadoExportacao(req.params.id), valida: exportacaoValida(req.params.id), exportando: exportando(req.params.id) });
});


/* ---------- Minha Biblioteca ---------- */
api.get("/biblioteca", (req, res) => res.json(lerBiblioteca()));

const lerUpload = express.raw({ type: () => true, limit: TAMANHO_MAXIMO });
function validarImagemEnviada(buf) {
  if (!Buffer.isBuffer(buf) || !buf.length) throw new ErroUsuario("Nenhum arquivo recebido.");
  const info = identificarImagem(buf);
  if (!info) throw new ErroUsuario("Formato não aceito. Envie JPG, PNG ou WebP.", 415);
  if (info.largura && (info.largura < 400 || info.altura < 400)) throw new ErroUsuario(`Imagem muito pequena (${info.largura}×${info.altura}). Use pelo menos 400 px no menor lado.`, 422);
  return info;
}
const cabecalho = (req, k) => { try { return decodeURIComponent(String(req.headers[k] || "")); } catch { return ""; } };

api.post("/biblioteca/imagens", lerUpload, (req, res) => {
  const info = validarImagemEnviada(req.body);
  const tipo = cabecalho(req, "x-tipo") || "pessoal";
  if (!TIPOS.includes(tipo)) throw new ErroUsuario("Tipo inválido.");
  const im = adicionarImagem({
    buf: req.body, info, tipo,
    nome: cabecalho(req, "x-nome").replace(/\.[a-z0-9]+$/i, ""),
    albuns: cabecalho(req, "x-albuns").split(",").filter(Boolean),
  });
  res.status(201).json({ imagem: im, aviso: info.largura && info.largura < 1080 ? `Resolução baixa (${info.largura} px de largura): pode perder nitidez em tela cheia.` : null });
});
api.patch("/biblioteca/imagens/:id", (req, res) => { obterImagem(req.params.id); res.json(atualizarImagem(req.params.id, req.body || {})); });
api.put("/biblioteca/imagens/:id/arquivo", lerUpload, (req, res) => {
  obterImagem(req.params.id);
  if (req.query.confirmar !== "sim") throw new ErroUsuario("Confirmação necessária para substituir.");
  res.json(substituirArquivo(req.params.id, req.body, validarImagemEnviada(req.body)));
});
api.delete("/biblioteca/imagens/:id", (req, res) => {
  obterImagem(req.params.id);
  if (req.query.confirmar !== "sim") throw new ErroUsuario("Confirmação necessária para remover.");
  res.json(removerImagem(req.params.id));
});
api.get("/biblioteca/imagens/:id/arquivo", (req, res) => {
  const im = obterImagem(req.params.id);
  const arq = arquivoDaImagem(im);
  if (!fs.existsSync(arq)) throw new ErroUsuario("Arquivo não encontrado.", 404);
  res.type(MIME_POR_EXT[path.extname(arq).slice(1)] || "application/octet-stream").sendFile(arq);
});
api.post("/biblioteca/albuns", (req, res) => res.status(201).json(criarAlbum(req.body?.nome)));
api.delete("/biblioteca/albuns/:id", (req, res) => res.json(removerAlbum(String(req.params.id))));

/* ---------- busca externa (conectores reais; nada simulado) ---------- */
api.get("/fontes", (req, res) => res.json(descreverConectores(lerConfig())));
api.get("/fontes/:fonte/buscar", assincrono(async (req, res) => {
  const termo = String(req.query.q || "");
  try {
    res.json({ resultados: await buscar(req.params.fonte, termo, lerConfig()), urlManual: urlManual(req.params.fonte, termo) });
  } catch (e) {
    e.extra = { urlManual: urlManual(req.params.fonte, termo) };
    throw e;
  }
}));
api.post("/biblioteca/importar", assincrono(async (req, res) => {
  const { resultadoId, albuns = [] } = req.body || {};
  const { buf, meta } = await baixarResultado(resultadoId, lerConfig());
  const info = identificarImagem(buf);
  if (!info) throw new ErroUsuario("O arquivo recebido da fonte não é uma imagem JPG, PNG ou WebP.", 415);
  const origem = {
    fonte: meta.fonte, titulo: meta.titulo, autor: meta.autor, licenca: meta.licenca, licencaUrl: meta.licencaUrl,
    urlOriginal: meta.urlOriginal, urlArquivo: meta.urlArquivo, obrigacoes: meta.obrigacoes,
    atribuicaoPronta: meta.atribuicaoPronta || null, termo: meta.termo, consultadoEm: meta.consultadoEm,
    resolucao: `${info.largura}×${info.altura}`,
  };
  const im = adicionarImagem({ buf, info, tipo: "licenciada", nome: meta.titulo, albuns, origem, descricao: "" });
  res.status(201).json({ imagem: im });
}));

/* ---------- integrações e IA ---------- */
api.get("/integracoes", (req, res) => {
  const cfg = lerConfig();
  res.json({ chaves: publico(cfg), fontes: descreverConectores(cfg), ia: statusIA(cfg) });
});
api.put("/integracoes", (req, res) => {
  const cfg = salvarConfig(req.body || {});
  res.json({ chaves: publico(cfg), fontes: descreverConectores(cfg), ia: statusIA(cfg) });
});

/* ---------- aplicar imagem da biblioteca num slide ---------- */
// Só imagens aprovadas entram na arte. O arquivo é copiado para o projeto,
// então trocar ou remover da biblioteca não altera artes já feitas.
api.post("/projetos/:id/aplicar-imagem", (req, res) => {
  lerProjeto(req.params.id);
  const im = obterImagem(req.body?.imagemId);
  if (im.tipo === "inspiracao" || im.status !== "aprovado") {
    throw new ErroUsuario(im.tipo === "inspiracao"
      ? "Esta imagem está marcada como referência de inspiração e não pode entrar na publicação."
      : "Esta imagem ainda não está aprovada para exportação. Confira a licença na Minha Biblioteca e confirme as condições ou registre a autorização.", 422);
  }
  const ext = path.extname(im.arquivo).slice(1);
  const arquivo = `foto-lib-${im.id}.${ext}`;
  const destino = dentroDe(dirFotos(req.params.id), arquivo);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  if (!fs.existsSync(destino)) fs.copyFileSync(arquivoDaImagem(im), destino);
  registrarUso(im.id, req.params.id);
  res.json({
    arquivo, largura: im.largura, altura: im.altura, foco: im.foco, zoom: im.zoom || 1, descricao: im.descricao || im.nome,
    origem: {
      bibliotecaId: im.id, nome: im.nome, tipo: im.tipo, status: im.status,
      credito: im.origem?.atribuicaoPronta || creditoDe(im), fonte: im.origem?.fonte || null,
      urlOriginal: im.origem?.urlOriginal || null, licenca: im.origem?.licenca || null, licencaUrl: im.origem?.licencaUrl || null,
      obrigacoes: im.origem?.obrigacoes || [], autorizacao: im.autorizacao?.descricao || null,
    },
  });
});

/* ---------- relatório de universalidade ---------- */
api.get("/projetos/:id/universalidade", (req, res) => {
  const c = lerProjeto(req.params.id);
  res.json({ slides: relatorioUniversalidade(c, { imagens: lerBiblioteca().imagens }), filtros: FILTROS, criterios: CRITERIOS, ia: statusIA(lerConfig()) });
});

app.use("/api", api);

/* ---------- downloads (bytes reais, com Content-Disposition) ---------- */
function nomeBase(c) {
  const data = /^\d{4}-\d{2}-\d{2}$/.test(c.publicacao || "") ? c.publicacao : new Date().toISOString().slice(0, 10);
  return `PRISMA-Carrossel-${data}`;
}
function disposicao(nome) {
  const ascii = nome.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(nome)}`;
}
// Garante uma exportação atualizada antes de qualquer download.
async function exportacaoAtual(id) {
  if (!exportacaoValida(id)) await exportar(id);
  return { c: lerProjeto(id), dir: dirExportacao(id) };
}
function enviarArquivo(res, arquivo, nome, mime) {
  if (!fs.existsSync(arquivo)) throw new ErroUsuario("Arquivo não encontrado.", 404);
  res.setHeader("Content-Type", mime);
  res.setHeader("Content-Disposition", disposicao(nome));
  res.setHeader("Content-Length", fs.statSync(arquivo).size);
  res.setHeader("Cache-Control", "no-store");
  fs.createReadStream(arquivo).pipe(res);
}
function enviarZip(res, nome, entradas) {
  const zip = new yazl.ZipFile();
  for (const [arquivo, nomeNoZip] of entradas) if (fs.existsSync(arquivo)) zip.addFile(arquivo, nomeNoZip);
  zip.end();
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", disposicao(nome));
  res.setHeader("Cache-Control", "no-store");
  zip.outputStream.pipe(res);
}
const pngs = (c, dir, prefixo = "") => c.slides.map((_, i) => [path.join(dir, `slide-${pad2(i + 1)}.png`), `${prefixo}slide-${pad2(i + 1)}.png`]);

const dl = express.Router();
dl.get("/:id/slide/:n", assincrono(async (req, res) => {
  const { c, dir } = await exportacaoAtual(req.params.id);
  const n = Number(req.params.n);
  if (!Number.isInteger(n) || n < 1 || n > c.slides.length) throw new ErroUsuario("Slide inexistente.", 404);
  enviarArquivo(res, path.join(dir, `slide-${pad2(n)}.png`), `${nomeBase(c)}-slide-${pad2(n)}.png`, "image/png");
}));
dl.get("/:id/pdf", assincrono(async (req, res) => {
  const { c, dir } = await exportacaoAtual(req.params.id);
  enviarArquivo(res, path.join(dir, "carrossel-completo.pdf"), `${nomeBase(c)}.pdf`, "application/pdf");
}));
dl.get("/:id/visao-geral", assincrono(async (req, res) => {
  const { c, dir } = await exportacaoAtual(req.params.id);
  enviarArquivo(res, path.join(dir, "visao-geral.png"), `${nomeBase(c)}-visao-geral.png`, "image/png");
}));
dl.get("/:id/pngs", assincrono(async (req, res) => {
  const { c, dir } = await exportacaoAtual(req.params.id);
  enviarZip(res, `${nomeBase(c)}-PNGs.zip`, pngs(c, dir));
}));
dl.get("/:id/projeto", (req, res) => {
  const c = lerProjeto(req.params.id);
  const corpo = Buffer.from(JSON.stringify(c, null, 2));
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", disposicao(`${nomeBase(c)}-projeto.json`));
  res.setHeader("Content-Length", corpo.length);
  res.end(corpo);
});
dl.get("/:id/zip", assincrono(async (req, res) => {
  const { c, dir } = await exportacaoAtual(req.params.id);
  const fotos = dirFotos(req.params.id);
  const entradas = [
    ...pngs(c, dir),
    [path.join(dir, "carrossel-completo.pdf"), "carrossel-completo.pdf"],
    [path.join(dir, "visao-geral.png"), "visao-geral.png"],
    [path.join(dir, "previa.html"), "previa.html"],
    [path.join(dir, "relatorio-validacao.md"), "relatorio-validacao.md"],
    [path.join(dir, "relatorio-validacao.json"), "relatorio-validacao.json"],
    [path.join(dir, "creditos.txt"), "creditos.txt"],
    [path.join(dirProjeto(req.params.id), "carrossel.json"), "projeto/carrossel.json"],
    ...(fs.existsSync(fotos) ? fs.readdirSync(fotos).map((f) => [path.join(fotos, f), `projeto/fotos/${f}`]) : []),
  ];
  enviarZip(res, `${nomeBase(c)}.zip`, entradas);
}));
dl.get("/:id/destino/:destino", assincrono(async (req, res) => {
  const d = DESTINOS.find((x) => x.id === req.params.destino);
  if (!d) throw new ErroUsuario("Destino desconhecido.", 404);
  const { c, dir } = await exportacaoAtual(req.params.id);
  const base = `${nomeBase(c)}-${d.nome.split(" ")[0]}`;
  if (d.entrega === "pdf") return enviarArquivo(res, path.join(dir, "carrossel-completo.pdf"), `${base}.pdf`, "application/pdf");
  enviarZip(res, `${base}.zip`, pngs(c, dir));
}));
dl.get("/:id/universalidade", (req, res) => {
  const c = lerProjeto(req.params.id);
  const corpo = Buffer.from(markdownUniversalidade(c, relatorioUniversalidade(c, { imagens: lerBiblioteca().imagens })));
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Content-Disposition", disposicao(`${nomeBase(c)}-universalidade.md`));
  res.end(corpo);
});
app.use("/download", dl);

function markdownUniversalidade(c, rel) {
  const L = [`# Universalidade visual — ${c.titulo}`, "", "Gerado pelo PRISMA Studio com o repertório curado e regras locais (sem IA). Pontuações são estimativas editoriais de 0 a 100, não previsões de alcance; familiaridade é hipótese, sem dados de audiência.", ""];
  for (const s of rel) {
    L.push(`## Slide ${s.slide} · ${s.titulo}`, "", `- **Função:** ${s.funcao}`, `- **Conceito central:** ${s.conceitoCentral}`, `- **Reação pretendida:** ${s.emocao}`, `- **Layout recomendado:** ${s.layout}`, `- **Apenas tipografia:** ${s.tipografia.pontuacao}/100. ${s.tipografia.justificativa}`, "");
    for (const r of s.referencias) {
      L.push(`### ${r.pontuacao.total}/100 · ${r.nome}${r.ficha ? ` (${r.ficha})` : ""}`, `${r.rotuloTipo}. ${r.conexao}`, "",
        `Familiaridade estimada: ${r.familiaridade} (hipótese) · força metafórica ${r.metafora}/3 · risco de distração ${r.distracao} · imagem: ${r.statusImagem.rotulo}.`);
      if (r.imagem?.nota) L.push(`Imagem: ${r.imagem.nota}`);
      if (r.verificar) L.push(`⚠ Verificar: ${r.verificar}`);
      L.push("");
    }
    if (s.fotosSugeridas.length) L.push("**Da sua biblioteca:** " + s.fotosSugeridas.map((f) => `${f.imagem.nome} (${f.motivos.join("; ")})`).join(" · "), "");
  }
  L.push("## Critérios da pontuação", "", ...CRITERIOS.map((x) => `- ${x}`), "");
  return L.join("\n");
}

/* ---------- interface ---------- */
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: "index.html" }));
} else {
  app.get("/", (req, res) => res.status(500).send("Interface não encontrada (studio/dist). Rode: npm run build:studio"));
}

/* ---------- erros: mensagem clara, sem perder nada ---------- */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || (err.type === "entity.too.large" ? 413 : 500);
  const mensagem = err.type === "entity.too.large" ? "Arquivo grande demais (máximo 20 MB)." : err.message || "Erro inesperado.";
  if (status >= 500) console.error("✘", err);
  if (res.headersSent) return res.end();
  res.status(status).json({ erro: mensagem, ...(err.extra || {}) });
});

/* ---------- inicialização ---------- */
function portaLivre(porta) {
  return new Promise((ok) => {
    const s = net.createServer().once("error", () => ok(false)).once("listening", () => s.close(() => ok(true)));
    s.listen(porta, HOST);
  });
}
async function prismaJaRodando(porta) {
  try {
    const r = await fetch(`http://${HOST}:${porta}/api/saude`, { signal: AbortSignal.timeout(1500) });
    return (await r.json()).app === "prisma-studio";
  } catch { return false; }
}
function abrirNavegadorDoUsuario(url) {
  if (process.env.PRISMA_ABRIR !== "1") return;
  const [cmd, args] = process.platform === "win32" ? ["cmd", ["/c", "start", "", url]]
    : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  spawn(cmd, args, { detached: true, stdio: "ignore" }).on("error", () => {}).unref();
}

// Sobras de exportações interrompidas (queda de energia, janela fechada…).
function limparTemporarios() {
  for (const c of listarProjetos()) {
    const dir = dirProjeto(c.id);
    for (const d of fs.readdirSync(dir)) {
      if (/^exportacao\.(tmp|antiga)-\d+$/.test(d)) fs.rmSync(path.join(dir, d), { recursive: true, force: true });
    }
  }
}

async function iniciar() {
  garantirPastas();
  limparTemporarios();
  const importados = importarCarrosseisDoMotor();
  if (importados.length) console.log(`Importados do motor: ${importados.join(", ")}`);

  let porta = PORTA_INICIAL;
  for (; porta < PORTA_INICIAL + 10; porta++) {
    if (await portaLivre(porta)) break;
    if (await prismaJaRodando(porta)) {
      const url = `http://${HOST}:${porta}/`;
      console.log(`O PRISMA Studio já está aberto em ${url}`);
      abrirNavegadorDoUsuario(url);
      return;
    }
    console.log(`Porta ${porta} ocupada por outro programa; tentando a próxima…`);
  }
  if (porta >= PORTA_INICIAL + 10) {
    console.error(`✘ Nenhuma porta livre entre ${PORTA_INICIAL} e ${PORTA_INICIAL + 9}. Feche outros programas ou defina PRISMA_PORTA.`);
    process.exit(1);
  }
  portaAtual = porta;
  const servidor = app.listen(porta, HOST, () => {
    const url = `http://${HOST}:${porta}/`;
    console.log(`\n  PRISMA Studio rodando em ${url}`);
    console.log(`  Dados em: ${DADOS}`);
    console.log("  Para encerrar, feche esta janela ou pressione Ctrl+C.\n");
    abrirNavegadorDoUsuario(url);
    // Gera em segundo plano as exportações que ainda não existem.
    for (const c of listarProjetos()) {
      if (!exportacaoValida(c.id)) exportar(c.id).catch((e) => console.error(`Exportação inicial de ${c.id} falhou: ${e.message}`));
    }
  });
  const encerrar = async () => { servidor.close(); await fecharNavegador(); process.exit(0); };
  process.on("SIGINT", encerrar);
  process.on("SIGTERM", encerrar);
}

iniciar().catch((e) => { console.error("✘ Falha ao iniciar:", e.message); process.exit(1); });
