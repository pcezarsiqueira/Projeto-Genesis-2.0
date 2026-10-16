# PRISMA Studio — Carrosséis (v2.1)

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

## Universalidade visual (v2.1)

Ajuda a escolher referências que tornam uma ideia abstrata reconhecível: uma foto sua, uma situação do cotidiano, um filme conhecido, um episódio histórico, uma metáfora visual, ou nenhuma imagem quando a tipografia resolve melhor.

### Minha Biblioteca (menu superior)
- Envio de várias fotos de uma vez, álbuns (nove já criados: fotos profissionais, palestras, expressões, figurinos…), busca por nome, etiqueta ou descrição, favoritos.
- **Ponto de interesse**: clique na foto para marcar o que não pode ser cortado (por exemplo, seu rosto). Os recortes nos slides partem desse ponto.
- **Tipos e direitos de uso**:

| Tipo | Estado | Pode entrar na arte? |
|---|---|---|
| Foto pessoal / imagem própria | Aprovada para exportação | Sim |
| Licenciada (acervo ou banco de imagens) | Uso condicionado | Só depois de você conferir a licença e confirmar as condições, ou registrar uma autorização obtida |
| Referência de inspiração | Referência | Nunca: fica só para consulta |

- O servidor impede inserir imagens não aprovadas e a exportação aponta erro se uma aprovação for revogada depois.
- Substituir arquivo e remover pedem confirmação. Remover leva a imagem para `dados/lixeira/biblioteca`. Carrosséis que já usam a foto guardam a cópia deles, então as artes prontas não mudam.

### Aba "Referências" no editor
Para o slide selecionado, a aba mostra:
- a função editorial, o conceito central e a reação pretendida;
- o layout recomendado;
- referências do **repertório curado do PRISMA**, cada uma com o tipo de conexão (literal, metafórica, cultural, cotidiana, humorística, narrativa), a explicação, a familiaridade estimada, o risco de distração e a disponibilidade de imagem.
- Filtros: Minhas fotos, Cotidiano, Cinema e séries, Humor, Cultura brasileira, Metáforas, Imagens licenciadas, Apenas tipografia.
- **Selecionar** registra a referência escolhida e **não muda a arte**. **Rejeitar** esconde a sugestão nesse slide. **Usar foto pessoal** abre a biblioteca. **Buscar imagens** abre a busca em acervos com o termo da referência.
- Inserir uma imagem sempre pede confirmação: mostra o modo, o crédito exigido e um aviso se a resolução for baixa. Dá para desfazer com Ctrl+Z.
- **Pontuação 0–100**: estimativa editorial calculada por regras documentadas na própria aba (aderência ao conceito, familiaridade estimada, força metafórica, disponibilidade de imagem, função do slide, risco de distração). Não é previsão de alcance. A familiaridade é hipótese, sem dados de audiência.
- **Relatório**: `/download/<id>/universalidade` gera o documento com a análise de todos os slides.

**Como as sugestões são geradas:** cruzando o texto do slide (palavras-chave) com um repertório de cerca de 45 referências escritas à mão (`src/universalidade/repertorio.js`). **Não é IA e não é pesquisa na internet.** Filmes, séries, personagens e novelas aparecem sempre como **referência cultural**, sem direito de reutilizar imagens.

### Busca em acervos (conectores reais)

| Fonte | Chave | Uso das imagens |
|---|---|---|
| Wikimedia Commons | Não precisa | Licença lida arquivo por arquivo → uso condicionado |
| Openverse (Creative Commons) | Não precisa | Licença informada pela fonte → uso condicionado |
| Unsplash | Access Key gratuita sua (Integrações) | Licença Unsplash → uso condicionado |
| TMDB (filmes e séries) | Token gratuito seu (Integrações) | **Só referência**: não importável |

- Cada resultado registra título, miniatura, fonte, URL original, autor, licença, obrigações de atribuição, resolução, estado e data da consulta. Nada disso é inventado: o que a fonte não informa aparece como "não informado".
- Ao importar, o arquivo e os metadados vão para a biblioteca como **uso condicionado**. Os créditos entram na arte (opcional por slide) e no arquivo `creditos.txt` do ZIP.
- Se a fonte não responder, a tela mostra o erro real e um link para a **pesquisa manual** no site da fonte. Uma imagem achada assim pode ser cadastrada como "Licenciada", preenchendo fonte, autor e licença.
- O navegador nunca envia URLs para o servidor baixar. A importação usa só resultados que o próprio servidor obteve da API.

### IA
Nenhum provedor está configurado ou incluído. A interface de provedores está em `servidor/ia.js`. As fotos pessoais só seriam enviadas com consentimento específico (desligado por padrão, em Integrações) e com um provedor realmente configurado. Sem IA, a análise de fotos usa apenas as etiquetas e as descrições que você escreve.

### Exportação
- O ZIP inclui `creditos.txt` (texto pronto para a legenda e detalhes de licença).
- A exportação anterior é guardada em `dados/projetos/<id>/exportacao-anteriores/` (as últimas 5). As artes aprovadas da v1 continuam em `saida/`.

---

## Onde ficam os arquivos

| O quê | Onde |
|---|---|
| Projetos (conteúdo) | `dados/projetos/<id>/carrossel.json` |
| Fotos enviadas | `dados/projetos/<id>/fotos/` |
| Últimos arquivos gerados | `dados/projetos/<id>/exportacao/` |
| Versões anteriores (40 por projeto) | `dados/projetos/<id>/historico/` |
| Projetos excluídos | `dados/lixeira/` |
| Minha Biblioteca | `dados/biblioteca/` (imagens originais + biblioteca.json) |
| Chaves de integração | `dados/config.json` (só neste computador) |
| Exportações anteriores | `dados/projetos/<id>/exportacao-anteriores/` |
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
