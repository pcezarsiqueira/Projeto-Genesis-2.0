// Testes de aceitação de ponta a ponta do PRISMA Studio (Playwright).
//   npm run teste:e2e
// Sobe o servidor numa pasta de dados TEMPORÁRIA (o carrossel aprovado e os
// seus projetos reais não são tocados), usa a interface como uma pessoa
// usaria, baixa os arquivos de verdade e confere os bytes.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORTA = 4399;
const URL = `http://127.0.0.1:${PORTA}`;
const DADOS = fs.mkdtempSync(path.join(os.tmpdir(), "prisma-e2e-"));
const SAIDA = path.join(RAIZ, "testes", "resultados");
fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(path.join(SAIDA, "downloads"), { recursive: true });
const ID = "2026-10-17-manipulacao-opiniao";
const APROVADOS = path.join(RAIZ, "saida", ID);

/* ---------- utilidades ---------- */
const resultados = [];
async function teste(nome, fn) {
  const t0 = Date.now();
  try {
    const detalhe = await fn();
    resultados.push({ nome, ok: true, detalhe: detalhe || "", ms: Date.now() - t0 });
    console.log(`  ✔ ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  } catch (e) {
    resultados.push({ nome, ok: false, detalhe: e.message, ms: Date.now() - t0 });
    console.log(`  ✘ ${nome} — ${e.message}`);
    if (pagina) await pagina.screenshot({ path: path.join(SAIDA, `falha-${resultados.length}.png`) }).catch(() => {});
  }
}
function afirmar(cond, msg) { if (!cond) throw new Error(msg); }
const dimPng = (buf) => {
  afirmar(buf.subarray(0, 8).toString("hex") === "89504e470d0a1a0a", "não é PNG");
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
};
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");

// Leitor mínimo de ZIP (diretório central + inflate), sem dependências.
function lerZip(buf) {
  let fim = buf.length - 22;
  while (fim >= 0 && buf.readUInt32LE(fim) !== 0x06054b50) fim--;
  afirmar(fim >= 0, "ZIP sem diretório central");
  const total = buf.readUInt16LE(fim + 10);
  let p = buf.readUInt32LE(fim + 16);
  const arquivos = {};
  for (let i = 0; i < total; i++) {
    afirmar(buf.readUInt32LE(p) === 0x02014b50, "entrada de ZIP inválida");
    const metodo = buf.readUInt16LE(p + 10), comp = buf.readUInt32LE(p + 20);
    const nl = buf.readUInt16LE(p + 28), el = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const nome = buf.toString("utf8", p + 46, p + 46 + nl);
    const ini = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const bruto = buf.subarray(ini, ini + comp);
    arquivos[nome] = metodo === 8 ? zlib.inflateRawSync(bruto) : Buffer.from(bruto);
    p += 46 + nl + el + cl;
  }
  return arquivos;
}
async function textoPdf(buf) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), disableFontFace: true, verbosity: 0 }).promise;
  const paginas = [];
  for (let i = 1; i <= doc.numPages; i++) paginas.push((await (await doc.getPage(i)).getTextContent()).items.map((x) => x.str).join(" "));
  return paginas;
}

let servidor = null;
async function subirServidor() {
  servidor = spawn(process.execPath, [path.join(RAIZ, "servidor/index.js")], {
    env: { ...process.env, PRISMA_DADOS: DADOS, PRISMA_PORTA: String(PORTA), PRISMA_ABRIR: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  servidor.stdout.on("data", (d) => fs.appendFileSync(path.join(SAIDA, "servidor.log"), d));
  servidor.stderr.on("data", (d) => fs.appendFileSync(path.join(SAIDA, "servidor.log"), d));
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`${URL}/api/saude`)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("servidor não subiu");
}
async function derrubarServidor() {
  if (!servidor) return;
  servidor.kill("SIGTERM");
  await new Promise((r) => servidor.once("exit", r));
  servidor = null;
}

let navegador, contexto, pagina;
async function novaPagina() {
  contexto = await navegador.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } });
  pagina = await contexto.newPage();
  pagina.on("pageerror", (e) => fs.appendFileSync(path.join(SAIDA, "console.log"), `pageerror: ${e.message}\n`));
}
async function baixarPorBotao(rotulo) {
  const [dl] = await Promise.all([
    pagina.waitForEvent("download", { timeout: 60000 }),
    pagina.click(`[data-download="${rotulo}"]`),
  ]);
  const destino = path.join(SAIDA, "downloads", dl.suggestedFilename());
  await dl.saveAs(destino);
  return { nome: dl.suggestedFilename(), buf: fs.readFileSync(destino) };
}
async function esperarSalvo() {
  await pagina.waitForSelector('[data-estado="salvo"]', { timeout: 15000 });
}
async function abrirEditor(id) {
  await pagina.goto(`${URL}/#/editor/${id}`);
  await pagina.waitForSelector("[data-diag]", { timeout: 20000 });
}
async function selecionarSlide(n) {
  await pagina.click(`li[data-slide="${n}"] .miniatura-botao`);
  await pagina.waitForTimeout(300);
  await pagina.waitForSelector("[data-diag]", { timeout: 15000 });
}
async function textoDaPrevia() {
  const f = pagina.frameLocator(".palco-slide iframe");
  return (await f.locator(".slide").innerText()).replace(/\s+/g, " ");
}

/* ---------- testes ---------- */
const NOVO_TITULO = "TUDO FOI FEITO PARA PROVOCAR SUA *RAIVA.* (EDITADO)";
let idCopia = "";

console.log(`PRISMA Studio — testes E2E (dados temporários em ${DADOS})\n`);
navegador = await chromium.launch();
await subirServidor();
await novaPagina();

await teste("1. Abrir a biblioteca e ver o carrossel de 17/10", async () => {
  await pagina.goto(URL);
  const cartao = pagina.locator(`[data-projeto="${ID}"]`);
  await cartao.waitFor({ timeout: 15000 });
  const txt = await cartao.innerText();
  afirmar(txt.includes("5 sinais de que estão manipulando sua opinião"), "título não aparece");
  afirmar(txt.includes("17/10/2026") && txt.includes("9 slides"), "data ou quantidade de slides ausente");
  await pagina.waitForTimeout(1200);
  await pagina.screenshot({ path: path.join(SAIDA, "01-biblioteca.png") });
  return "cartão com capa, data 17/10/2026 e 9 slides";
});

await teste("2. Selecionar e editar um slide", async () => {
  await pagina.click(`[data-projeto="${ID}"] >> text=Editar`);
  await pagina.waitForSelector("[data-diag]", { timeout: 20000 });
  afirmar(await pagina.locator("li.miniatura").count() === 9, "lista não tem 9 slides");
  await selecionarSlide(3);
  const valor = await pagina.inputValue("#s2-titulo");
  afirmar(valor === "TUDO FOI FEITO PARA PROVOCAR SUA *RAIVA.*", `campo de título inesperado: ${valor}`);
  const prev = await textoDaPrevia();
  afirmar(prev.includes("TUDO FOI FEITO PARA PROVOCAR SUA RAIVA."), "prévia não mostra o slide 3");
  return "slide 3 aberto no painel e na prévia";
});

await teste("3. Alterar um título e salvar", async () => {
  await pagina.fill("#s2-titulo", NOVO_TITULO);
  await pagina.waitForSelector('[data-estado="pendente"], [data-estado="salvando"]', { timeout: 5000 });
  await esperarSalvo();
  const r = await (await fetch(`${URL}/api/projetos/${ID}`)).json();
  afirmar(r.dados.slides[2].titulo === NOVO_TITULO, "servidor não gravou o novo título");
  const arq = JSON.parse(fs.readFileSync(path.join(DADOS, "projetos", ID, "carrossel.json"), "utf8"));
  afirmar(arq.slides[2].titulo === NOVO_TITULO, "arquivo em disco sem o novo título");
  afirmar(fs.readdirSync(path.join(DADOS, "projetos", ID, "historico")).length >= 1, "versão anterior não foi guardada no histórico");
  return "indicador passou por 'Alterações não salvas' → 'Salvo'; JSON em disco atualizado; versão anterior no histórico";
});

await teste("4. Prévia atualizada", async () => {
  const prev = await textoDaPrevia();
  afirmar(prev.includes("(EDITADO)"), "prévia não reflete a alteração");
  const diag = await pagina.getAttribute("[data-diag]", "data-diag");
  afirmar(diag === "ok", "diagnóstico de layout não está ok");
  const mini = await pagina.frameLocator('li[data-slide="3"] iframe').locator(".slide").innerText();
  afirmar(mini.includes("(EDITADO)"), "miniatura não atualizou");
  await pagina.screenshot({ path: path.join(SAIDA, "04-editor-titulo-editado.png") });
  return "prévia central e miniatura mostram o texto novo; layout validado";
});

await teste("5. Renderizar novamente", async () => {
  await pagina.click('[role="tab"]:has-text("Exportar")');
  await pagina.click("text=Renderizar novamente agora");
  await pagina.waitForSelector('[data-estado="ok"], [data-estado="alerta"]', { timeout: 60000 });
  const est = await pagina.getAttribute(".estado-exportacao", "data-estado");
  afirmar(est === "ok", `exportação com estado ${est}`);
  await pagina.screenshot({ path: path.join(SAIDA, "05-exportar.png") });
  return "exportação concluída e validada (0 erros)";
});

await teste("6. Baixar um PNG e conferir dimensão e conteúdo", async () => {
  const { nome, buf } = await baixarPorBotao("Slide 3 (PNG)");
  const [w, h] = dimPng(buf);
  afirmar(w === 1080 && h === 1350, `dimensão ${w}×${h}`);
  afirmar(nome === "PRISMA-Carrossel-2026-10-17-slide-03.png", `nome ${nome}`);
  const aprovado3 = fs.readFileSync(path.join(APROVADOS, "slide-03.png"));
  afirmar(sha(buf) !== sha(aprovado3), "slide 3 baixado é igual ao antigo (edição não entrou)");
  // slide 1 não foi editado: deve sair idêntico, byte a byte, ao aprovado
  await selecionarSlide(1);
  await pagina.click('[role="tab"]:has-text("Exportar")');
  const s1 = await baixarPorBotao("Slide 1 (PNG)");
  afirmar(sha(s1.buf) === sha(fs.readFileSync(path.join(APROVADOS, "slide-01.png"))), "slide 1 difere do aprovado");
  return `${nome}: 1080×1350, conteúdo novo; slide 1 idêntico byte a byte ao aprovado`;
});

await teste("7. Baixar o PDF e verificar páginas", async () => {
  const { nome, buf } = await baixarPorBotao("PDF completo");
  const paginas = await textoPdf(buf);
  afirmar(paginas.length === 9, `${paginas.length} páginas`);
  afirmar(paginas[2].includes("EDITADO"), "página 3 sem o título editado");
  afirmar(paginas[0].replace(/\s+/g, "").includes("MANIPULANDO"), "página 1 fora de ordem");
  return `${nome}: 9 páginas, ordem correta, página 3 com o título novo`;
});

await teste("8. Baixar o ZIP, descompactar e verificar", async () => {
  const { nome, buf } = await baixarPorBotao("Baixar tudo (ZIP)");
  afirmar(nome === "PRISMA-Carrossel-2026-10-17.zip", `nome ${nome}`);
  const z = lerZip(buf);
  const esperado = [...Array.from({ length: 9 }, (_, i) => `slide-0${i + 1}.png`), "carrossel-completo.pdf", "visao-geral.png", "relatorio-validacao.md", "projeto/carrossel.json"];
  for (const e of esperado) afirmar(z[e], `ZIP sem ${e}`);
  for (let i = 1; i <= 9; i++) { const [w, h] = dimPng(z[`slide-0${i}.png`]); afirmar(w === 1080 && h === 1350, `slide ${i} ${w}×${h}`); }
  afirmar(JSON.parse(z["projeto/carrossel.json"]).slides[2].titulo === NOVO_TITULO, "dados do projeto no ZIP desatualizados");
  afirmar((await textoPdf(z["carrossel-completo.pdf"])).length === 9, "PDF do ZIP sem 9 páginas");
  afirmar(z["relatorio-validacao.md"].toString().includes("APROVADO"), "relatório não aprovado");
  const dir = path.join(SAIDA, "zip-descompactado");
  for (const [n, b] of Object.entries(z)) { fs.mkdirSync(path.dirname(path.join(dir, n)), { recursive: true }); fs.writeFileSync(path.join(dir, n), b); }
  return `${Object.keys(z).length} arquivos: 9 PNGs 1080×1350, PDF 9 págs, visão geral, relatório APROVADO, projeto com título editado`;
});

await teste("9. Fechar e reabrir: projeto continua salvo", async () => {
  await contexto.close();
  await derrubarServidor();
  await subirServidor();
  await novaPagina();
  await abrirEditor(ID);
  await selecionarSlide(3);
  afirmar(await pagina.inputValue("#s2-titulo") === NOVO_TITULO, "título editado se perdeu");
  afirmar((await textoDaPrevia()).includes("(EDITADO)"), "prévia sem a edição após reabrir");
  return "servidor reiniciado; edição preservada";
});

await teste("10. Criar um segundo carrossel duplicando o primeiro", async () => {
  await pagina.goto(URL);
  await pagina.locator(`[data-projeto="${ID}"] >> text=Duplicar`).click();
  await pagina.waitForFunction(() => document.querySelectorAll(".cartao-projeto").length === 2, null, { timeout: 10000 });
  const lista = await (await fetch(`${URL}/api/projetos`)).json();
  const copia = lista.find((x) => x.id !== ID);
  afirmar(copia && copia.slides === 9 && copia.titulo.endsWith("(cópia)"), "cópia inválida");
  idCopia = copia.id;
  const orig = lista.find((x) => x.id === ID);
  afirmar(orig.dados.slides[2].titulo === NOVO_TITULO, "original foi alterado");
  return `cópia "${copia.titulo}" (${copia.id}) com 9 slides; original intacto`;
});

await teste("11. Fotografia não facial: upload, layout e exportação", async () => {
  // gera uma imagem de teste (paisagem vetorial, sem rostos)
  const img = path.join(SAIDA, "foto-teste-paisagem.png");
  const pg = await navegador.newPage({ viewport: { width: 1600, height: 1200 } });
  await pg.setContent(`<body style="margin:0"><svg width="1600" height="1200"><rect width="1600" height="1200" fill="#8fa3b5"/><circle cx="1150" cy="330" r="150" fill="#f1c75b"/><path d="M0 1200V760l380-300 300 220 340-360 580 520v360z" fill="#4b5a52"/><path d="M0 1200V960l500-130 520 160 580-140v350z" fill="#2c332f"/></svg></body>`);
  await pg.screenshot({ path: img }); await pg.close();

  await abrirEditor(idCopia);
  await selecionarSlide(1);
  await pagina.setInputFiles('[data-testid="enviar-foto"]', img);
  await pagina.waitForSelector(".galeria-item.ativa", { timeout: 10000 });
  await pagina.click('[data-testid="secao-foto"] button:has-text("Foto de fundo")');
  await pagina.waitForTimeout(800);
  await pagina.waitForSelector("[data-diag]");
  const diag = await pagina.getAttribute("[data-diag]", "data-diag");
  await pagina.screenshot({ path: path.join(SAIDA, "11-capa-com-foto.png") });
  afirmar(diag === "ok", "layout com foto não validou: " + (await pagina.innerText("[data-testid=diagnostico]")));
  // encerramento com retrato
  await selecionarSlide(9);
  await pagina.click('[data-testid="secao-foto"] .galeria-item');
  await pagina.waitForTimeout(800);
  await pagina.waitForSelector("[data-diag]");
  const diag9 = await pagina.getAttribute("[data-diag]", "data-diag");
  await pagina.screenshot({ path: path.join(SAIDA, "11-encerramento-com-foto.png") });
  afirmar(diag9 === "ok", "encerramento com foto não validou");
  await esperarSalvo();
  // a foto enviada é guardada sem alteração
  const salvo = JSON.parse(fs.readFileSync(path.join(DADOS, "projetos", idCopia, "carrossel.json"), "utf8"));
  const arqFoto = path.join(DADOS, "projetos", idCopia, "fotos", salvo.slides[0].foto.arquivo);
  afirmar(sha(fs.readFileSync(arqFoto)) === sha(fs.readFileSync(img)), "foto armazenada difere do original");
  await pagina.click('[role="tab"]:has-text("Exportar")');
  const { buf } = await baixarPorBotao("Slide 9 (PNG)");
  const [w, h] = dimPng(buf);
  afirmar(w === 1080 && h === 1350, "PNG com foto em dimensão errada");
  fs.writeFileSync(path.join(SAIDA, "11-slide-09-exportado.png"), buf);
  const est = await pagina.getAttribute(".estado-exportacao", "data-estado");
  afirmar(est === "ok", `exportação com foto: ${est}`);
  return "foto de fundo na capa e retrato no encerramento validados; arquivo guardado idêntico ao original; export 1080×1350 sem erros";
});

await teste("12. Texto longo demais: avisos e proteção contra corte", async () => {
  await selecionarSlide(2);
  await pagina.click('[role="tab"]:has-text("Slide")');
  const longo = "VOCÊ TEM CERTEZA DE QUE CHEGOU SOZINHO A ESSA OPINIÃO OU SERÁ QUE ALGUÉM ESCOLHEU CADA PALAVRA QUE VOCÊ LEU HOJE, CADA IMAGEM, CADA VÍDEO E CADA COMENTÁRIO QUE APARECEU PRIMEIRO NA SUA TELA ANTES MESMO DE VOCÊ PERCEBER QUE ESTAVA SENDO CONDUZIDO?";
  await pagina.fill("#s1-titulo", longo);
  await pagina.waitForSelector(".contador--excedeu", { timeout: 5000 });
  await pagina.waitForSelector('[data-diag="erro"]', { timeout: 10000 });
  const msg = await pagina.innerText("[data-testid=diagnostico]");
  afirmar(/não cabe|margem de segurança|cortado|saindo/.test(msg), `mensagem inesperada: ${msg}`);
  await pagina.screenshot({ path: path.join(SAIDA, "12-texto-longo.png") });
  // a exportação também acusa o problema
  await esperarSalvo();
  const r = await (await fetch(`${URL}/api/projetos/${idCopia}/exportar`, { method: "POST" })).json();
  afirmar(r.estado.totalErros > 0 && r.estado.resumo[1].erros.length > 0, "exportação não acusou o texto longo");
  // desfazer restaura o texto anterior
  await pagina.click("body");
  await pagina.keyboard.press("Control+z");
  await pagina.waitForSelector('[data-diag="ok"]', { timeout: 10000 });
  afirmar(!(await pagina.inputValue("#s1-titulo")).includes("CONDUZIDO"), "desfazer não restaurou");
  return `contador vermelho + aviso "${msg.split(".")[0].trim()}" na prévia; exportação marcou ${r.estado.totalErros} erro(s); Ctrl+Z restaurou`;
});

/* ---------- extras: criação por texto e JSON, segurança ---------- */
await teste("Extra A. Criar carrossel a partir de texto colado", async () => {
  await pagina.goto(URL);
  await pagina.click("text=+ Criar carrossel");
  await pagina.click('[role="tab"]:has-text("Colar texto")');
  await pagina.fill(".area-grande", "SLIDE 1\n3 HÁBITOS QUE ATRAPALHAM SUA *CONCENTRAÇÃO*\n\nSLIDE 2\n1. Deixar o celular na mesa.\nCada notificação puxa sua atenção de volta.\n\nSLIDE 3\nAntes de começar, pergunte:\nO celular está longe?\nA tarefa está clara?\n\nSLIDE 4\nQual desses é o seu?\nComente aqui.");
  await pagina.click("text=Identificar slides →");
  await pagina.waitForSelector(".bloco-revisao");
  afirmar(await pagina.locator(".bloco-revisao").count() === 4, "não identificou 4 blocos");
  const modelos = await pagina.locator(".bloco-revisao select").evaluateAll((els) => els.map((e) => e.value));
  afirmar(JSON.stringify(modelos) === JSON.stringify(["capa-impacto", "lista-numerada", "checklist", "encerramento"]), `modelos sugeridos: ${modelos}`);
  await pagina.click(".modal-acoes >> text=Criar carrossel");
  await pagina.waitForSelector("[data-diag]", { timeout: 20000 });
  afirmar(await pagina.locator("li.miniatura").count() === 4, "editor não abriu com 4 slides");
  await pagina.screenshot({ path: path.join(SAIDA, "extra-a-texto-colado.png") });
  return `4 blocos → ${modelos.join(", ")}`;
});

await teste("Extra B. Importar JSON", async () => {
  const arq = path.join(SAIDA, "importar.json");
  const base = JSON.parse(fs.readFileSync(path.join(RAIZ, "carrosseis", ID, "carrossel.json"), "utf8"));
  fs.writeFileSync(arq, JSON.stringify({ ...base, titulo: "Importado por JSON" }));
  await pagina.goto(URL);
  await pagina.click("text=+ Criar carrossel");
  await pagina.click('[role="tab"]:has-text("Importar JSON")');
  await pagina.setInputFiles('.modal input[type="file"]', arq);
  await pagina.waitForSelector(".dica--ok");
  await pagina.click(".modal-acoes >> text=Criar carrossel");
  await pagina.waitForSelector("[data-diag]", { timeout: 20000 });
  const lista = await (await fetch(`${URL}/api/projetos`)).json();
  afirmar(lista.some((x) => x.titulo === "Importado por JSON"), "projeto importado não existe");
  afirmar(lista.find((x) => x.id === ID).dados.slides[2].titulo === NOVO_TITULO, "importação sobrescreveu o original");
  return "criado como projeto novo, sem sobrescrever";
});

await teste("Extra C. Segurança: host, path traversal e uploads", async () => {
  // fetch ignora o cabeçalho Host; http.request envia exatamente o que pedimos
  const { request } = await import("node:http");
  const status = await new Promise((ok, falha) => request({ host: "127.0.0.1", port: PORTA, path: "/api/saude", headers: { Host: "exemplo.com" } }, (r) => { r.resume(); ok(r.statusCode); }).on("error", falha).end());
  afirmar(status === 403, `host estranho aceito (${status})`);
  for (const rota of [`/download/..%2F..%2Fetc/pdf`, `/api/projetos/${ID}/fotos/..%2F..%2Fcarrossel.json`, `/api/projetos/${ID}/fotos/..%2F..%2F..%2F..%2Fpackage.json`, `/download/${ID}/slide/0`, `/download/${ID}/destino/..%2F`]) {
    const r = await fetch(URL + rota);
    afirmar([400, 403, 404].includes(r.status), `${rota} respondeu ${r.status}`);
  }
  const up = await fetch(`${URL}/api/projetos/${ID}/fotos`, { method: "POST", headers: { "Content-Type": "image/png" }, body: Buffer.from("<script>alert(1)</script>".padEnd(64, " ")) });
  afirmar(up.status === 415, `upload falso aceito (${up.status})`);
  const del = await fetch(`${URL}/api/projetos/${ID}`, { method: "DELETE" });
  afirmar(del.status === 400, "exclusão sem confirmação foi aceita");
  const ouvindo = fs.readFileSync(path.join(RAIZ, "servidor/index.js"), "utf8").includes('const HOST = "127.0.0.1"');
  afirmar(ouvindo, "servidor não está restrito a 127.0.0.1");
  return "host externo 403; traversal 400/403/404; upload não-imagem 415; exclusão exige confirmação";
});

await teste("Extra D. Excluir com confirmação (vai para a lixeira)", async () => {
  await pagina.goto(URL);
  await pagina.waitForSelector(".cartao-projeto");
  const antes = await pagina.locator(".cartao-projeto").count();
  const cartao = pagina.locator(".cartao-projeto", { hasText: "Importado por JSON" });
  await cartao.locator("text=Excluir").click();
  await pagina.waitForSelector('[role="alertdialog"]');
  await pagina.click('[role="alertdialog"] >> text=Cancelar');
  afirmar(await pagina.locator(".cartao-projeto").count() === antes, "cancelar excluiu");
  await cartao.locator("text=Excluir").click();
  await pagina.click('[role="alertdialog"] >> button:has-text("Excluir")');
  await pagina.waitForFunction((n) => document.querySelectorAll(".cartao-projeto").length === n - 1, antes, { timeout: 10000 });
  afirmar(fs.readdirSync(path.join(DADOS, "lixeira")).length === 1, "não foi para a lixeira");
  return "cancelar preserva; confirmar move para dados/lixeira";
});

await teste("Extra E. Downloads por destino (Instagram, TikTok, LinkedIn, Substack)", async () => {
  await abrirEditor(ID);
  await pagina.click('[role="tab"]:has-text("Exportar")');
  const out = [];
  for (const d of ["Instagram", "TikTok · modo foto", "LinkedIn", "Substack"]) {
    const { nome, buf } = await baixarPorBotao(`Baixar para ${d}`);
    if (nome.endsWith(".zip")) { const z = lerZip(buf); afirmar(Object.keys(z).length === 9, `${d}: ${Object.keys(z).length} arquivos`); }
    else afirmar((await textoPdf(buf)).length === 9, `${d}: PDF sem 9 páginas`);
    out.push(nome);
  }
  return out.join(", ");
});

await contexto.close();
await navegador.close();
await derrubarServidor();
fs.rmSync(DADOS, { recursive: true, force: true });

const ok = resultados.filter((r) => r.ok).length;
const md = [
  "# Relatório de testes E2E — PRISMA Studio", "",
  `Executado em ${new Date().toISOString()} · ${ok}/${resultados.length} aprovados`, "",
  "Ambiente: servidor real em 127.0.0.1, Chromium via Playwright, dados temporários (o projeto real não foi tocado).", "",
  "| Teste | Resultado | Detalhe | Tempo |", "|---|---|---|---|",
  ...resultados.map((r) => `| ${r.nome} | ${r.ok ? "✔ passou" : "✘ falhou"} | ${r.detalhe.replace(/\|/g, "/")} | ${(r.ms / 1000).toFixed(1)} s |`), "",
];
fs.writeFileSync(path.join(SAIDA, "relatorio-testes.md"), md.join("\n"));
console.log(`\n${ok}/${resultados.length} testes aprovados. Relatório: testes/resultados/relatorio-testes.md`);
process.exitCode = ok === resultados.length ? 0 : 1;
