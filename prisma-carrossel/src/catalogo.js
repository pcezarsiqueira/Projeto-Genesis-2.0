// Catálogo de modelos do PRISMA Studio. Módulo puro: descreve, para cada
// categoria narrativa, qual template usar, quais campos o editor mostra,
// limites recomendados de texto e modos de foto suportados.
// A interface gera os formulários a partir daqui; ninguém edita CSS ou JSON.

const GRAFICOS = [
  { valor: "", rotulo: "Sem gráfico" },
  { valor: "feed", rotulo: "Feed ordenado" },
  { valor: "medidor", rotulo: "Medidor (duas barras)" },
  { valor: "sobreposicao", rotulo: "Círculos sobrepostos" },
  { valor: "multidao", rotulo: "Grupo uniforme" },
  { valor: "excluido", rotulo: "Um fora do grupo" },
  { valor: "imagem-falsa", rotulo: "Imagem com corte" },
];
const ICONES = [
  { valor: "salvar", rotulo: "Salvar" },
  { valor: "compartilhar", rotulo: "Compartilhar" },
  { valor: "comentar", rotulo: "Comentar" },
  { valor: "seta", rotulo: "Seta (continuar)" },
];

// Tipos de campo: curto (1 linha, aceita *destaque*), longo (várias linhas),
// lista (itens), numero, opcoes, blocos (sub-campos repetidos).
const titulo = (max = 70) => ({ chave: "titulo", rotulo: "Título", tipo: "curto", destaque: true, max });

