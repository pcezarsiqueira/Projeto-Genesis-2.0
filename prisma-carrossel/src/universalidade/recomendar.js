// Recomendador de universalidade visual — regras locais, sem IA.
// Lê o texto do slide, identifica conceitos por palavras-chave, considera a
// função narrativa do slide e cruza com o repertório curado e com a sua
// biblioteca de imagens. Toda pontuação é uma ESTIMATIVA EDITORIAL.
import { REPERTORIO } from "./repertorio.js";

/* ---------- conceitos e palavras-chave (radicais, sem acento) ---------- */
export const CONCEITOS = {
  manipulacao: { nome: "manipulação", chaves: ["manipul", "engan", "conduz", "influenci", "titere"] },
  curadoria: { nome: "curadoria do que se vê", chaves: ["escolheu o que", "veria primeiro", "algoritm", "feed", "bolha", "o que chega"] },
  autonomia: { nome: "pensar por conta própria", chaves: ["sozinh", "certeza", "por conta propria", "sua opiniao", "chegou"] },
  raiva: { nome: "indignação", chaves: ["raiva", "indign", "odio", "revolt", "irrit", "absurd"] },
  compartilhamento: { nome: "compartilhar sem conferir", chaves: ["compartilh", "encaminh", "repass", "viraliz", "circul"] },
  confirmacao: { nome: "viés de confirmação", chaves: ["confirma", "ja acreditava", "vies", "crenca"] },
  "prova-social": { nome: "prova social", chaves: ["todo mundo", "concord", "popular", "maioria", "curtid", "avaliac"] },
  polarizacao: { nome: "pressão de grupo e polarização", chaves: ["discord", "inimig", "pressao de grupo", "grupo", "lado", "tribo"] },
  "imagem-falsa": { nome: "imagem fabricada", chaves: ["imagem", "foto", "video", " ia,", " ia ", "deepfake", "montag", "nunca aconteceu", "aparencia de prova"] },
  contexto: { nome: "contexto distorcido", chaves: ["contexto", "corte", "recort", "o que falta"] },
  checagem: { nome: "checagem de fonte", chaves: ["confer", "checag", "verific", "fonte", "quem publicou", "original", "antes de acreditar", "pergunt"] },
  "noticia-falsa": { nome: "notícia falsa", chaves: ["noticia", "falsa", "fake", "boato", "suspeit", "invencao"] },
  salvar: { nome: "guardar para depois", chaves: ["salve", "salvar", "guard", "consultar depois"] },
  conversa: { nome: "conversa e identificação", chaves: ["coment", "experiencia", "conte pra", "conta pra gente", "ja compartilhou", "ja passou"] },
  aprendizagem: { nome: "aprendizagem", chaves: ["aprend", "estud", "pratic", "trein"] },
  memoria: { nome: "memória", chaves: ["memori", "esquec", "lembr", "revis"] },
  ensino: { nome: "ensino", chaves: ["ensin", "aula", "professor", "aluno", "explic"] },
  comunicacao: { nome: "comunicação", chaves: ["comunic", "falar", "ouvir", "apresent", "clareza", "mensagem"] },
  atencao: { nome: "atenção", chaves: ["atencao", "distra", "foco", "notificac", "celular"] },
  lideranca: { nome: "liderança", chaves: ["lider", "equipe", "chefe", "gestao", "time"] },
  persuasao: { nome: "persuasão", chaves: ["convenc", "persuad", "argument", "historia"] },
};

