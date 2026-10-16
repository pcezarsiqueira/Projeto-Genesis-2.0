// Exportação a partir do servidor: reaproveita exportarCarrossel() do motor,
// mantém um único Chromium aberto e executa uma exportação por vez.
// A nova exportação é gerada numa pasta temporária e só substitui a anterior
// quando termina, para que uma falha nunca apague arquivos bons.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { exportarCarrossel } from "../src/build.js";
import { lerBiblioteca } from "./biblioteca.js";
import {
  lerProjeto, dirProjeto, dirFotos, dirExportacao, hashConteudo,
  estadoExportacao, gravarEstadoExportacao,
} from "./persistencia.js";

let navegador = null;
let origemNavegador = null;

// Ordem: Chromium do Playwright → Microsoft Edge → Google Chrome.
// No Windows, o Edge já vem instalado, então o download do Chromium é opcional.
async function abrirNavegador() {
  if (navegador?.isConnected()) return navegador;
  const tentativas = [
    ["Chromium do Playwright", {}],
    ["Microsoft Edge", { channel: "msedge" }],
    ["Google Chrome", { channel: "chrome" }],
  ];
  const erros = [];
  for (const [nome, opcoes] of tentativas) {
    try {
      navegador = await chromium.launch(opcoes);
      origemNavegador = nome;
      return navegador;
    } catch (e) {
      erros.push(`${nome}: ${String(e.message).split("\n")[0]}`);
    }
  }
  const err = new Error("Nenhum navegador disponível para renderizar. Rode instalar-prisma.bat ou instale o Microsoft Edge/Google Chrome.\n" + erros.join("\n"));
  err.status = 503;
  throw err;
}
export const navegadorEmUso = () => origemNavegador;

// No Windows, renomear uma pasta com arquivo aberto (ex.: download em curso)
// falha com EPERM/EBUSY por alguns instantes: tenta de novo antes de desistir.
async function renomear(de, para) {
  for (let i = 0; ; i++) {
    try { fs.renameSync(de, para); return; } catch (e) {
      if (i >= 20 || !["EPERM", "EBUSY", "EACCES"].includes(e.code)) throw e;
      await new Promise((r) => setTimeout(r, 250));
    }
  }
}

let fila = Promise.resolve();
const emAndamento = new Map();

// Direitos de uso e créditos das fotos de cada slide. O estado atual na
// biblioteca prevalece sobre o registrado no slide (a aprovação pode ter
// sido revogada depois).
export function direitosECreditos(c) {
  const imagens = new Map(lerBiblioteca().imagens.map((im) => [im.id, im]));
  const erros = [], creditos = [];
  c.slides.forEach((s, i) => {
    const o = s.foto?.arquivo ? s.foto.origem : null;
    if (!o) return;
    const atual = o.bibliotecaId ? imagens.get(o.bibliotecaId) : null;
    const status = atual?.status || o.status;
    const tipo = atual?.tipo || o.tipo;
    if (tipo === "inspiracao" || status !== "aprovado") {
      erros.push(`Slide ${i + 1}: a imagem “${atual?.nome || o.nome || s.foto.arquivo}” não está aprovada para exportação (${status === "referencia" ? "referência cultural" : "uso condicionado"}).`);
    }
    if (o.credito) creditos.push({ slide: i + 1, credito: o.credito, url: o.urlOriginal || null, licencaUrl: o.licencaUrl || null, obrigacoes: o.obrigacoes || [] });
  });
  return { erros, creditos };
}

function textoCreditos(c, creditos) {
  if (!creditos.length) return "Nenhuma imagem deste carrossel exige crédito.\n";
  return [`Créditos de imagens — ${c.titulo}`, "", "Texto pronto para a legenda:", ...creditos.map((x) => `Slide ${x.slide}: ${x.credito}`), "",
    "Detalhes:", ...creditos.map((x) => [`Slide ${x.slide}: ${x.credito}`, x.url ? `  Original: ${x.url}` : null, x.licencaUrl ? `  Licença: ${x.licencaUrl}` : null, ...x.obrigacoes.map((o) => `  - ${o}`)].filter(Boolean).join("\n")), ""].join("\n");
}

