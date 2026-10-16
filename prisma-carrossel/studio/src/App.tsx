// Navegação por hash: #/ (biblioteca) e #/editor/<id>.
import { useEffect, useState } from "react";
import { ProvedorAvisos } from "./componentes/Avisos";
import { Biblioteca } from "./telas/Biblioteca";
import { Editor } from "./telas/Editor";
import { MinhaBiblioteca } from "./telas/MinhaBiblioteca";
import { Integracoes } from "./telas/Integracoes";

function rotaAtual() {
  const m = location.hash.match(/^#\/editor\/([a-z0-9-]+)/);
  if (m) return { tela: "editor" as const, id: m[1] };
  if (location.hash.startsWith("#/biblioteca")) return { tela: "imagens" as const, id: "" };
  if (location.hash.startsWith("#/integracoes")) return { tela: "integracoes" as const, id: "" };
  return { tela: "carrosseis" as const, id: "" };
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
      {rota.tela === "editor" ? <Editor key={rota.id} id={rota.id} />
        : rota.tela === "imagens" ? <MinhaBiblioteca />
        : rota.tela === "integracoes" ? <Integracoes />
        : <Biblioteca />}
    </ProvedorAvisos>
  );
}
