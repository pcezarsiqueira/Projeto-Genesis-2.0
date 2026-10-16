// Mostra um slide real dentro de um iframe, na escala pedida.
// O documento é montado pelo mesmo código do exportador. Depois da primeira
// carga, mudanças trocam só o <section> do slide (sem piscar) e reajustam o
// corpo dos textos. Opcionalmente roda a inspeção de layout e devolve
// erros/avisos (texto cortado, fora da área segura, contraste…).
import { useEffect, useRef, useState, memo } from "react";
import type { Carrossel, Inspecao } from "../tipos";
import { documentoDoSlide, htmlDoSlide, chaveDoSlide, opcoesInspecao, errosDeDados } from "../motor";

type Props = {
  carrossel: Carrossel;
  indice: number;
  largura: number;
  inspecionar?: boolean;
  onInspecao?: (r: Inspecao | null) => void;
  rotulo?: string;
};

function QuadroSlideBase({ carrossel, indice, largura, inspecionar, onInspecao, rotulo }: Props) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [srcDoc, setSrcDoc] = useState<string>("");
  const carregado = useRef(false);
  const chave = chaveDoSlide(carrossel, indice);
  const errosDados = errosDeDados(carrossel);
  const ultimaChave = useRef<string>("");
  const ultimoInspecionar = useRef(inspecionar);
  const retorno = useRef(onInspecao);
  retorno.current = onInspecao;

  // primeira montagem (ou quando o projeto muda de identidade)
  useEffect(() => {
    if (errosDados.length) return;
    carregado.current = false;
    ultimaChave.current = chave;
    setSrcDoc(documentoDoSlide(carrossel, indice));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrossel.id, errosDados.length > 0]);

  async function aposAtualizar() {
    const w = ref.current?.contentWindow as any;
    if (!w?.__prismaReajustar) return;
    await w.__prismaReajustar();
    if (ultimoInspecionar.current && w.__prismaInspecionar && retorno.current) {
      try {
        const r = w.__prismaInspecionar(opcoesInspecao(carrossel, indice));
        retorno.current(r.slides[0] || null);
      } catch {
        retorno.current(null);
      }
    }
  }

  // mudanças de conteúdo: troca só o slide
  useEffect(() => {
    ultimoInspecionar.current = inspecionar;
    if (errosDados.length || !carregado.current) return;
    if (chave === ultimaChave.current && !inspecionar) return;
    const doc = ref.current?.contentDocument;
    const sec = doc?.querySelector(".slide");
    if (!doc || !sec) return;
    if (chave !== ultimaChave.current) {
      ultimaChave.current = chave;
      sec.outerHTML = htmlDoSlide(carrossel, indice);
    }
    void aposAtualizar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, inspecionar]);

  const { largura: L, altura: A } = carrossel.formato;
  const escala = largura / L;
  return (
    <div className="quadro" style={{ width: largura, height: Math.round(A * escala) }} aria-label={rotulo}>
      {errosDados.length ? (
        <div className="quadro-erro">Slide com dados incompletos: {errosDados[0]}</div>
      ) : (
        <iframe
          ref={ref}
          title={rotulo || `Slide ${indice + 1}`}
          srcDoc={srcDoc}
          tabIndex={-1}
          style={{ width: L, height: A, transform: `scale(${escala})` }}
          onLoad={async () => {
            const w = ref.current?.contentWindow as any;
            if (!w?.__prismaPronto) return;
            await w.__prismaPronto;
            carregado.current = true;
            // se houve edição durante o carregamento, aplica agora
            const atual = chaveDoSlide(carrossel, indice);
            const sec = ref.current?.contentDocument?.querySelector(".slide");
            if (atual !== ultimaChave.current && sec) {
              ultimaChave.current = atual;
              sec.outerHTML = htmlDoSlide(carrossel, indice);
            }
            void aposAtualizar();
          }}
        />
      )}
    </div>
  );
}

export const QuadroSlide = memo(QuadroSlideBase, (a, b) =>
  a.largura === b.largura && a.indice === b.indice && a.inspecionar === b.inspecionar
  && a.carrossel.id === b.carrossel.id && chaveDoSlide(a.carrossel, a.indice) === chaveDoSlide(b.carrossel, b.indice)
  && a.onInspecao === b.onInspecao);
