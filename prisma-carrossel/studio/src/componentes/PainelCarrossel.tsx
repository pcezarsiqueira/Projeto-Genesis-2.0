// Dados gerais do carrossel: título do projeto, data, autor, perfil e rótulo
// usado nos itens da lista ("Sinal 1 de 5", "Passo 2 de 4"…).
import type { Carrossel } from "../tipos";

type Alterar = (fn: (c: Carrossel) => Carrossel, grupo?: string) => void;

export function PainelCarrossel({ carrossel: c, alterar }: { carrossel: Carrossel; alterar: Alterar }) {
  const set = (k: string, v: any) => alterar((x) => ({ ...x, [k]: v }), `carrossel:${k}`);
  return (
    <div className="painel">
      <section className="secao">
        <h3>Projeto</h3>
        <label className="campo"><span className="campo-rotulo">Título do projeto</span>
          <input value={c.titulo} onChange={(e) => set("titulo", e.target.value)} maxLength={200} />
          <span className="dica">Só para organizar a biblioteca. Não aparece nos slides.</span>
        </label>
        <label className="campo campo--estreito"><span className="campo-rotulo">Data de publicação</span>
          <input type="date" value={c.publicacao || ""} onChange={(e) => set("publicacao", e.target.value)} />
          <span className="dica">Usada no nome dos arquivos baixados.</span>
        </label>
      </section>
      <section className="secao">
        <h3>Assinatura</h3>
        <label className="campo"><span className="campo-rotulo">Perfil (aparece no topo de cada slide)</span>
          <input value={c.perfil || ""} onChange={(e) => set("perfil", e.target.value)} maxLength={40} />
        </label>
        <label className="campo"><span className="campo-rotulo">Nome do autor (faixa do encerramento)</span>
          <input value={c.autor || ""} onChange={(e) => set("autor", e.target.value)} maxLength={60} />
        </label>
      </section>
      <section className="secao">
        <h3>Lista numerada</h3>
        <label className="campo"><span className="campo-rotulo">Rótulo dos itens</span>
          <input value={c.rotulo_lista ?? "Sinal"} onChange={(e) => set("rotulo_lista", e.target.value)} maxLength={20} />
          <span className="dica">Ex.: “Sinal” → “SINAL 1 DE 5”. O total é calculado pelos números dos slides.</span>
        </label>
      </section>
      <section className="secao">
        <h3>Formato</h3>
        <p className="dica">{c.formato.largura} × {c.formato.altura} px (4:5). Formatos verticais 1080 × 1920 exigem templates próprios e ainda não estão disponíveis.</p>
      </section>
    </div>
  );
}
