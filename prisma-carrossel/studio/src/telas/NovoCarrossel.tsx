// Criação de carrossel: em branco, duplicando, a partir de texto colado
// (com revisão dos blocos antes de criar) ou importando um JSON.
import { useState } from "react";
import { api, type ItemBiblioteca } from "../api";
import { useAvisos } from "../componentes/Avisos";
import { irPara } from "../App";
// @ts-ignore módulos puros do motor
import { carrosselEmBranco, MODELOS } from "../../../src/catalogo.js";
// @ts-ignore
import { textoParaBlocos, blocoParaSlide } from "../../../src/importar-texto.js";
// @ts-ignore
import { validarDados } from "../../../src/documento.js";

type Aba = "branco" | "duplicar" | "texto" | "json";
type Bloco = { titulo: string; texto: string; itens: string[]; cta: string; numero: string; modelo: string };

const EXEMPLO = `SLIDE 1
5 SINAIS DE QUE VOCÊ ESTÁ CANSADO DEMAIS

SLIDE 2
1. Você relê o mesmo parágrafo três vezes.
E continua sem saber o que leu.

SLIDE 3
Antes de continuar, pergunte:
Dormi bem?
Comi alguma coisa?
Quando foi a última pausa?

SLIDE 4
Qual desses você reconhece?
Comente aqui embaixo.`;

