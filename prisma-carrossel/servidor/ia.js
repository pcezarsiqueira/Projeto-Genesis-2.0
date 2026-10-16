// Interface de provedores de IA (opcional). NENHUM provedor está incluído ou
// ativo nesta versão: as recomendações vêm do repertório curado e de regras
// locais (src/universalidade). Para conectar um provedor no futuro, registre
// em PROVEDORES um objeto com:
//   { id, nome, configurado(cfg) → boolean,
//     recomendar({ carrossel, indice, recomendacaoLocal }) → mesma estrutura de recomendarParaSlide,
//     analisarImagem({ caminho, consentimento }) → { descricao, sugestoes } }
// Regras: nada é enviado sem configuração explícita; fotos pessoais só com
// consentimento específico (cfg.ia.consentimentoImagens); a interface deve
// mostrar que o resultado veio do provedor.
export const PROVEDORES = [];

export function statusIA(cfg) {
  const ativo = PROVEDORES.find((p) => p.configurado(cfg));
  return ativo
    ? { ativo: true, provedor: ativo.nome, consentimentoImagens: Boolean(cfg.ia?.consentimentoImagens) }
    : {
      ativo: false, provedor: null, consentimentoImagens: Boolean(cfg.ia?.consentimentoImagens),
      mensagem: "Nenhum provedor de IA configurado. As recomendações usam o repertório curado do PRISMA e regras locais; a análise de fotos usa apenas as etiquetas e descrições que você escreve.",
    };
}
