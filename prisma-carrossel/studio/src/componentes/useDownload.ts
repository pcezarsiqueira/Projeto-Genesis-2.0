// Download com exportação garantida: primeiro gera/valida os arquivos (com
// estado visível), depois entrega os bytes pelo navegador.
import { useState } from "react";
import { api, baixar } from "../api";
import { useAvisos } from "./Avisos";

export function useDownload() {
  const { avisar } = useAvisos();
  const [ocupado, setOcupado] = useState<string>("");
  async function baixarAtualizado(id: string, url: string, rotulo: string, antes?: () => Promise<boolean>) {
    if (ocupado) return;
    setOcupado(rotulo);
    try {
      if (antes && !(await antes())) throw new Error("Não foi possível salvar as últimas alterações. Tente novamente.");
      const { estado } = await api.exportar(id);
      baixar(url);
      if (estado.totalErros) avisar(`${rotulo}: download iniciado, mas a validação encontrou ${estado.totalErros} problema(s). Veja a aba Exportar.`, "erro");
      else avisar(`${rotulo}: download iniciado.`);
    } catch (e: any) {
      avisar(e.message || "Falha no download.", "erro");
    } finally {
      setOcupado("");
    }
  }
  return { ocupado, baixarAtualizado };
}
