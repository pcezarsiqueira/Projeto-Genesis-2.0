// Chamadas ao servidor local. Toda mensagem de erro já vem em português.
import type { Carrossel, Resumo, EstadoExportacao } from "./tipos";

export class ErroApi extends Error {
  status: number; extra: any;
  constructor(msg: string, status: number, extra?: any) { super(msg); this.status = status; this.extra = extra; }
}

export async function pedir<T>(url: string, opcoes: RequestInit = {}): Promise<T> {
  let r: Response;
  try {
    r = await fetch(url, opcoes);
  } catch {
    throw new ErroApi("Sem conexão com o servidor do PRISMA. Verifique se a janela do servidor continua aberta.", 0);
  }
  const tipo = r.headers.get("content-type") || "";
  const corpo = tipo.includes("json") ? await r.json() : await r.text();
  if (!r.ok) throw new ErroApi((corpo as any)?.erro || `Erro ${r.status}`, r.status, corpo);
  return corpo as T;
}
const json = (metodo: string, dados: unknown): RequestInit => ({
  method: metodo, headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados),
});

export type ItemBiblioteca = Resumo & { dados: Carrossel };
export type Foto = { arquivo: string; largura: number; altura: number; aviso?: string | null };
export type Destino = { id: string; nome: string; descricao: string; entrega: "pngs" | "pdf" };

export const api = {
  listar: () => pedir<ItemBiblioteca[]>("/api/projetos"),
  abrir: (id: string) => pedir<{ dados: Carrossel; resumo: Resumo; exportacao: EstadoExportacao | null }>(`/api/projetos/${id}`),
  salvar: (id: string, dados: Carrossel, revisao?: number) =>
    pedir<{ dados: Carrossel; resumo: Resumo }>(`/api/projetos/${id}`, json("PUT", { dados, revisao })),
  criar: (dados: Partial<Carrossel>) => pedir<{ dados: Carrossel }>("/api/projetos", json("POST", { dados })),
  duplicar: (id: string) => pedir<{ dados: Carrossel }>("/api/projetos", json("POST", { duplicarDe: id })),
  excluir: (id: string) => pedir<{ movidoPara: string }>(`/api/projetos/${id}?confirmar=sim`, { method: "DELETE" }),
  fotos: (id: string) => pedir<Foto[]>(`/api/projetos/${id}/fotos`),
  enviarFoto: (id: string, arquivo: File) =>
    pedir<Foto>(`/api/projetos/${id}/fotos`, { method: "POST", headers: { "Content-Type": arquivo.type || "application/octet-stream" }, body: arquivo }),
  exportar: (id: string, forcar = false) =>
    pedir<{ estado: EstadoExportacao; valida: boolean }>(`/api/projetos/${id}/exportar${forcar ? "?forcar=sim" : ""}`, { method: "POST" }),
  estadoExportacao: (id: string) => pedir<{ estado: EstadoExportacao | null; valida: boolean; exportando: boolean }>(`/api/projetos/${id}/exportacao`),
  destinos: () => pedir<Destino[]>("/api/destinos"),
};

