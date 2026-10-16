// Tela inicial: carrosséis existentes, criação, duplicação, download e exclusão.
import { useEffect, useState } from "react";
import { api, urlsDownload, type ItemBiblioteca } from "../api";
import { QuadroSlide } from "../componentes/QuadroSlide";
import { useAvisos } from "../componentes/Avisos";
import { useDownload } from "../componentes/useDownload";
import { NovoCarrossel } from "./NovoCarrossel";
import { irPara } from "../App";

const STATUS: Record<string, [string, string]> = {
  rascunho: ["Rascunho", "neutro"],
  exportado: ["Pronto para baixar", "ok"],
  "exportado-com-erros": ["Exportado com alertas", "alerta"],
  desatualizado: ["Alterado desde a última exportação", "alerta"],
};

export function dataBR(iso?: string | null) {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(iso);
  return isNaN(+d) ? "" : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function Marca() {
  return (
    <a className="marca" href="#/">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><rect width="32" height="32" rx="7" fill="#1d1e21" /><path d="M16 7l9 17H7z" fill="none" stroke="#e3b23c" strokeWidth="2.6" strokeLinejoin="round" /></svg>
      <span><b>PRISMA</b> Studio</span>
    </a>
  );
}

export function Biblioteca() {
  const [itens, setItens] = useState<ItemBiblioteca[] | null>(null);
  const [erro, setErro] = useState("");
  const [novo, setNovo] = useState(false);
  const { avisar, confirmar } = useAvisos();
  const { ocupado, baixarAtualizado } = useDownload();

  async function carregar() {
    try { setItens(await api.listar()); setErro(""); } catch (e: any) { setErro(e.message); }
  }
  useEffect(() => { void carregar(); }, []);

  async function duplicar(id: string) {
    try { const r = await api.duplicar(id); avisar(`Cópia criada: ${r.dados.titulo}`); await carregar(); } catch (e: any) { avisar(e.message, "erro"); }
  }
  async function excluir(item: ItemBiblioteca) {
    const ok = await confirmar({
      titulo: "Excluir carrossel?",
      texto: `"${item.titulo}" sai da biblioteca e vai para a lixeira do PRISMA (pasta dados/lixeira), de onde ainda pode ser recuperado manualmente.`,
      confirmar: "Excluir", perigo: true,
    });
    if (!ok) return;
    try { await api.excluir(item.id); avisar("Carrossel movido para a lixeira."); await carregar(); } catch (e: any) { avisar(e.message, "erro"); }
  }

  return (
    <div className="pagina">
      <header className="barra-topo">
        <Marca />
        <div className="barra-topo-acoes">
          <button className="botao botao--primario" onClick={() => setNovo(true)}>+ Criar carrossel</button>
        </div>
      </header>
      <main className="biblioteca">
        <div className="biblioteca-cabeca">
          <h1>Carrosséis</h1>
          <p>{itens ? `${itens.length} ${itens.length === 1 ? "projeto" : "projetos"}` : "Carregando…"}</p>
        </div>
        {erro && <div className="faixa-erro">{erro} <button className="botao botao--pequeno" onClick={carregar}>Tentar de novo</button></div>}
        {itens && itens.length === 0 && (
          <div className="vazio">
            <p>Nenhum carrossel ainda.</p>
            <button className="botao botao--primario" onClick={() => setNovo(true)}>Criar o primeiro</button>
          </div>
        )}
        <div className="grade-cartoes">
          {itens?.map((it) => {
            const [rotulo, tom] = STATUS[it.status] || STATUS.rascunho;
            return (
              <article key={it.id} className="cartao-projeto" data-projeto={it.id}>
                <button className="cartao-capa" onClick={() => irPara(`/editor/${it.id}`)} aria-label={`Abrir ${it.titulo}`}>
                  <QuadroSlide carrossel={it.dados} indice={0} largura={232} rotulo={`Capa de ${it.titulo}`} />
                </button>
                <div className="cartao-info">
                  <h2 title={it.titulo}>{it.titulo}</h2>
                  <p className="cartao-meta">
                    {it.publicacao ? `Publicação ${dataBR(it.publicacao)} · ` : ""}{it.slides} slides
                  </p>
                  <span className={`selo selo--${tom}`}>{it.exportando ? "Exportando…" : rotulo}</span>
                  <p className="cartao-meta cartao-meta--fraco">Editado {dataBR(it.atualizadoEm)}</p>
                </div>
                <div className="cartao-acoes">
                  <button className="botao botao--pequeno botao--primario" onClick={() => irPara(`/editor/${it.id}`)}>Editar</button>
                  <button className="botao botao--pequeno" onClick={() => duplicar(it.id)}>Duplicar</button>
                  <button className="botao botao--pequeno" disabled={!!ocupado}
                    onClick={async () => { await baixarAtualizado(it.id, urlsDownload(it.id).zip, "ZIP completo"); void carregar(); }}>
                    {ocupado ? "Gerando…" : "Baixar ZIP"}
                  </button>
                  <button className="botao botao--pequeno botao--fantasma-perigo" onClick={() => excluir(it)}>Excluir</button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
      {novo && <NovoCarrossel existentes={itens || []} onFechar={() => setNovo(false)} />}
    </div>
  );
}