/* ---------- função narrativa de cada template ---------- */
export const FUNCOES = {
  capa: { funcao: "Interromper a rolagem e criar curiosidade", emocao: "Curiosidade com uma ponta de desconfiança", preferidos: ["cinema-series", "humor", "metafora"], tipografiaBase: 45,
    layout: "Capa de impacto. Com foto: “foto de fundo com texto em painel seguro” para uma foto sua com expressão de desconfiança, ou “foto acima do título” para objeto/metáfora. Sem foto: manter o numeral grande." },
  pergunta: { funcao: "Provocar autorreflexão", emocao: "Desconforto produtivo: “será que é comigo?”", preferidos: ["cotidiano", "cinema-series", "metafora"], tipografiaBase: 50,
    layout: "Provocação com foto de detalhe no lugar do gráfico (foto sua pensativa ou objeto do cotidiano). O título continua dominante." },
  sinal: { funcao: "Apresentar um sinal concreto e reconhecível", emocao: "Reconhecimento: “já vi isso acontecer”", preferidos: ["cotidiano", "metafora", "humor"], tipografiaBase: 50,
    layout: "Lista numerada mantendo o número grande. Foto de detalhe só se for uma situação concreta; obras protegidas entram como citação no texto, não como imagem." },
  "sinal-duplo": { funcao: "Mostrar dois sinais curtos lado a lado", emocao: "Reconhecimento rápido", preferidos: ["cotidiano", "metafora"], tipografiaBase: 70,
    layout: "Manter tipográfico: dois blocos já ocupam o slide. Use as referências na legenda ou num slide próprio." },
  destaque: { funcao: "Pedir uma ação (salvar, continuar, compartilhar)", emocao: "Urgência leve, sem alarme", preferidos: ["cotidiano"], tipografiaBase: 85,
    layout: "Apenas tipografia: imagem aqui compete com o pedido de ação." },
  checklist: { funcao: "Entregar uma ferramenta prática", emocao: "Segurança: “agora eu sei o que fazer”", preferidos: ["cotidiano", "metafora"], tipografiaBase: 80,
    layout: "Manter o cartão tipográfico. A referência (ex.: checklist do piloto) pode virar o título de apoio ou a legenda." },
  encerramento: { funcao: "Abrir conversa e convidar a seguir", emocao: "Identificação bem-humorada", preferidos: ["cotidiano", "humor", "cultura-brasileira"], tipografiaBase: 55,
    layout: "Encerramento com seu retrato na faixa de assinatura: rosto conhecido aumenta a chance de a pessoa seguir o perfil." },
  explicacao: { funcao: "Explicar um conceito", emocao: "Clareza", preferidos: ["metafora", "historico", "cotidiano"], tipografiaBase: 50, layout: "Explicação com foto lateral, se a imagem for literal ou metafórica." },
  comparacao: { funcao: "Contrastar duas ideias", emocao: "Clareza por contraste", preferidos: ["metafora", "cotidiano"], tipografiaBase: 70, layout: "Manter os dois cartões tipográficos." },
  exemplo: { funcao: "Mostrar uma cena concreta", emocao: "Identificação", preferidos: ["cotidiano", "cultura-brasileira"], tipografiaBase: 55, layout: "Cena em destaque; uma foto própria da situação pode substituir a descrição." },
};

export const NIVEL_FAMILIARIDADE = { alta: "alta", media: "média", baixa: "baixa" };
export const NIVEL_DISTRACAO = { baixa: "baixo", media: "médio", alta: "alto" };

export const TIPOS_CONEXAO = {
  literal: "Literal: mostra o próprio assunto",
  metaforica: "Metafórica: representa o conceito",
  cultural: "Cultural: conecta a algo conhecido",
  cotidiana: "Cotidiana: situação comum do público",
  humoristica: "Humorística: surpresa ou ironia",
  narrativa: "Narrativa: um caso que conta a história",
};

export const FILTROS = {
  "minhas-fotos": "Minhas fotos",
  cotidiano: "Cotidiano",
  "cinema-series": "Cinema e séries",
  humor: "Humor",
  "cultura-brasileira": "Cultura brasileira",
  metafora: "Metáforas",
  licenciadas: "Imagens licenciadas",
  tipografia: "Apenas tipografia",
};

export const CRITERIOS = [
  "Aderência ao conceito do slide: até 40 pontos (conceitos do texto que a referência cobre, ponderados).",
  "Familiaridade estimada para o público de 35 a 60 anos: alta 20, média 12, baixa 5. É uma hipótese editorial, sem dados de audiência.",
  "Força metafórica (a imagem explica sozinha): 5, 10 ou 15.",
  "Disponibilidade de imagem utilizável: foto própria ou tipografia 15, busca em acervos abertos 10, obra protegida 3.",
  "Adequação à função do slide: +5 quando o tipo de referência combina com a função.",
  "Risco de distração: baixo 0, médio −7, alto −15.",
];

