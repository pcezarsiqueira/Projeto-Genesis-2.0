// Notificações (sucesso, erro, processamento) e diálogo de confirmação.
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Tipo = "ok" | "erro" | "info";
type Aviso = { id: number; tipo: Tipo; texto: string };
type Confirmacao = { titulo: string; texto: string; confirmar: string; perigo?: boolean; resolver: (v: boolean) => void };

const Ctx = createContext<{
  avisar: (texto: string, tipo?: Tipo) => void;
  confirmar: (o: Omit<Confirmacao, "resolver">) => Promise<boolean>;
}>({ avisar: () => {}, confirmar: async () => false });

export const useAvisos = () => useContext(Ctx);

export function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [conf, setConf] = useState<Confirmacao | null>(null);
  const seq = useRef(0);
  const avisar = useCallback((texto: string, tipo: Tipo = "ok") => {
    const id = ++seq.current;
    setAvisos((a) => [...a, { id, tipo, texto }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), tipo === "erro" ? 9000 : 4500);
  }, []);
  const confirmar = useCallback((o: Omit<Confirmacao, "resolver">) =>
    new Promise<boolean>((resolver) => setConf({ ...o, resolver })), []);
  const fechar = (v: boolean) => { conf?.resolver(v); setConf(null); };
  return (
    <Ctx.Provider value={{ avisar, confirmar }}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`aviso aviso--${a.tipo}`}>
            <span>{a.texto}</span>
            <button className="aviso-fechar" aria-label="Fechar" onClick={() => setAvisos((x) => x.filter((y) => y.id !== a.id))}>×</button>
          </div>
        ))}
      </div>
      {conf && (
        <div className="modal-fundo" onMouseDown={() => fechar(false)}>
          <div className="modal modal--pequeno" role="alertdialog" aria-modal="true" aria-labelledby="conf-titulo" onMouseDown={(e) => e.stopPropagation()}>
            <h2 id="conf-titulo">{conf.titulo}</h2>
            <p className="modal-texto">{conf.texto}</p>
            <div className="modal-acoes">
              <button className="botao" onClick={() => fechar(false)}>Cancelar</button>
              <button className={`botao ${conf.perigo ? "botao--perigo" : "botao--primario"}`} autoFocus onClick={() => fechar(true)}>{conf.confirmar}</button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
