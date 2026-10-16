# PRISMA Studio — Carrosséis (v2.0)

Aplicativo local para criar, editar e exportar carrosséis 1080 × 1350 pelo navegador. Ele funciona sem terminal, sem GitHub e sem editar JSON durante o uso normal.

O motor da v1 (templates, renderização com Playwright, PNG/PDF/visão geral, validação) continua sendo a base, e o editor usa o mesmo código. O que você vê na prévia é o que vai para o PNG.

---

## Instalação no Windows

**Requisitos**
- Windows 10 ou 11.
- [Node.js LTS](https://nodejs.org/pt-br/download) (versão 18 ou mais nova). O instalador verifica e abre a página de download se faltar.
- Internet na primeira instalação.
- Para renderizar: o Chromium baixado pelo instalador (cerca de 150 MB). Se esse download falhar, o PRISMA usa o **Microsoft Edge**, que já vem no Windows, ou o Google Chrome.

**Passos**
1. Descompacte o pacote numa pasta sua (ex.: `Documentos\PRISMA`). Evite a pasta Downloads e pastas sincronizadas que bloqueiam arquivos.
2. Dê dois cliques em **`instalar-prisma.bat`**. Só na primeira vez.
3. Dê dois cliques em **`iniciar-prisma.bat`**. O navegador abre em `http://127.0.0.1:4317/`.

Deixe a janela preta aberta enquanto usa o aplicativo; fechá-la encerra o PRISMA. Se a porta 4317 estiver ocupada por outro programa, o PRISMA usa a próxima livre (4318, 4319…) e avisa na janela. Se ele já estiver aberto, o segundo duplo clique só abre o navegador.

No macOS ou Linux: `./iniciar-prisma.sh` (instala na primeira vez e abre o navegador).

> Não existe executável independente (.exe). O aplicativo roda com o Node.js instalado no computador.

---

## Uso

**Biblioteca** (tela inicial): todos os carrosséis, com capa, data, status e os botões Editar, Duplicar, Baixar ZIP e Excluir. Excluir pede confirmação e move o projeto para `dados/lixeira`, de onde ainda dá para recuperar.

**Criar carrossel**, de quatro jeitos:
- **Em branco**: capa, um item de lista e encerramento.
- **Duplicar existente**: copia textos, layouts e fotos.
- **Colar texto**: separe os slides com "SLIDE 1, SLIDE 2…" ou com linhas em branco. O PRISMA sugere um modelo para cada bloco, e você revisa título, texto e modelo antes de criar.
- **Importar JSON**: no formato do PRISMA. Vira um projeto novo e nunca sobrescreve um existente.

**Editor**
- **Esquerda**: os slides em miniatura real. Arraste para reordenar ou use ↑ ↓; ⧉ duplica, ✕ exclui, **+ Adicionar** escolhe o modelo do slide novo.
- **Centro**: o slide real em 4:5, com zoom (Ajustar, 50%, 75%, 100%) e **Visão geral** em mosaico. Abaixo da prévia fica a validação ao vivo: texto cortado, fora da margem de segurança, sobreposto, escondido, com contraste baixo ou pequeno demais.
- **Direita**, em três abas:
  - **Slide**: modelo, conteúdo, cor de fundo, alinhamento, tamanho do título (85–115%) e do texto (90–110%), e fotografia.
  - **Carrossel**: título do projeto, data, perfil, autor e o rótulo da lista ("Sinal", "Passo"…).
  - **Exportar**: todos os downloads.
- O salvamento é automático, com o estado no topo: Salvo, Alterações não salvas, Salvando ou Erro. Ctrl+Z desfaz, Ctrl+Shift+Z refaz, Ctrl+S salva na hora. Se você tentar fechar a aba com alterações pendentes, o navegador avisa.
- **Destaque**: selecione um trecho e clique em **Destacar seleção**. O trecho sai dourado no fundo escuro e com marca-texto no claro.

**Modelos (11 categorias)**: Capa de impacto, Provocação, Explicação, Lista numerada (com uma variante de dois itens por slide), Comparação, Exemplo, Suspense e continuidade, Checklist, CTA de salvamento, CTA de compartilhamento, Encerramento e comentário.

**Fotografias** (JPG, PNG ou WebP, até 20 MB, mínimo 400 px)
- Os modos de uso:
  - Capa: foto acima do título, ou foto de fundo com o texto num painel seguro.
  - Explicação: foto lateral.
  - Encerramento: retrato na assinatura.
  - Os demais modelos são só tipografia.
- O arquivo fica guardado exatamente como foi enviado.
- O recorte (posição e aproximação) e a exposição e o contraste (±15%) só mudam a forma de exibir. Não há geração, retoque ou alteração de rosto, pele, roupa ou cenário.

**Exportar e baixar**
- Cada botão salva o que estiver pendente, gera uma exportação nova se o conteúdo mudou, valida e então baixa pelo navegador. Você escolhe onde salvar, como em qualquer download.
- O que dá para baixar:
  - o slide atual (PNG);
  - todos os PNGs (ZIP);
  - o PDF;
  - a imagem de contato;
  - os dados do projeto (JSON);
  - **Baixar tudo (ZIP)**, por exemplo `PRISMA-Carrossel-2026-10-17.zip`, com PNGs, PDF, visão geral, prévia navegável, relatório de validação e o projeto com as fotos.
- **Por destino**:
  - Instagram e TikTok (modo foto): ZIP de PNGs 1080 × 1350.
  - LinkedIn: PDF.
  - Substack: ZIP de PNGs.
  - Todos saem da mesma fonte de conteúdo.

---

## Onde ficam os arquivos

| O quê | Onde |
|---|---|
| Projetos (conteúdo) | `dados/projetos/<id>/carrossel.json` |
| Fotos enviadas | `dados/projetos/<id>/fotos/` |
| Últimos arquivos gerados | `dados/projetos/<id>/exportacao/` |
| Versões anteriores (40 por projeto) | `dados/projetos/<id>/historico/` |
| Projetos excluídos | `dados/lixeira/` |
| Cópias feitas antes de importações | `dados/backups/` |

**Faça backup da pasta `dados/`.** É ali que está o seu trabalho.

Na primeira execução, os carrosséis de `carrosseis/` são importados para o Studio. É assim que o carrossel de 17/10/2026 já aparece pronto. Os arquivos aprovados da v1 continuam intactos em `saida/2026-10-17-manipulacao-opiniao/`.

---

## Segurança

- O servidor escuta só em `127.0.0.1` e recusa requisições com outro `Host` (proteção contra *DNS rebinding*). Nada é publicado na internet.
- Os identificadores de projeto e os nomes de arquivo são validados, e todo caminho é conferido contra a pasta autorizada (proteção contra *path traversal*).
- Os uploads são verificados pelos bytes do arquivo, não pela extensão. Arquivos que não são imagem são recusados.
- Nenhum comando de shell é montado a partir de texto do usuário. A única execução externa é abrir o navegador num endereço fixo.
- A gravação é atômica (arquivo temporário e depois troca), com a versão anterior guardada no histórico e controle de revisão contra duas abas editando o mesmo projeto.
- Uma exportação nova só substitui a anterior depois de terminar. Uma falha nunca apaga arquivos bons.
- Não há credenciais, chaves ou serviços externos.

---

## Para desenvolvedores

```bash
npm install                 # inclui as ferramentas de build da interface
npm run iniciar             # servidor em http://127.0.0.1:4317
npm run build:studio        # recompila a interface (studio/ → studio/dist)
npm run teste:e2e           # testes de aceitação no navegador (dados temporários)
npm run build -- <id>       # exportação pela linha de comando (motor v1)
```

```
prisma-carrossel/
├── src/                     MOTOR (JS puro, roda no Node e no navegador)
│   ├── documento.js           monta o HTML dos slides (exportador e prévia)
│   ├── templates.js           templates por função narrativa
│   ├── graficos.js            gráficos vetoriais e ícones
│   ├── catalogo.js            11 categorias, campos do editor, limites, modos de foto
│   ├── importar-texto.js      texto colado → blocos (sem IA; ponto de extensão FONTES)
│   ├── destinos.js            Instagram, TikTok, LinkedIn, Substack
│   ├── build.js               exportarCarrossel(): PNG, PDF, visão geral, validação
│   └── navegador/             ajuste.js (fontes + corpo), inspecao.js (medições)
├── design/                  tokens.css (cores/fontes), base.css, templates.css, fonts/
├── servidor/                Express: API, persistência, exportador, downloads
├── studio/                  interface React + TypeScript (Vite); dist/ já compilado
├── testes/e2e.mjs           testes de aceitação (Playwright)
├── carrosseis/              fonte original do carrossel de 17/10 (v1)
├── saida/                   arquivos aprovados da v1 (preservados)
├── instalar-prisma.bat / iniciar-prisma.bat / iniciar-prisma.sh
└── dados/                   criado na primeira execução (seus projetos)
```

- **Cores da marca**: `design/tokens.css`.
- **Novo modelo**: um template em `src/templates.js`, o CSS em `design/templates.css` e uma entrada em `src/catalogo.js`. A interface gera o formulário sozinha.
- **Integração futura com IA**: basta registrar em `FONTES` (`src/importar-texto.js`) uma função que devolva blocos `{ titulo, texto, itens, modelo }`. Nenhuma API está configurada.
- **Formato 1080 × 1920**: a arquitetura aceita (o `formato` fica no projeto e em `src/destinos.js`), mas falta criar templates próprios para o quadro vertical. Por isso a opção ainda não aparece.
