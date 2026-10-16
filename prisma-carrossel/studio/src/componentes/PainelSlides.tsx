// Lista de slides: miniaturas reais, reordenação por arrastar e soltar,
// adicionar (escolhendo o modelo), duplicar e excluir.
import { useState } from "react";
import type { Carrossel } from "../tipos";
import { QuadroSlide } from "./QuadroSlide";
import { useAvisos } from "./Avisos";
// @ts-ignore
import { MODELOS, novoSlide, modeloDoSlide } from "../../../src/catalogo.js";

type Props = {
  carrossel: Carrossel;
  selecionado: number;
  onSelecionar: (i: number) => void;
  alterar: (fn: (c: Carrossel) => Carrossel, grupo?: string) => void;
};

export function PainelSlides({ carrossel: c, selecionado, onSelecionar, alterar }: Props) {
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [alvo, setAlvo] = useState<number | null>(null);
  const [menu, setMenu] = useState(false);
  const { confirmar } = useAvisos();

  function mover(de: number, para: number) {
    if (de === para) return;
    alterar((x) => {
      const slides = [...x.slides];
      const [s] = slides.splice(de, 1);
      slides.splice(para > de ? para - 1 : para, 0, s);
      return { ...x, slides };
    });
    onSelecionar(para > de ? para - 1 : para);
  }
  function adicionar(modelo: string) {
    alterar((x) => {
      const slides = [...x.slides];
      slides.splice(selecionado + 1, 0, novoSlide(modelo, x.perfil));
      return { ...x, slides };
    });
    onSelecionar(selecionado + 1);
    setMenu(false);
  }
  function duplicar(i: number) {
    alterar((x) => {
      const slides = [...x.slides];
      slides.splice(i + 1, 0, JSON.parse(JSON.stringify(x.slides[i])));
      return { ...x, slides };
    });
    onSelecionar(i + 1);
  }
  async function excluir(i: number) {
    if (c.slides.length <= 1) return;
    const ok = await confirmar({ titulo: `Excluir o slide ${i + 1}?`, texto: "Você pode desfazer com Ctrl+Z logo em seguida.", confirmar: "Excluir slide", perigo: true });
    if (!ok) return;
    alterar((x) => ({ ...x, slides: x.slides.filter((_, k) => k !== i) }));
    onSelecionar(Math.max(0, i - (i >= c.slides.length - 1 ? 1 : 0)));
  }

  return (
    <nav className="editor-esquerda" aria-label="Slides">
      <div className="esquerda-cabeca">
        <span>Slides</span>
        <div className="menu-ancora">
          <button className="botao botao--pequeno botao--primario" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>+ Adicionar</button>
          {menu && (
            <div className="menu" role="menu">
              {MODELOS.map((m: any) => (
                <button key={m.id} role="menuitem" className="menu-item" onClick={() => adicionar(m.id)}>
                  <b>{m.categoria}{m.nome ? ` · ${m.nome}` : ""}</b><span>{m.descricao}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <ol className="lista-slides">
        {c.slides.map((s, i) => (
          <li
            key={i}
            className={`miniatura${i === selecionado ? " ativa" : ""}${alvo === i && arrastando !== null ? " alvo" : ""}${arrastando === i ? " arrastando" : ""}`}
            draggable
            onDragStart={(e) => { setArrastando(i); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(i)); }}
            onDragOver={(e) => { e.preventDefault(); setAlvo(i); }}
            onDragEnd={() => { setArrastando(null); setAlvo(null); }}
            onDrop={(e) => { e.preventDefault(); const de = Number(e.dataTransfer.getData("text/plain")); const r = e.currentTarget.getBoundingClientRect(); mover(de, e.clientY > r.top + r.height / 2 ? i + 1 : i); setArrastando(null); setAlvo(null); }}
            data-slide={i + 1}
          >
            <button className="miniatura-botao" onClick={() => onSelecionar(i)} aria-label={`Slide ${i + 1}: ${modeloDoSlide(s).categoria}`} aria-current={i === selecionado}>
              <span className="miniatura-num">{i + 1}</span>
              <QuadroSlide carrossel={c} indice={i} largura={132} />
            </button>
            <div className="miniatura-rodape">
              <span className="miniatura-tipo">{modeloDoSlide(s).categoria}</span>
              <span className="miniatura-acoes">
                <button title="Mover para cima" aria-label={`Mover slide ${i + 1} para cima`} disabled={i === 0} onClick={() => mover(i, i - 1)}>↑</button>
                <button title="Mover para baixo" aria-label={`Mover slide ${i + 1} para baixo`} disabled={i === c.slides.length - 1} onClick={() => mover(i, i + 2)}>↓</button>
                <button title="Duplicar" aria-label={`Duplicar slide ${i + 1}`} onClick={() => duplicar(i)}>⧉</button>
                <button title="Excluir" aria-label={`Excluir slide ${i + 1}`} disabled={c.slides.length <= 1} onClick={() => excluir(i)}>✕</button>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
