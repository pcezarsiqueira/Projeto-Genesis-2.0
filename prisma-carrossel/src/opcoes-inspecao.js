// Parâmetros da inspeção de layout, compartilhados pelo exportador e pela
// prévia ao vivo do Studio (mesmos critérios nos dois lugares).
export const OPCOES_INSPECAO = {
  zonaConteudo: { x: 90, y: 120, r: 990, b: 1262 },
  zonaMeta: { x: 60, y: 40, r: 1020, b: 1310 },
  corpoMinimo: 24,
  corpoMinimoMeta: 22,
  escalaCelular: 390 / 1080, // largura típica de tela de celular
  caracteresPorLinhaMax: 44,
};
