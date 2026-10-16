// Exportação e downloads. Cada botão salva as alterações pendentes, garante
// uma exportação atualizada e validada no servidor e só então baixa os bytes.
import { useEffect, useState } from "react";
import type { Carrossel, EstadoExportacao } from "../tipos";
import { api, urlsDownload, baixar, type Destino } from "../api";
import { useAvisos } from "./Avisos";
import type { EstadoSalvamento } from "../useProjeto";
import { dataBR } from "../telas/Biblioteca";

type Props = { carrossel: Carrossel; indice: number; salvarAgora: () => Promise<boolean>; estadoSalvamento: EstadoSalvamento };

export function PainelExportar({ carrossel: c, indice, salvarAgora, estadoSalvamento }: Props) {
  const [estado, setEstado] = useState<EstadoExportacao | null>(null);
  const [valida, setValida] = useState(false);
  const [ocupado, setOcupado] = useState("");
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const { avisar } = useAvisos();
  const u = urlsDownload(c.id);

  async function atualizar() {
    try { const r = await api.estadoExportacao(c.id); setEstado(r.estado); setValida(r.valida); } catch { /* sem estado ainda */ }
  }
  useEffect(() => { void atualizar(); api.destinos().then(setDestinos).catch(() => {}); }, [c.id]); // eslint-disable-line
  useEffect(() => { if (estadoSalvamento === "salvo") void atualizar(); }, [estadoSalvamento, JSON.stringify(c)]); // eslint-disable-line

  async function executar(rotulo: string, url?: string, forcar = false) {
    if (ocupado) return;
    setOcupado(rotulo);
    try {
      if (!(await salvarAgora())) throw new Error("Não foi possível salvar as alterações antes de exportar.");
      const r = await api.exportar(c.id, forcar);
      setEstado(r.estado); setValida(r.valida);
      if (url) baixar(url);
      if (r.estado.totalErros) avisar(`Exportação concluída com ${r.estado.totalErros} alerta(s) de validação. Confira abaixo.`, "erro");
      else avisar(url ? `${rotulo}: download iniciado.` : "Exportação concluída e validada.");
    } catch (e: any) {
      avisar(e.message || "Falha na exportação.", "erro");
    } finally { setOcupado(""); }
  }

  const B = ({ rotulo, url, primario }: { rotulo: string; url: string; primario?: boolean }) => (
    <button className={`botao ${primario ? "botao--primario botao--grande" : ""}`} disabled={!!ocupado} onClick={() => executar(rotulo, url)} data-download={rotulo}>
      {ocupado === rotulo ? "Gerando…" : rotulo}
    </button>
  );

  const comProblema = estado?.resumo.filter((s) => s.erros.length) || [];
  return (
    <div className="painel" data-testid="painel-exportar">
      <section className="secao">
        <h3>Situação</h3>
        {ocupado ? <div className="estado-exportacao estado-exportacao--andamento" data-estado="andamento">⏳ {ocupado}: renderizando e validando os {c.slides.length} slides…</div>
          : !estado ? <div className="estado-exportacao" data-estado="nenhuma">Ainda não exportado.</div>
          : valida ? <div className={`estado-exportacao ${estado.totalErros ? "estado-exportacao--alerta" : "estado-exportacao--ok"}`} data-estado={estado.totalErros ? "alerta" : "ok"}>
              {estado.totalErros ? `⚠ Exportado com ${estado.totalErros} alerta(s)` : "✓ Arquivos atualizados e validados"} · {dataBR(estado.quando)}
            </div>
          : <div className="estado-exportacao estado-exportacao--alerta" data-estado="desatualizado">Há alterações desde a última exportação ({dataBR(estado.quando)}). Os downloads geram uma versão nova automaticamente.</div>}
        <button className="botao botao--pequeno" disabled={!!ocupado} onClick={() => executar("Exportação", undefined, true)}>Renderizar novamente agora</button>
      </section>

      <section className="secao">
        <h3>Baixar</h3>
        <B rotulo="Baixar tudo (ZIP)" url={u.zip} primario />
        <p className="dica">PNGs, PDF, visão geral, prévia, relatório de validação e dados do projeto com as fotos.</p>
        <div className="grade-botoes">
          <B rotulo={`Slide ${indice + 1} (PNG)`} url={u.slide(indice + 1)} />
          <B rotulo="Todos os PNGs (ZIP)" url={u.pngs} />
          <B rotulo="PDF completo" url={u.pdf} />
          <B rotulo="Imagem de contato" url={u.visaoGeral} />
        </div>
        <button className="botao botao--pequeno" onClick={async () => { await salvarAgora(); baixar(u.projeto); }}>Exportar dados do projeto (JSON)</button>
      </section>

      <section className="secao">
        <h3>Por destino</h3>
        <div className="lista-destinos">
          {destinos.map((d) => (
            <div className="destino" key={d.id}>
              <div><b>{d.nome}</b><span>{d.descricao}</span></div>
              <B rotulo={`Baixar para ${d.nome}`} url={u.destino(d.id)} />
            </div>
          ))}
        </div>
      </section>

      {estado && (
        <section className="secao">
          <h3>Validação da última exportação</h3>
          {comProblema.length === 0 && !estado.errosArquivos.length
            ? <p className="dica dica--ok">✓ Dimensões, textos, área segura, cortes, sobreposições, contraste e PDF conferidos em {estado.slides} slides.</p>
            : <ul className="lista-problemas">
                {comProblema.map((s) => <li key={s.slide}><b>Slide {s.slide}:</b> {s.erros.join("; ")}</li>)}
                {estado.errosArquivos.map((e) => <li key={e}>{e}</li>)}
              </ul>}
          <p className="dica">Renderizado com {estado.navegador || "Chromium"} em {estado.segundos?.toFixed?.(1)} s.</p>
        </section>
      )}
    </div>
  );
}
