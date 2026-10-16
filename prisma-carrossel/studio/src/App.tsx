// Navegação por hash: #/ (biblioteca) e #/editor/<id>.
import { useEffect, useState } from "react";
import { ProvedorAvisos } from "./componentes/Avisos";
import { Biblioteca } from "./telas/Biblioteca";
import { Editor } from "./telas/Editor";

function rotaAtual() {
  const m = location.hash.match(/^#\/editor\/([a-z0-9-]+)/);
  return m ? { tela: "editor" as const, id: m[1] } : { tela: "biblioteca" as const, id: "" };
}

export function irPara(caminho: string) { location.hash = caminho; }

export function App() {
  const [rota, setRota] = useState(rotaAtual());
  useEffect(() => {
    const f = () => setRota(rotaAtual());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return (
    <ProvedorAvisos>
      {rota.tela === "editor" ? <Editor key={rota.id} id={rota.id} /> : <Biblioteca />}
    </ProvedorAvisos>
  );
}