export const MODELOS = [
  {
    id: "capa-impacto", categoria: "Capa de impacto", template: "capa",
    descricao: "Abre o carrossel. Número grande ou foto, título forte.",
    campos: [
      { chave: "numero", rotulo: "Número em destaque (opcional)", tipo: "curto", max: 3, dica: "Só aparece se o título começar com ele." },
      titulo(70),
      { chave: "chamada", rotulo: "Chamada para deslizar", tipo: "curto", max: 30 },
    ],
    fotos: ["topo", "fundo"],
    padrao: { fundo: "escuro", numero: "", titulo: "TÍTULO DO *CARROSSEL*", chamada: "Arraste para o lado" },
  },
  {
    id: "provocacao", categoria: "Provocação", template: "pergunta",
    descricao: "Pergunta que faz o leitor se reconhecer.",
    campos: [titulo(80), { chave: "complemento", rotulo: "Complemento", tipo: "longo", max: 90 },
      { chave: "grafico", rotulo: "Gráfico", tipo: "opcoes", opcoes: GRAFICOS }],
    alinhamento: true,
    padrao: { fundo: "claro", titulo: "UMA PERGUNTA QUE *INCOMODA?*", complemento: "Uma frase curta que aprofunda a pergunta.", grafico: "" },
  },
  {
    id: "explicacao", categoria: "Explicação", template: "explicacao",
    descricao: "Um conceito explicado em poucas linhas.",
    campos: [{ chave: "rotulo", rotulo: "Rótulo (opcional)", tipo: "curto", max: 32 }, titulo(70),
      { chave: "texto", rotulo: "Texto (linha em branco separa parágrafos)", tipo: "longo", destaque: true, max: 260 }],
    fotos: ["lateral"], alinhamento: true,
    padrao: { fundo: "claro", rotulo: "", titulo: "O QUE ESTÁ *POR TRÁS* DISSO", texto: "Explique a ideia com uma frase concreta.\n\nUse um segundo parágrafo só se precisar." },
  },
  {
    id: "lista-numerada", categoria: "Lista numerada", template: "sinal",
    descricao: "Um item da lista, com número grande.",
    campos: [{ chave: "numero", rotulo: "Número", tipo: "curto", max: 2 }, titulo(70),
      { chave: "texto", rotulo: "Texto", tipo: "longo", destaque: true, max: 120 },
      { chave: "grafico", rotulo: "Gráfico", tipo: "opcoes", opcoes: GRAFICOS },
      { chave: "variante", rotulo: "Composição", tipo: "opcoes", opcoes: [
        { valor: "", rotulo: "Automática" }, { valor: "a", rotulo: "A · número no topo" },
        { valor: "b", rotulo: "B · número embaixo" }, { valor: "c", rotulo: "C · gráfico largo + CTA" }] },
      { chave: "cta.texto", rotulo: "CTA na base (só composição C)", tipo: "curto", max: 70 }],
    padrao: { fundo: "escuro", numero: "1", titulo: "PRIMEIRO *ITEM.*", texto: "Uma frase que explica o item.", grafico: "", variante: "" },
  },
  {
    id: "lista-dupla", categoria: "Lista numerada", nome: "Dois itens no mesmo slide", template: "sinal-duplo",
    descricao: "Dois itens curtos da lista, um acima do outro.",
    campos: [{ chave: "blocos", rotulo: "Itens", tipo: "blocos", quantidade: 2, campos: [
      { chave: "numero", rotulo: "Número", tipo: "curto", max: 2 }, titulo(45),
      { chave: "texto", rotulo: "Texto", tipo: "longo", max: 60 },
      { chave: "grafico", rotulo: "Gráfico", tipo: "opcoes", opcoes: GRAFICOS }] }],
    padrao: { fundo: "escuro", blocos: [
      { numero: "2", titulo: "SEGUNDO *ITEM.*", texto: "Frase curta.", grafico: "" },
      { numero: "3", titulo: "TERCEIRO *ITEM.*", texto: "Frase curta.", grafico: "" }] },
  },
  {
    id: "comparacao", categoria: "Comparação", template: "comparacao",
    descricao: "Dois lados lado a lado.",
    campos: [titulo(70), { chave: "blocos", rotulo: "Lados", tipo: "blocos", quantidade: 2, campos: [
      { chave: "rotulo", rotulo: "Rótulo", tipo: "curto", max: 20 },
      { chave: "texto", rotulo: "Texto", tipo: "longo", destaque: true, max: 70 }] }],
    padrao: { fundo: "claro", titulo: "O QUE PARECE × O QUE *É*", blocos: [
      { rotulo: "Parece", texto: "A primeira impressão." }, { rotulo: "Na verdade", texto: "O que se descobre olhando *de perto*." }] },
  },
  {
    id: "exemplo", categoria: "Exemplo", template: "exemplo",
    descricao: "Uma cena concreta que mostra a ideia.",
    campos: [{ chave: "rotulo", rotulo: "Rótulo", tipo: "curto", max: 24 }, titulo(60),
      { chave: "texto", rotulo: "Cena", tipo: "longo", destaque: true, max: 180 },
      { chave: "legenda", rotulo: "Legenda / contexto (opcional)", tipo: "curto", max: 50 }],
    padrao: { fundo: "suave", rotulo: "Exemplo", titulo: "NA *PRÁTICA*", texto: "Descreva uma situação real que o leitor reconheça.", legenda: "" },
  },
  {
    id: "suspense", categoria: "Suspense e continuidade", template: "destaque",
    descricao: "Segura o leitor até o próximo slide.",
    campos: [titulo(70), { chave: "complemento", rotulo: "Complemento", tipo: "longo", max: 90 },
      { chave: "progresso.vistos", rotulo: "Itens vistos", tipo: "numero", min: 0, max: 10 },
      { chave: "progresso.total", rotulo: "Total de itens (0 oculta)", tipo: "numero", min: 0, max: 10 }],
    alinhamento: true,
    padrao: { fundo: "acento", icone: "seta", titulo: "AINDA NÃO *ACABOU.*", complemento: "O próximo é o que mais engana.", progresso: { vistos: 2, total: 5 } },
  },
  {
    id: "checklist", categoria: "Checklist", template: "checklist",
    descricao: "Ferramenta prática em forma de cartão.",
    campos: [titulo(70), { chave: "itens", rotulo: "Itens", tipo: "lista", max: 5, maxItem: 34 }],
    padrao: { fundo: "escuro", titulo: "ANTES DE AGIR, *CONFIRA.*", itens: ["Primeira pergunta?", "Segunda pergunta?", "Terceira pergunta?"] },
  },
  {
    id: "cta-salvar", categoria: "CTA de salvamento", template: "destaque",
    descricao: "Pede para salvar o post.",
    campos: [titulo(70), { chave: "complemento", rotulo: "Complemento", tipo: "longo", max: 90 },
      { chave: "progresso.vistos", rotulo: "Itens vistos", tipo: "numero", min: 0, max: 10 },
      { chave: "progresso.total", rotulo: "Total de itens (0 oculta)", tipo: "numero", min: 0, max: 10 }],
    alinhamento: true,
    padrao: { fundo: "acento", icone: "salvar", titulo: "SALVE PARA *CONSULTAR* DEPOIS.", complemento: "Você vai precisar disso na próxima vez.", progresso: { vistos: 0, total: 0 } },
  },
  {
    id: "cta-compartilhar", categoria: "CTA de compartilhamento", template: "destaque",
    descricao: "Pede para enviar a alguém.",
    campos: [titulo(70), { chave: "complemento", rotulo: "Complemento", tipo: "longo", max: 90 }],
    alinhamento: true,
    padrao: { fundo: "claro", icone: "compartilhar", titulo: "MANDE PARA QUEM *PRECISA* VER.", complemento: "Aquela pessoa que sempre encaminha tudo.", progresso: { vistos: 0, total: 0 } },
  },
  {
    id: "encerramento", categoria: "Encerramento e comentário", template: "encerramento",
    descricao: "Pergunta final, convite para comentar e assinatura.",
    campos: [titulo(80), { chave: "cta.texto", rotulo: "Chamada para comentar", tipo: "curto", max: 40 },
      { chave: "assinatura", rotulo: "Assinatura", tipo: "longo", max: 100 }],
    fotos: ["retrato"], alinhamento: true,
    padrao: { fundo: "claro", titulo: "E VOCÊ, JÁ *PASSOU* POR ISSO?", cta: { icone: "comentar", texto: "Comente sua experiência." }, assinatura: "Siga @perfil para mais." },
  },
];

