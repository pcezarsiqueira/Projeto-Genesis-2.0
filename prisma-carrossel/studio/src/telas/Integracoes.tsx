// Integrações: fontes de imagens, chaves de API (guardadas só neste
// computador) e situação da IA. Os testes de conexão fazem uma busca real.
import { useEffect, useState } from "react";
import { apiUniv, type Fonte } from "../api";
import { useAvisos } from "../componentes/Avisos";
import { NavPrincipal } from "../componentes/NavPrincipal";
import { Marca } from "./Biblioteca";

type Estado = Awaited<ReturnType<typeof apiUniv.integracoes>>;

export function Integracoes() {
  const [e, setE] = useState<Estado | null>(null);
  const [unsplash, setUnsplash] = useState("");
  const [tmdb, setTmdb] = useState("");
  const [contato, setContato] = useState("");
  const [testes, setTestes] = useState<Record<string, { ok: boolean; texto: string } | "testando">>({});
  const { avisar } = useAvisos();

  const carregar = () => apiUniv.integracoes().then((x) => { setE(x); setContato(x.chaves.contato || ""); }).catch((err) => avisar(err.message, "erro"));
  useEffect(() => { void carregar(); }, []); // eslint-disable-line

  async function salvar(dados: Record<string, any>, msg: string) {
    try { const x = await apiUniv.salvarIntegracoes(dados); setE(x); avisar(msg); } catch (err: any) { avisar(err.message, "erro"); }
  }
  async function testar(f: Fonte) {
    setTestes((t) => ({ ...t, [f.id]: "testando" }));
    try {
      const r = await apiUniv.buscar(f.id, f.id === "tmdb" ? "Truman" : "magnifying glass");
      setTestes((t) => ({ ...t, [f.id]: { ok: true, texto: `Conectado: ${r.resultados.length} resultados reais para a busca de teste.` } }));
    } catch (err: any) {
      setTestes((t) => ({ ...t, [f.id]: { ok: false, texto: err.message } }));
    }
  }

  return (
    <div className="pagina">
      <header className="barra-topo"><Marca /><NavPrincipal ativa="integracoes" /></header>
      <main className="integracoes">
        <h1>Integrações</h1>
        <p className="dica">O PRISMA funciona sem nenhuma integração: biblioteca, editor e exportação são locais. As fontes abaixo ampliam a busca de imagens. Chaves ficam gravadas só neste computador (dados/config.json) e nunca são exibidas de volta.</p>

        <section className="cartao-config">
          <h2>Fontes de imagens e referências</h2>
          {e?.fontes.map((f) => {
            const t = testes[f.id];
            return (
              <div className="fonte-linha" key={f.id} data-fonte={f.id}>
                <div>
                  <b>{f.nome}</b> <span className={`selo selo--${f.configurado ? "ok" : "neutro"}`}>{f.configurado ? (f.precisaChave ? "Chave configurada" : "Aberta, sem chave") : "Não configurado"}</span>
                  <p className="dica">{f.descricao}</p>
                  {f.id === "unsplash" && (
                    <div className="linha-botoes">
                      <input type="password" value={unsplash} onChange={(x) => setUnsplash(x.target.value)} placeholder={e.chaves.unsplash || "Access Key do Unsplash"} aria-label="Access Key do Unsplash" autoComplete="off" />
                      <button className="botao botao--pequeno" disabled={!unsplash.trim()} onClick={() => { void salvar({ unsplash: { chave: unsplash } }, "Chave do Unsplash salva."); setUnsplash(""); }}>Salvar</button>
                      {f.configurado && <button className="botao-link" onClick={() => salvar({ unsplash: { chave: "" } }, "Chave removida.")}>Remover</button>}
                    </div>
                  )}
                  {f.id === "unsplash" && <p className="dica">Crie uma chave gratuita em unsplash.com/developers (aplicativo “Demo” serve para uso próprio).</p>}
                  {f.id === "tmdb" && (
                    <>
                      <div className="linha-botoes">
                        <input type="password" value={tmdb} onChange={(x) => setTmdb(x.target.value)} placeholder={e.chaves.tmdb || "Token de leitura da API (v4)"} aria-label="Token do TMDB" autoComplete="off" />
                        <button className="botao botao--pequeno" disabled={!tmdb.trim()} onClick={() => { void salvar({ tmdb: { token: tmdb } }, "Token do TMDB salvo."); setTmdb(""); }}>Salvar</button>
                        {f.configurado && <button className="botao-link" onClick={() => salvar({ tmdb: { token: "" } }, "Token removido.")}>Remover</button>}
                      </div>
                      <p className="dica">Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB. Resultados do TMDB são sempre referência cultural.</p>
                    </>
                  )}
                  {t && t !== "testando" && <p className={`dica ${t.ok ? "dica--ok" : "dica--erro"}`} data-teste={t.ok ? "ok" : "erro"}>{t.texto}</p>}
                </div>
                <button className="botao botao--pequeno" disabled={!f.configurado || t === "testando"} onClick={() => testar(f)}>{t === "testando" ? "Testando…" : "Testar conexão"}</button>
              </div>
            );
          })}
          <label className="campo campo--meio">
            <span className="campo-rotulo">E-mail de contato para as APIs (opcional)</span>
            <div className="linha-botoes">
              <input value={contato} onChange={(x) => setContato(x.target.value)} placeholder="voce@exemplo.com" />
              <button className="botao botao--pequeno" onClick={() => salvar({ contato }, "Contato salvo.")}>Salvar</button>
            </div>
            <span className="dica">A Wikimedia pede que aplicativos se identifiquem; o e-mail vai no cabeçalho das buscas.</span>
          </label>
        </section>

        <section className="cartao-config">
          <h2>Inteligência artificial</h2>
          <p><span className={`selo selo--${e?.ia.ativo ? "ok" : "neutro"}`} data-ia={e?.ia.ativo ? "ativa" : "inativa"}>{e?.ia.ativo ? `Ativa: ${e.ia.provedor}` : "Não configurada"}</span></p>
          <p className="dica">{e?.ia.mensagem || "Recomendações vêm do provedor configurado."}</p>
          <p className="dica">O aplicativo está preparado para conectar um provedor de IA (interface em servidor/ia.js) para interpretar slides, sugerir metáforas e analisar fotos autorizadas. Nenhuma API foi configurada nesta versão.</p>
          <label className="mb-aceite">
            <input type="checkbox" checked={!!e?.ia.consentimentoImagens} onChange={(x) => salvar({ ia: { consentimentoImagens: x.target.checked } }, "Preferência salva.")} />
            Permitir que, quando houver um provedor de IA configurado, minhas fotos pessoais sejam enviadas a ele para análise.
          </label>
          <p className="dica">Desligado por padrão. Mesmo ligado, nada é enviado enquanto nenhum provedor estiver configurado.</p>
        </section>
      </main>
    </div>
  );
}