const MANTER_ANTERIORES = 5;

export function exportacaoValida(id) {
  const c = lerProjeto(id);
  const estado = estadoExportacao(id);
  const dir = dirExportacao(id);
  const arquivosOk = estado && fs.existsSync(path.join(dir, "carrossel-completo.pdf"))
    && c.slides.every((_, i) => fs.existsSync(path.join(dir, `slide-${String(i + 1).padStart(2, "0")}.png`)));
  // aprovar ou revogar uma imagem na biblioteca também exige nova exportação
  const direitos = JSON.stringify(direitosECreditos(c));
  return Boolean(arquivosOk && estado.hash === hashConteudo(c) && (estado.direitos ?? direitos) === direitos);
}

export function exportar(id, { forcar = false } = {}) {
  if (emAndamento.has(id)) return emAndamento.get(id);
  const tarefa = (fila = fila.catch(() => {}).then(async () => {
    if (!forcar && exportacaoValida(id)) return { ...estadoExportacao(id), reutilizada: true };
    const c = lerProjeto(id);
    const hash = hashConteudo(c);
    const base = dirProjeto(id);
    const tmp = path.join(base, `exportacao.tmp-${Date.now()}`);
    fs.mkdirSync(tmp, { recursive: true });
    try {
      const browser = await abrirNavegador();
      const r = await exportarCarrossel({ carrossel: c, dirSaida: tmp, dirFotos: dirFotos(id), browser });
      const direitos = direitosECreditos(c);
      fs.writeFileSync(path.join(tmp, "creditos.txt"), textoCreditos(c, direitos.creditos));
      const estado = {
        hash, quando: new Date().toISOString(), totalErros: r.totalErros + direitos.erros.length, segundos: r.segundos,
        navegador: origemNavegador, slides: c.slides.length,
        resumo: r.inspecao.slides.map((s) => ({ slide: s.slide, erros: s.erros, avisos: s.avisos })),
        errosArquivos: [...r.arquivos.erros, ...direitos.erros],
        creditos: direitos.creditos,
        direitos: JSON.stringify(direitos),
      };
      fs.writeFileSync(path.join(tmp, "estado.json"), JSON.stringify(estado, null, 2));
      // a nova pasta "fonte" referencia ../../ de forma relativa: mesma profundidade, continua válida
      const final = dirExportacao(id);
      const antiga = path.join(base, `exportacao.antiga-${Date.now()}`);
      if (fs.existsSync(final)) await renomear(final, antiga);
      try { await renomear(tmp, final); } catch (e) { if (fs.existsSync(antiga)) await renomear(antiga, final); throw e; }
      // a versão anterior é guardada (não apagada): exportacao-anteriores/<data>
      if (fs.existsSync(antiga)) {
        const arq = path.join(base, "exportacao-anteriores");
        fs.mkdirSync(arq, { recursive: true });
        const anterior = (() => { try { return JSON.parse(fs.readFileSync(path.join(antiga, "estado.json"), "utf8")).quando; } catch { return new Date().toISOString(); } })();
        try { await renomear(antiga, path.join(arq, anterior.replace(/[:.]/g, "-"))); } catch { /* fica para a limpeza */ }
        const versoes = fs.readdirSync(arq).sort();
        for (const v of versoes.slice(0, Math.max(0, versoes.length - MANTER_ANTERIORES))) fs.rmSync(path.join(arq, v), { recursive: true, force: true });
      }
      gravarEstadoExportacao(id, estado);
      return estado;
    } catch (e) {
      fs.rmSync(tmp, { recursive: true, force: true });
      throw e;
    }
  }));
  emAndamento.set(id, tarefa);
  tarefa.finally(() => emAndamento.delete(id)).catch(() => {});
  return tarefa;
}

export const exportando = (id) => emAndamento.has(id);

export async function fecharNavegador() {
  if (navegador) await navegador.close().catch(() => {});
  navegador = null;
}