// Inicia o download pelo navegador (o servidor envia Content-Disposition:
// attachment; o navegador salva ou pergunta onde salvar, como de costume).
export function baixar(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export const urlsDownload = (id: string) => ({
  slide: (n: number) => `/download/${id}/slide/${n}`,
  pngs: `/download/${id}/pngs`,
  pdf: `/download/${id}/pdf`,
  zip: `/download/${id}/zip`,
  visaoGeral: `/download/${id}/visao-geral`,
  projeto: `/download/${id}/projeto`,
  destino: (d: string) => `/download/${id}/destino/${d}`,
});

/* ---------- Universalidade visual ---------- */
export type Origem = {
  fonte?: string; titulo?: string; autor?: string | null; licenca?: string | null; licencaUrl?: string | null;
  urlOriginal?: string; urlArquivo?: string; obrigacoes?: string[]; atribuicaoPronta?: string | null;
  termo?: string; consultadoEm?: string; resolucao?: string; manual?: boolean;
};
export type ImagemBiblioteca = {
  id: string; arquivo: string; nome: string; descricao: string; contexto: string; etiquetas: string[]; albuns: string[];
  favorita: boolean; tipo: "pessoal" | "propria" | "licenciada" | "inspiracao"; status: "referencia" | "condicionado" | "aprovado";
  largura: number; altura: number; bytes: number; foco: { x: number; y: number }; zoom?: number;
  origem: Origem | null; autorizacao: { descricao: string; data: string } | null; condicoesConfirmadas?: { em: string } | null;
  projetos: string[]; criadaEm: string; atualizadaEm: string;
};
export type Album = { id: string; nome: string };
export type Fonte = { id: string; nome: string; descricao: string; precisaChave: boolean; somenteReferencia: boolean; configurado: boolean };
export type ResultadoBusca = {
  id: string; fonte: string; titulo: string; miniatura: string | null; urlOriginal: string; autor: string | null;
  licenca: string | null; licencaUrl: string | null; obrigacoes: string[]; largura: number; altura: number;
  status: "referencia" | "condicionado"; importavel: boolean; resumo?: string; atribuicaoPronta?: string | null;
  termo: string; consultadoEm: string;
};
export type ImagemAplicada = {
  arquivo: string; largura: number; altura: number; foco: { x: number; y: number }; zoom: number; descricao: string;
  origem: Record<string, any>;
};

const enc = (s: string) => encodeURIComponent(s);
export const apiUniv = {
  biblioteca: () => pedir<{ albuns: Album[]; imagens: ImagemBiblioteca[] }>("/api/biblioteca"),
  enviarImagem: (arquivo: File, tipo: string, albuns: string[]) =>
    pedir<{ imagem: ImagemBiblioteca; aviso: string | null }>("/api/biblioteca/imagens", {
      method: "POST", body: arquivo,
      headers: { "Content-Type": arquivo.type || "application/octet-stream", "X-Nome": enc(arquivo.name), "X-Tipo": tipo, "X-Albuns": enc(albuns.join(",")) },
    }),
  atualizarImagem: (id: string, dados: Record<string, any>) =>
    pedir<ImagemBiblioteca>(`/api/biblioteca/imagens/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) }),
  substituirArquivo: (id: string, arquivo: File) =>
    pedir<ImagemBiblioteca>(`/api/biblioteca/imagens/${id}/arquivo?confirmar=sim`, { method: "PUT", body: arquivo, headers: { "Content-Type": arquivo.type || "application/octet-stream" } }),
  removerImagem: (id: string) => pedir<{ removida: string; usadaEm: string[] }>(`/api/biblioteca/imagens/${id}?confirmar=sim`, { method: "DELETE" }),
  criarAlbum: (nome: string) => pedir<Album>("/api/biblioteca/albuns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome }) }),
  removerAlbum: (id: string) => pedir<{ ok: boolean }>(`/api/biblioteca/albuns/${id}`, { method: "DELETE" }),
  urlImagem: (id: string, versao = "") => `/api/biblioteca/imagens/${id}/arquivo${versao ? `?v=${enc(versao)}` : ""}`,
  fontes: () => pedir<Fonte[]>("/api/fontes"),
  buscar: (fonte: string, q: string) => pedir<{ resultados: ResultadoBusca[]; urlManual: string }>(`/api/fontes/${fonte}/buscar?q=${enc(q)}`),
  importar: (resultadoId: string, albuns: string[] = []) =>
    pedir<{ imagem: ImagemBiblioteca }>("/api/biblioteca/importar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resultadoId, albuns }) }),
  aplicar: (projetoId: string, imagemId: string) =>
    pedir<ImagemAplicada>(`/api/projetos/${projetoId}/aplicar-imagem`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imagemId }) }),
  integracoes: () => pedir<{ chaves: Record<string, any>; fontes: Fonte[]; ia: { ativo: boolean; provedor: string | null; mensagem?: string; consentimentoImagens: boolean } }>("/api/integracoes"),
  salvarIntegracoes: (dados: Record<string, any>) =>
    pedir<{ chaves: Record<string, any>; fontes: Fonte[]; ia: any }>("/api/integracoes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) }),
};

export const ROTULO_TIPO_IMAGEM: Record<string, string> = { pessoal: "Foto pessoal", propria: "Imagem própria", licenciada: "Licenciada", inspiracao: "Referência de inspiração" };
export const ROTULO_STATUS: Record<string, string> = { referencia: "Referência cultural", condicionado: "Uso condicionado", aprovado: "Aprovada para exportação" };