export const MODOS_FOTO = {
  topo: "Foto acima do título",
  fundo: "Foto de fundo com texto em painel seguro",
  lateral: "Foto lateral",
  retrato: "Retrato na assinatura",
};

export const FUNDOS_ROTULOS = { escuro: "Grafite", claro: "Branco quente", suave: "Cinza suave", acento: "Dourado" };

// Qual modelo descreve um slide existente (dados antigos não têm "modelo").
export function modeloDoSlide(s) {
  if (s.modelo) {
    const m = MODELOS.find((x) => x.id === s.modelo);
    if (m && m.template === s.template) return m;
  }
  if (s.template === "destaque") {
    return MODELOS.find((m) => m.template === "destaque" && m.padrao.icone === (s.icone || "salvar")) || MODELOS.find((m) => m.id === "cta-salvar") || MODELOS[0];
  }
  return MODELOS.find((m) => m.template === s.template) || MODELOS[0];
}

export function obterCampo(obj, chave) {
  return chave.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
export function definirCampo(obj, chave, valor) {
  const partes = chave.split(".");
  const raiz = { ...obj };
  let alvo = raiz;
  partes.slice(0, -1).forEach((k) => { alvo[k] = { ...(alvo[k] || {}) }; alvo = alvo[k]; });
  alvo[partes[partes.length - 1]] = valor;
  return raiz;
}

const clonar = (v) => JSON.parse(JSON.stringify(v));

export function novoSlide(modeloId, perfil = "") {
  const m = MODELOS.find((x) => x.id === modeloId) || MODELOS[0];
  const s = { template: m.template, modelo: m.id, ...clonar(m.padrao) };
  if (m.id === "encerramento" && perfil) s.assinatura = `Siga ${perfil} para mais.`;
  return s;
}

// Troca o modelo de um slide mantendo título e textos já escritos.
export function trocarModelo(slide, modeloId, perfil = "") {
  const novo = novoSlide(modeloId, perfil);
  const textoAntigo = slide.texto || slide.complemento || "";
  if (slide.titulo) novo.titulo = slide.titulo;
  if ("texto" in novo && textoAntigo) novo.texto = textoAntigo;
  if ("complemento" in novo && textoAntigo) novo.complemento = textoAntigo;
  if (slide.foto && MODELOS.find((m) => m.id === modeloId)?.fotos) {
    novo.foto = { ...slide.foto, modo: MODELOS.find((m) => m.id === modeloId).fotos[0] };
  }
  novo.fundo = slide.fundo || novo.fundo;
  return novo;
}

// Limites recomendados: avisos para o editor (o corte real é medido no navegador).
export function avisosDeTamanho(slide) {
  const m = modeloDoSlide(slide);
  const avisos = [];
  const limpo = (t) => String(t || "").replace(/\*/g, "");
  const conferir = (campo, valor, prefixo = "") => {
    if (campo.tipo === "blocos") {
      (valor || []).forEach((b, i) => campo.campos.forEach((c) => conferir(c, obterCampo(b, c.chave), `${campo.rotulo} ${i + 1} · `)));
    } else if (campo.tipo === "lista") {
      const itens = valor || [];
      if (campo.max && itens.length > campo.max) avisos.push(`${prefixo}${campo.rotulo}: ${itens.length} itens (recomendado até ${campo.max}).`);
      itens.forEach((it, i) => { if (campo.maxItem && limpo(it).length > campo.maxItem) avisos.push(`${prefixo}${campo.rotulo} ${i + 1}: ${limpo(it).length} caracteres (recomendado até ${campo.maxItem}).`); });
    } else if (campo.max && typeof valor === "string" && limpo(valor).length > campo.max) {
      avisos.push(`${prefixo}${campo.rotulo}: ${limpo(valor).length} caracteres (recomendado até ${campo.max}).`);
    }
  };
  m.campos.forEach((c) => conferir(c, obterCampo(slide, c.chave)));
  return avisos;
}

export function carrosselEmBranco({ titulo = "Novo carrossel", perfil = "@opaulinhosiqueira", autor = "Paulinho Siqueira", publicacao = "" } = {}) {
  return {
    titulo, publicacao, autor, perfil,
    formato: { largura: 1080, altura: 1350 },
    rotulo_lista: "Item",
    slides: [novoSlide("capa-impacto"), novoSlide("lista-numerada"), novoSlide("encerramento", perfil)],
  };
}
