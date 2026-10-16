// Escolha de uma imagem da Minha Biblioteca (ou envio de uma foto sua na hora).
// Imagens não aprovadas aparecem, mas não podem ser escolhidas.
import { useEffect, useRef, useState } from "react";
import { apiUniv, ROTULO_STATUS, ROTULO_TIPO_IMAGEM, type ImagemBiblioteca } from "../api";
import { useAvisos } from "./Avisos";

export function SeletorImagem({ onEscolher, onFechar, filtroInicial = "" }: { onEscolher: (im: ImagemBiblioteca) => void; onFechar: () => void; filtroInicial?: string }) {
  const [imagens, setImagens] = useState<ImagemBiblioteca[]>([]);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState(filtroInicial);
  const [enviando, setEnviando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  const { avisar } = useAvisos();
  const carregar = () => apiUniv.biblioteca().then((b) => setImagens(b.imagens)).catch((e) => avisar(e.message, "erro"));
  useEffect(() => { void carregar(); }, []); // eslint-disable-line

  async function enviar(f?: File) {
    if (!f) return;
    setEnviando(true);
    try { const r = await apiUniv.enviarImagem(f, "pessoal", []); if (r.aviso) avisar(r.aviso, "info"); await carregar(); }
    catch (e: any) { avisar(e.message, "erro"); } finally { setEnviando(false); if (entrada.current) entrada.current.value = ""; }
  }
  const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const lista = imagens.filter((im) => (!tipo || im.tipo === tipo) && (!q || norm([im.nome, im.descricao, ...im.etiquetas].join(" ")).includes(norm(q))));

  return (
    <div className="modal-fundo" onMouseDown={onFechar}>
      <div className="modal modal--grande" role="dialog" aria-modal="true" aria-labelledby="sel-titulo" onMouseDown={(e) => e.stopPropagation()} data-testid="seletor-imagem">
        <div className="modal-cabeca"><h2 id="sel-titulo">Escolher da Minha Biblioteca</h2><button className="botao botao--icone" aria-label="Fechar" onClick={onFechar}>×</button></div>
        <div className="modal-corpo">
          <div className="mb-ferramentas">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou etiqueta" aria-label="Buscar" />
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Tipo">
              <option value="">Todos os tipos</option>
              {Object.entries(ROTULO_TIPO_IMAGEM).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
            </select>
            <input ref={entrada} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => enviar(e.target.files?.[0])} data-testid="seletor-enviar" />
            <button className="botao botao--pequeno" disabled={enviando} onClick={() => entrada.current?.click()}>{enviando ? "Enviando…" : "Enviar foto minha"}</button>
          </div>
          {lista.length === 0 && <p className="dica">Nenhuma imagem. Envie uma foto sua ou cadastre imagens em Minha Biblioteca.</p>}
          <div className="seletor-grade">
            {lista.map((im) => {
              const pode = im.status === "aprovado" && im.tipo !== "inspiracao";
              return (
                <button key={im.id} className={`seletor-item${pode ? "" : " bloqueado"}`} disabled={!pode} onClick={() => onEscolher(im)} data-imagem={im.id}
                  title={pode ? `Usar “${im.nome}”` : im.tipo === "inspiracao" ? "Referência de inspiração: não entra na arte" : "Ainda não aprovada: confira a licença na Minha Biblioteca"}>
                  <img src={apiUniv.urlImagem(im.id, im.atualizadaEm)} alt="" style={{ objectPosition: `${im.foco.x}% ${im.foco.y}%` }} />
                  <b>{im.nome}</b>
                  <span>{ROTULO_TIPO_IMAGEM[im.tipo]} · {ROTULO_STATUS[im.status]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