export function NovoCarrossel({ existentes, onFechar }: { existentes: ItemBiblioteca[]; onFechar: () => void }) {
  const [aba, setAba] = useState<Aba>("branco");
  const [titulo, setTitulo] = useState("");
  const [publicacao, setPublicacao] = useState("");
  const [origem, setOrigem] = useState(existentes[0]?.id || "");
  const [texto, setTexto] = useState("");
  const [blocos, setBlocos] = useState<Bloco[] | null>(null);
  const [json, setJson] = useState<{ nome: string; dados: any; erros: string[] } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const { avisar } = useAvisos();

  async function criar(dados: any) {
    setOcupado(true);
    try {
      const r = await api.criar(dados);
      avisar(`Carrossel criado: ${r.dados.titulo}`);
      irPara(`/editor/${r.dados.id}`);
    } catch (e: any) {
      avisar(e.message, "erro");
    } finally { setOcupado(false); }
  }

  async function confirmar() {
    if (aba === "branco") return criar(carrosselEmBranco({ titulo: titulo.trim() || "Novo carrossel", publicacao }));
    if (aba === "duplicar") {
      setOcupado(true);
      try { const r = await api.duplicar(origem); avisar(`Cópia criada: ${r.dados.titulo}`); irPara(`/editor/${r.dados.id}`); }
      catch (e: any) { avisar(e.message, "erro"); } finally { setOcupado(false); }
      return;
    }
    if (aba === "texto") {
      if (!blocos) { const b = textoParaBlocos(texto); if (!b.length) return avisar("Cole algum texto primeiro.", "erro"); setBlocos(b); return; }
      const base = carrosselEmBranco({ titulo: titulo.trim() || blocos[0]?.titulo?.replace(/\*/g, "").slice(0, 80) || "Carrossel", publicacao });
      base.slides = blocos.map((b) => blocoParaSlide(b, base.perfil));
      return criar(base);
    }
    if (aba === "json" && json && !json.erros.length) {
      const { id, studio, ...resto } = json.dados;
      return criar({ ...resto, titulo: titulo.trim() || resto.titulo });
    }
  }

  function lerJson(arquivo: File | undefined) {
    if (!arquivo) return;
    if (arquivo.size > 3 * 1024 * 1024) return setJson({ nome: arquivo.name, dados: null, erros: ["Arquivo grande demais (máximo 3 MB)."] });
    arquivo.text().then((t) => {
      try {
        const dados = JSON.parse(t);
        dados.formato ||= { largura: 1080, altura: 1350 };
        try { validarDados(dados); setJson({ nome: arquivo.name, dados, erros: [] }); }
        catch (e: any) { setJson({ nome: arquivo.name, dados, erros: e.lista || [e.message] }); }
      } catch { setJson({ nome: arquivo.name, dados: null, erros: ["O arquivo não é um JSON válido."] }); }
    });
  }

  const alterarBloco = (i: number, campo: keyof Bloco, valor: any) =>
    setBlocos((bs) => bs!.map((b, k) => (k === i ? { ...b, [campo]: valor } : b)));

  const podeConfirmar = aba === "branco" || (aba === "duplicar" && origem) || (aba === "texto" && (blocos ? blocos.length > 0 : texto.trim()))
    || (aba === "json" && json && !json.erros.length);

  return (
    <div className="modal-fundo" onMouseDown={onFechar}>
      <div className="modal modal--grande" role="dialog" aria-modal="true" aria-labelledby="novo-titulo" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-cabeca">
          <h2 id="novo-titulo">Criar carrossel</h2>
          <button className="botao botao--icone" aria-label="Fechar" onClick={onFechar}>×</button>
        </div>
        <div className="abas" role="tablist">
          {([["branco", "Em branco"], ["duplicar", "Duplicar existente"], ["texto", "Colar texto"], ["json", "Importar JSON"]] as [Aba, string][]).map(([v, r]) => (
            <button key={v} role="tab" aria-selected={aba === v} className={`aba${aba === v ? " aba--ativa" : ""}`} onClick={() => { setAba(v); setBlocos(null); }}>{r}</button>
          ))}
        </div>

        <div className="modal-corpo">
          {aba !== "duplicar" && (
            <div className="linha-campos">
              <label className="campo">
                <span className="campo-rotulo">Título do projeto {aba !== "branco" && <em>(opcional)</em>}</span>
                <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: 7 erros de quem apresenta resultados" maxLength={200} />
              </label>
              <label className="campo campo--estreito">
                <span className="campo-rotulo">Data de publicação</span>
                <input type="date" value={publicacao} onChange={(e) => setPublicacao(e.target.value)} />
              </label>
            </div>
          )}

          {aba === "branco" && <p className="dica">Começa com capa, um item de lista e encerramento. Você adiciona e troca os modelos no editor.</p>}

          {aba === "duplicar" && (
            <label className="campo">
              <span className="campo-rotulo">Carrossel de origem</span>
              <select value={origem} onChange={(e) => setOrigem(e.target.value)}>
                {existentes.map((x) => <option key={x.id} value={x.id}>{x.titulo}</option>)}
              </select>
              <span className="dica">Copia textos, layouts e fotografias. O original não é alterado.</span>
            </label>
          )}

          {aba === "texto" && !blocos && (
            <label className="campo">
              <span className="campo-rotulo">Texto completo</span>
              <textarea className="area-grande" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={EXEMPLO} />
              <span className="dica">Separe os slides com “SLIDE 1”, “SLIDE 2”… ou com uma linha em branco. A primeira linha de cada bloco vira o título. Você revisa tudo antes de criar.</span>
            </label>
          )}

          {aba === "texto" && blocos && (
            <div className="blocos-revisao">
              <p className="dica">{blocos.length} slides identificados. Ajuste o modelo, o título e o texto de cada um.</p>
              {blocos.map((b, i) => (
                <div className="bloco-revisao" key={i}>
                  <div className="bloco-revisao-cabeca">
                    <strong>Slide {i + 1}</strong>
                    <select value={b.modelo} onChange={(e) => alterarBloco(i, "modelo", e.target.value)} aria-label={`Modelo do slide ${i + 1}`}>
                      {MODELOS.map((m: any) => <option key={m.id} value={m.id}>{m.categoria}{m.nome ? ` · ${m.nome}` : ""}</option>)}
                    </select>
                    <button className="botao botao--pequeno" disabled={i === 0} onClick={() => setBlocos((bs) => { const c = [...bs!]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; return c; })} aria-label="Mover para cima">↑</button>
                    <button className="botao botao--pequeno botao--fantasma-perigo" onClick={() => setBlocos((bs) => bs!.filter((_, k) => k !== i))}>Remover</button>
                  </div>
                  <input value={b.titulo} onChange={(e) => alterarBloco(i, "titulo", e.target.value)} placeholder="Título" aria-label={`Título do slide ${i + 1}`} />
                  <textarea value={b.itens.length ? b.itens.join("\n") : b.texto} rows={2}
                    onChange={(e) => (b.itens.length ? alterarBloco(i, "itens", e.target.value.split("\n")) : alterarBloco(i, "texto", e.target.value))}
                    placeholder={b.itens.length ? "Um item por linha" : "Texto"} aria-label={`Texto do slide ${i + 1}`} />
                </div>
              ))}
              <button className="botao botao--pequeno" onClick={() => setBlocos((bs) => [...bs!, { titulo: "", texto: "", itens: [], cta: "", numero: "", modelo: "explicacao" }])}>+ Adicionar bloco</button>
            </div>
          )}

          {aba === "json" && (
            <div className="campo">
              <span className="campo-rotulo">Arquivo .json (formato do PRISMA)</span>
              <input type="file" accept="application/json,.json" onChange={(e) => lerJson(e.target.files?.[0])} />
              {json && !json.erros.length && <p className="dica dica--ok">✓ {json.nome}: {json.dados.slides.length} slides, “{json.dados.titulo}”. Será criado como projeto novo, sem sobrescrever nenhum existente.</p>}
              {json && json.erros.length > 0 && <div className="faixa-erro"><b>{json.nome} não pode ser importado:</b><ul>{json.erros.map((e) => <li key={e}>{e}</li>)}</ul></div>}
            </div>
          )}
        </div>

        <div className="modal-acoes">
          {aba === "texto" && blocos && <button className="botao" onClick={() => setBlocos(null)}>← Voltar ao texto</button>}
          <button className="botao" onClick={onFechar}>Cancelar</button>
          <button className="botao botao--primario" disabled={!podeConfirmar || ocupado} onClick={confirmar}>
            {ocupado ? "Criando…" : aba === "texto" && !blocos ? "Identificar slides →" : aba === "duplicar" ? "Duplicar" : "Criar carrossel"}
          </button>
        </div>
      </div>
    </div>
  );
}