const DISPONIBILIDADE = { "foto-propria": 15, tipografia: 15, "busca-aberta": 10, "obra-protegida": 3 };
const FAMILIARIDADE = { alta: 20, media: 12, baixa: 5 };
const DISTRACAO = { baixa: 0, media: -7, alta: -15 };

const semAcento = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\*/g, "");

export function textoDoSlide(s) {
  const partes = [s.titulo, s.texto, s.complemento, s.chamada, s.cta?.texto, ...(s.itens || []), ...(s.blocos || []).flatMap((b) => [b.titulo, b.texto, b.rotulo])];
  return partes.filter(Boolean).join(" \n ");
}

// Conceitos do slide com força (título vale o dobro).
export function conceitosDoSlide(s) {
  const titulo = ` ${semAcento([s.titulo, ...(s.blocos || []).map((b) => b.titulo)].join(" "))} `;
  const resto = ` ${semAcento(textoDoSlide(s))} `;
  const achados = {};
  for (const [id, c] of Object.entries(CONCEITOS)) {
    let f = 0;
    for (const k of c.chaves) { if (titulo.includes(k)) f += 2; else if (resto.includes(k)) f += 1; }
    if (f) achados[id] = Math.min(f, 4);
  }
  return achados;
}

function pontuar(ref, conceitos, funcao) {
  let ader = 0;
  for (const [c, peso] of Object.entries(ref.conceitos)) if (conceitos[c]) ader += peso * conceitos[c] * 2.5;
  ader = Math.min(40, Math.round(ader));
  if (!ader) return null;
  const partes = {
    aderencia: ader,
    familiaridade: FAMILIARIDADE[ref.familiaridade] ?? 5,
    metafora: (ref.metafora || 1) * 5,
    disponibilidade: DISPONIBILIDADE[ref.imagem?.via] ?? 3,
    funcao: ref.filtros.some((f) => funcao.preferidos.includes(f)) ? 5 : 0,
    distracao: DISTRACAO[ref.distracao] ?? 0,
  };
  const total = Math.max(0, Math.min(100, Object.values(partes).reduce((a, b) => a + b, 0)));
  return { total, partes };
}

export const STATUS_IMAGEM = {
  "foto-propria": { rotulo: "Pode ser fotografada por você", estado: "propria" },
  tipografia: { rotulo: "Composição tipográfica (sem imagem)", estado: "propria" },
  "busca-aberta": { rotulo: "Buscar em acervos abertos: licença a conferir", estado: "condicionado" },
  "obra-protegida": { rotulo: "Referência cultural: sem direito de reutilizar imagens", estado: "referencia" },
};

// Fica com as mais bem pontuadas e só troca a pior repetida quando faltam
// tipos de conexão: o objetivo é ter pelo menos 3 tipos distintos sem
// sacrificar referências fortes por fracas.
function diversificar(lista, n) {
  const escolhidos = lista.slice(0, n);
  const tipos = () => new Set(escolhidos.map((r) => r.tipo));
  for (const r of lista.slice(n)) {
    if (tipos().size >= 3) break;
    if (tipos().has(r.tipo)) continue;
    const contagem = {};
    escolhidos.forEach((x) => { contagem[x.tipo] = (contagem[x.tipo] || 0) + 1; });
    const alvo = [...escolhidos].reverse().find((x) => contagem[x.tipo] > 1);
    if (!alvo) break;
    escolhidos[escolhidos.indexOf(alvo)] = r;
  }
  return escolhidos.sort((a, b) => b.pontuacao.total - a.pontuacao.total);
}

