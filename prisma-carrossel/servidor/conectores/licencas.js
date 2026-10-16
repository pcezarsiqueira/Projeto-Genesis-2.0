// Obrigações de uso derivadas da licença INFORMADA pela fonte.
// Nunca aprova nada sozinho: no máximo, deixa a imagem como "condicionado".
export function obrigacoesDaLicenca(licenca = "", { atribuicaoExigida } = {}) {
  const l = String(licenca);
  const itens = [];
  if (!l.trim()) return ["Licença não informada pela fonte: trate como referência, sem direito de reutilização."];
  if (/\bNC\b|non-?commercial/i.test(l)) itens.push("Uso NÃO comercial: inadequado se o perfil tiver fins comerciais ou patrocínio.");
  if (/\bND\b|no-?deriv/i.test(l)) itens.push("Não permite adaptações: recortar ou sobrepor texto pode violar a licença.");
  if (/CC0|public domain|domínio público|\bPDM\b|\bPD\b/i.test(l)) itens.push("A licença não exige crédito (creditar continua sendo boa prática).");
  else if (/BY-SA/i.test(l)) itens.push("Crédito obrigatório: autor, licença e link.", "Versões adaptadas devem ser compartilhadas sob a mesma licença.");
  else if (/\bBY\b|CC BY/i.test(l)) itens.push("Crédito obrigatório: autor, licença e link, indicando se houve alteração (recorte).");
  else if (/unsplash/i.test(l)) itens.push("Licença Unsplash: uso livre, inclusive comercial; não é permitido vender a foto sem modificação nem montar um serviço concorrente. Crédito recomendado.");
  else itens.push("Leia os termos da licença na página original antes de usar.");
  if (atribuicaoExigida && !itens.some((i) => i.startsWith("Crédito obrigatório"))) itens.push("A fonte indica que a atribuição é obrigatória.");
  itens.push("Licença do arquivo não cobre direitos de imagem de pessoas reconhecíveis nem marcas retratadas.");
  return itens;
}

export const semHtml = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();
