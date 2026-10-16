// Busca em acervos externos (conectores reais do servidor). Nada é simulado:
// se a fonte não responde, mostramos o erro real e o link da pesquisa manual.
import { useEffect, useState } from "react";
import { apiUniv, ROTULO_STATUS, type Fonte, type ResultadoBusca, type ImagemBiblioteca } from "../api";
import { useAvisos } from "./Avisos";

type Props = { termoInicial?: string; albuns?: string[]; onImportada?: (im: ImagemBiblioteca) => void; compacto?: boolean };

export function BuscaExterna({ termoInicial = "", albuns = [], onImportada, compacto }: Props) {
  const [fontes, setFontes] = useState<Fonte[]>([]);
  const [fonte, setFonte] = useState("wikimedia");
  const [termo, setTermo] = useState(termoInicial);
  const [estado, setEstado] = useState<"parado" | "buscando" | "ok" | "erro">("parado");
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [erro, setErro] = useState("");
  const [urlManual, setUrlManual] = useState("");
  const [importando, setImportando] = useState("");
  const { avisar } = useAvisos();

  useEffect(() => { apiUniv.fontes().then(setFontes).catch(() => {}); }, []);
  useEffect(() => { setTermo(termoInicial); }, [termoInicial]);

  async function buscar(e?: React.FormEvent) {
    e?.preventDefault();
    if (!termo.trim()) return;
    setEstado("buscando"); setErro(""); setResultados([]);
    try {
      const r = await apiUniv.buscar(fonte, termo.trim());
      setResultados(r.resultados); setUrlManual(r.urlManual); setEstado("ok");
    } catch (e: any) {
      setErro(e.message); setUrlManual(e.extra?.urlManual || ""); setEstado("erro");
    }
  }
  async function importar(r: ResultadoBusca) {
    setImportando(r.id);
    try {
      const { imagem } = await apiUniv.importar(r.id, albuns);
      avisar(`Importada para a Minha Biblioteca como “uso condicionado”. Confira a licença e aprove antes de usar.`);
      onImportada?.(imagem);
    } catch (e: any) { avisar(e.message, "erro"); } finally { setImportando(""); }
  }

  const atual = fontes.find((f) => f.id === fonte);
  return (
    <div className={`busca-externa${compacto ? " busca-externa--compacta" : ""}`} data-testid="busca-externa">
      <form className="busca-linha" onSubmit={buscar}>
        <select value={fonte} onChange={(e) => setFonte(e.target.value)} aria-label="Fonte">
          {fontes.map((f) => <option key={f.id} value={f.id}>{f.nome}{f.configurado ? "" : " (não configurado)"}</option>)}
        </select>
        <input value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="Ex.: hall of mirrors, fila, lupa" aria-label="Termo de busca" />
        <button className="botao botao--primario" disabled={estado === "buscando" || !termo.trim()}>{estado === "buscando" ? "Buscando…" : "Buscar"}</button>
      </form>
      {atual && <p className="dica">{atual.descricao}{atual.somenteReferencia ? " Resultados servem só como referência." : ""} Acervos em inglês costumam responder melhor a termos em inglês.</p>}

      {estado === "erro" && (
        <div className="faixa-erro" data-testid="erro-busca">
          <b>A busca não pôde ser feita.</b> {erro}
          {urlManual && <p className="dica">Pesquisa manual: <a href={urlManual} target="_blank" rel="noopener noreferrer">abrir a busca de “{termo}” no site da fonte</a>. Se encontrar uma imagem, baixe e cadastre em Minha Biblioteca como <b>Licenciada</b>, preenchendo fonte, autor e licença.</p>}
        </div>
      )}
      {estado === "ok" && resultados.length === 0 && <p className="dica">Nenhum resultado para “{termo}”. Tente outro termo{urlManual ? <> ou a <a href={urlManual} target="_blank" rel="noopener noreferrer">pesquisa manual</a></> : null}.</p>}

      {resultados.length > 0 && (
        <div className="resultados" data-testid="resultados-busca">
          {resultados.map((r) => (
            <article className="resultado" key={r.id} data-resultado={r.status}>
              <div className="resultado-img">{r.miniatura ? <img src={r.miniatura} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span>sem prévia</span>}</div>
              <div className="resultado-info">
                <b title={r.titulo}>{r.titulo}</b>
                <span>{r.fonte}{r.autor ? ` · ${r.autor}` : ""}</span>
                <span>{r.licenca ? (r.licencaUrl ? <a href={r.licencaUrl} target="_blank" rel="noopener noreferrer">{r.licenca}</a> : r.licenca) : "Licença não informada"}{r.largura ? ` · ${r.largura}×${r.altura}` : ""}</span>
                <span className={`selo selo--${r.status === "condicionado" ? "alerta" : "neutro"}`}>{ROTULO_STATUS[r.status]}</span>
                {r.resumo && <span className="resultado-resumo">{r.resumo.slice(0, 160)}{r.resumo.length > 160 ? "…" : ""}</span>}
                <details><summary>Condições de uso</summary><ul>{r.obrigacoes.map((o) => <li key={o}>{o}</li>)}</ul><p className="dica">Consultado em {new Date(r.consultadoEm).toLocaleString("pt-BR")}.</p></details>
                <div className="resultado-acoes">
                  <a className="botao botao--pequeno" href={r.urlOriginal} target="_blank" rel="noopener noreferrer">Ver original</a>
                  {r.importavel
                    ? <button className="botao botao--pequeno botao--primario" disabled={!!importando} onClick={() => importar(r)}>{importando === r.id ? "Importando…" : "Importar para a biblioteca"}</button>
                    : <span className="dica">Só referência</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