// Sugestões da sua biblioteca, a partir das etiquetas e descrições que VOCÊ
// escreveu (sem análise automática de imagem).
/** @param {any} slide @param {any[]} [imagens] */
export function sugerirFotos(slide, imagens = []) {
  const conceitos = conceitosDoSlide(slide);
  const funcao = FUNCOES[slide.template] || FUNCOES.explicacao;
  const palavrasFuncao = {
    capa: ["desconfi", "serio", "pensativ", "olhar", "palco", "palestra", "estudio"],
    pergunta: ["pensativ", "duvid", "olhar", "celular"],
    encerramento: ["sorri", "descontra", "retrato", "profissional", "estudio"],
    sinal: ["objeto", "cotidian", "celular"],
  }[slide.template] || [];
  return imagens
    .filter((im) => im.status === "aprovado" && im.tipo !== "inspiracao")
    .map((im) => {
      const texto = semAcento([im.nome, im.descricao, im.contexto, ...(im.etiquetas || [])].join(" "));
      const motivos = [];
      let pts = 0;
      for (const [c, f] of Object.entries(conceitos)) if (CONCEITOS[c].chaves.some((k) => texto.includes(k.trim()))) { pts += 10 * f; motivos.push(`etiqueta ligada a “${CONCEITOS[c].nome}”`); }
      for (const p of palavrasFuncao) if (texto.includes(p)) { pts += 12; motivos.push(`“${p}…” combina com a função (${funcao.funcao.toLowerCase()})`); }
      if (im.favorita) { pts += 4; motivos.push("marcada como favorita"); }
      const paisagem = im.largura > im.altura * 1.15;
      const retrato = im.altura > im.largura * 1.15;
      if (slide.template === "capa" && paisagem) { pts += 6; motivos.push("formato horizontal funciona como foto acima do título"); }
      if (slide.template === "encerramento" && retrato) { pts += 6; motivos.push("formato vertical funciona como retrato na assinatura"); }
      if (im.largura && im.largura < 1080 && slide.template === "capa") { pts -= 8; motivos.push(`resolução baixa para capa (${im.largura} px)`); }
      return { imagem: im, pontos: pts, motivos };
    })
    .filter((x) => x.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 6);
}

/** @param {any} slide @param {{ imagens?: any[], rejeitadas?: string[], limite?: number }} [opcoes] */
export function recomendarParaSlide(slide, { imagens = [], rejeitadas = [], limite = 6 } = {}) {
  const conceitos = conceitosDoSlide(slide);
  const funcao = FUNCOES[slide.template] || FUNCOES.explicacao;
  const candidatas = REPERTORIO
    .filter((r) => !rejeitadas.includes(r.id))
    .map((r) => ({ ...r, pontuacao: pontuar(r, conceitos, funcao) }))
    .filter((r) => r.pontuacao)
    .sort((a, b) => b.pontuacao.total - a.pontuacao.total);
  const referencias = diversificar(candidatas, limite).map((r) => ({
    ...r,
    rotuloTipo: TIPOS_CONEXAO[r.tipo],
    statusImagem: STATUS_IMAGEM[r.imagem?.via] || STATUS_IMAGEM["obra-protegida"],
    conceitosCobertos: Object.keys(r.conceitos).filter((c) => conceitos[c]).map((c) => CONCEITOS[c].nome),
  }));
  const principais = Object.entries(conceitos).sort((a, b) => b[1] - a[1]).map(([c]) => CONCEITOS[c].nome);
  return {
    conceitoCentral: principais.slice(0, 2).join(" + ") || "não identificado pelas palavras-chave (use a busca manual)",
    conceitos: principais,
    funcao: funcao.funcao,
    emocao: funcao.emocao,
    layout: funcao.layout,
    tipografia: {
      pontuacao: funcao.tipografiaBase,
      justificativa: funcao.tipografiaBase >= 70
        ? "Recomendado: este slide pede ação ou leitura rápida; imagem tende a competir com o texto."
        : "Alternativa válida: o texto já carrega a ideia; use imagem só se ela acrescentar reconhecimento.",
    },
    referencias,
    fotosSugeridas: sugerirFotos(slide, imagens),
    criterios: CRITERIOS,
    aviso: "Pontuação heurística de 0 a 100, calculada por regras locais (repertório curado + palavras-chave). É estimativa editorial, não previsão de alcance ou viralização. Familiaridade é hipótese, sem dados de audiência.",
  };
}

// Relatório para o carrossel inteiro (usado no documento de universalidade).
export function relatorioUniversalidade(carrossel, opcoes = {}) {
  return carrossel.slides.map((s, i) => ({ slide: i + 1, template: s.template, titulo: String(s.titulo || s.blocos?.[0]?.titulo || "").replace(/\*/g, ""), ...recomendarParaSlide(s, { ...opcoes, rejeitadas: s.universalidade?.rejeitadas || [] }) }));
}
