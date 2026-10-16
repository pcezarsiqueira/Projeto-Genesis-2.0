// Navegação entre as áreas do aplicativo.
export function NavPrincipal({ ativa }: { ativa: "carrosseis" | "biblioteca" | "integracoes" }) {
  const itens: [typeof ativa, string, string][] = [
    ["carrosseis", "Carrosséis", "#/"],
    ["biblioteca", "Minha Biblioteca", "#/biblioteca"],
    ["integracoes", "Integrações", "#/integracoes"],
  ];
  return (
    <nav className="nav-principal" aria-label="Áreas">
      {itens.map(([id, rotulo, href]) => (
        <a key={id} href={href} className={id === ativa ? "ativo" : ""} aria-current={id === ativa ? "page" : undefined}>{rotulo}</a>
      ))}
    </nav>
  );
}
