// Chamadas ao servidor local. Toda mensagem de erro já vem em português.
import type { Carrossel, Resumo, EstadoExportacao } from "./tipos";

export class ErroApi extends Error {
  status: number; extra: any;
  constructor(msg: string, status: number, extra?: any) { super(msg); this.status = status; this.extra = extra; }
}

async function pedir<T>(url: string, opcoes: RequestInit = {}): Promise<T> {
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
