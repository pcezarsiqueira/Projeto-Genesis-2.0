// Tipos do Studio. O conteúdo do slide é aberto (cada template usa campos
// próprios, descritos em src/catalogo.js), por isso usamos registros.
export type Slide = Record<string, any> & { template: string; fundo: string };
export type Carrossel = {
  id: string;
  titulo: string;
  publicacao?: string;
  autor?: string;
  perfil?: string;
  rotulo_lista?: string;
  formato: { largura: number; altura: number };
  slides: Slide[];
  studio?: { revisao?: number; atualizadoEm?: string; criadoEm?: string };
  [k: string]: any;
};
export type Resumo = {
  id: string; titulo: string; publicacao: string; slides: number;
  atualizadoEm: string | null; exportadoEm: string | null; exportando?: boolean;
  status: "rascunho" | "exportado" | "exportado-com-erros" | "desatualizado";
};
export type EstadoExportacao = {
  hash: string; quando: string; totalErros: number; segundos: number; navegador?: string; slides: number;
  resumo: { slide: number; erros: string[]; avisos: string[] }[]; errosArquivos: string[];
};
export type Inspecao = { slide: number; erros: string[]; avisos: string[]; corpoTituloPx: number | null; menorCorpoNoCelularPx: number; menorContraste: number };
