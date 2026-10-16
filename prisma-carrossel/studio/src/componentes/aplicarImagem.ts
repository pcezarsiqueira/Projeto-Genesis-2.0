// Inserção de uma imagem da biblioteca num slide. Sempre pede confirmação
// (a arte nunca muda sozinha), confere resolução e direitos, e oferece trocar
// o modelo quando o atual é só tipográfico. Pode ser desfeita com Ctrl+Z.
import type { Carrossel, Slide } from "../tipos";
import { apiUniv, type ImagemBiblioteca } from "../api";
// @ts-ignore
import { modeloDoSlide, trocarModelo, MODOS_FOTO } from "../../../src/catalogo.js";

type Confirmar = (o: { titulo: string; texto: string; confirmar: string; perigo?: boolean }) => Promise<boolean>;
type Alterar = (fn: (c: Carrossel) => Carrossel, grupo?: string) => void;

export function larguraNecessaria(slide: Slide, modo: string): number {
  if (modo === "fundo") return 1080;
  if (modo === "topo") return 888;
  if (modo === "lateral") return 440;
  if (modo === "retrato") return 200;
  if (slide.template === "pergunta") return 300;
  const v = slide.variante || (slide.cta ? "c" : Number(slide.numero) % 2 ? "a" : "b");
  return v === "c" ? 888 : v === "a" ? 480 : 440;
}

export function avisoResolucao(slide: Slide, modo: string, largura: number, zoom = 1): string | null {
  if (!largura) return null;
  const precisa = larguraNecessaria(slide, modo);
  const efetiva = Math.round(largura / zoom);
  return efetiva < precisa * 0.9 ? `Resolução baixa: a foto tem ${efetiva} px úteis de largura e este espaço pede cerca de ${precisa} px. Pode ficar sem nitidez.` : null;
}

export async function aplicarImagem({ carrossel: c, indice, imagem, alterar, confirmar, avisar }: {
  carrossel: Carrossel; indice: number; imagem: ImagemBiblioteca; alterar: Alterar; confirmar: Confirmar; avisar: (t: string, tipo?: "ok" | "erro" | "info") => void;
}): Promise<boolean> {
  if (imagem.tipo === "inspiracao" || imagem.status !== "aprovado") {
    avisar(imagem.tipo === "inspiracao" ? "Referência de inspiração não entra na arte." : "Aprove a imagem na Minha Biblioteca (licença conferida) antes de inserir.", "erro");
    return false;
  }
  let slide = c.slides[indice];
  let modelo = modeloDoSlide(slide);
  let modos: string[] = modelo.fotos || [];
  if (!modos.length) {
    const trocar = await confirmar({
      titulo: "Este modelo não usa foto",
      texto: `O slide ${indice + 1} usa “${modelo.categoria}”, que é só tipográfico. Trocar para “Explicação” (foto lateral), mantendo título e texto?`,
      confirmar: "Trocar e continuar",
    });
    if (!trocar) return false;
    slide = trocarModelo(slide, "explicacao", c.perfil);
    modelo = modeloDoSlide(slide);
    modos = modelo.fotos || [];
  }
  const paisagem = imagem.largura > imagem.altura * 1.15;
  const modo = slide.template === "capa" ? (paisagem && imagem.largura >= 1080 ? "fundo" : "topo") : modos[0];
  const zoom = imagem.zoom || 1;
  const aviso = avisoResolucao(slide, modo, imagem.largura, zoom);
  const credito = imagem.origem ? [imagem.origem.titulo && `“${imagem.origem.titulo}”`, imagem.origem.autor && `por ${imagem.origem.autor}`, imagem.origem.licenca].filter(Boolean).join(", ") : "";
  const ok = await confirmar({
    titulo: `Inserir no slide ${indice + 1}?`,
    texto: [
      `“${imagem.nome}” como ${(MODOS_FOTO as Record<string, string>)[modo].toLowerCase()}.`,
      `O recorte começa centrado no ponto de interesse que você marcou (${imagem.foco.x}%, ${imagem.foco.y}%).`,
      credito ? `Crédito exigido aparecerá na arte e no arquivo creditos.txt: ${credito}.` : "",
      aviso || "",
      "Você pode desfazer com Ctrl+Z.",
    ].filter(Boolean).join(" "),
    confirmar: "Inserir imagem",
  });
  if (!ok) return false;
  try {
    const r = await apiUniv.aplicar(c.id, imagem.id);
    const novo = {
      ...slide,
      foto: { arquivo: r.arquivo, modo, x: r.foco.x, y: r.foco.y, zoom: r.zoom, exposicao: 1, contraste: 1, descricao: r.descricao, origem: r.origem, creditoNaArte: Boolean(r.origem.credito) },
      universalidade: { ...(slide.universalidade || {}), imagemAplicada: { id: imagem.id, nome: imagem.nome, em: new Date().toISOString() } },
    };
    alterar((x) => ({ ...x, slides: x.slides.map((s, k) => (k === indice ? novo : s)) }));
    avisar(`Imagem inserida no slide ${indice + 1}. Confira a validação abaixo da prévia.`);
    return true;
  } catch (e: any) {
    avisar(e.message, "erro");
    return false;
  }
}
