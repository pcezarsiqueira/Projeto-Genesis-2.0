// Destinos de publicação. Uma única fonte de conteúdo (o carrossel) gera os
// arquivos de cada destino. Para um novo formato (ex.: 1080 × 1920), é
// preciso primeiro criar templates próprios para esse quadro; até lá ele não
// aparece aqui, para não entregar versões incompletas.
export const DESTINOS = [
  { id: "instagram", nome: "Instagram", descricao: "PNG 1080 × 1350, um por slide (ZIP)", entrega: "pngs", formato: { largura: 1080, altura: 1350 } },
  { id: "tiktok", nome: "TikTok · modo foto", descricao: "PNG 1080 × 1350, um por slide (ZIP)", entrega: "pngs", formato: { largura: 1080, altura: 1350 } },
  { id: "linkedin", nome: "LinkedIn", descricao: "PDF multipágina (documento)", entrega: "pdf", formato: { largura: 1080, altura: 1350 } },
  { id: "substack", nome: "Substack", descricao: "PNGs individuais para inserir no artigo (ZIP)", entrega: "pngs", formato: { largura: 1080, altura: 1350 } },
];
