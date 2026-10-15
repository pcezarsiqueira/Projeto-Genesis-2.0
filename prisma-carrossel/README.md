# PRISMA · motor de carrosséis (v1.0)

Gera carrosséis 1080 × 1350 a partir de um arquivo de dados. Um comando produz os PNGs, o PDF, a folha de contato, a prévia navegável e um relatório de validação.

## Rodar

```bash
cd prisma-carrossel
npm install          # só na primeira vez
npm run build        # gera o carrossel mais recente de carrosseis/
npm run build -- 2026-10-17-manipulacao-opiniao   # ou um específico
npm run validar      # revalida o que já foi exportado, sem renderizar de novo
```

Requisitos: Node 18+ e o Chromium do Playwright. Se o Chromium não estiver instalado, rode `npx playwright install chromium` uma vez.

O build termina com código 1 se a validação encontrar algum erro.

## O que sai

Em `saida/<id-do-carrossel>/`:

| Arquivo | O que é |
|---|---|
| `slide-01.png` … `slide-09.png` | Slides finais, 1080 × 1350 px |
| `carrossel-completo.pdf` | Todos os slides em sequência, texto vetorial |
| `visao-geral.png` | Folha de contato com todas as miniaturas |
| `previa.html` | Prévia navegável estilo feed (setas, teclado, arrastar) |
| `relatorio-validacao.md` / `.json` | Resultado das checagens |
| `fonte/slides.html` | O HTML que foi fotografado; abre no navegador para depurar |

## Onde mexer

| Quero mudar… | Arquivo |
|---|---|
| Textos, ordem, template e fundo de cada slide | `carrosseis/<id>/carrossel.json` |
| Cores, fontes, tamanhos, margens | `design/tokens.css` |
| Composição de um template | `design/templates.css` + `src/templates.js` |
| Gráficos e ícones | `src/graficos.js` |
| Fotografias | coloque em `assets/` e referencie no JSON (abaixo) |

### Criar um carrossel novo

1. Copie `carrosseis/2026-10-17-manipulacao-opiniao/` para `carrosseis/<data>-<tema>/`.
2. Troque o `id` e os textos no `carrossel.json`.
3. `npm run build -- <data>-<tema>`

O número de slides é livre. A numeração `01 / NN` e o "Sinal X de N" se ajustam sozinhos.

### Marcação de texto

- `*palavra*` destaca na cor de acento (texto dourado no fundo escuro, marca-texto no claro).
- Quebras de linha são automáticas e balanceadas. Palavras de uma letra (a, o, e, é) nunca ficam soltas no fim da linha.
- Títulos têm ajuste automático de corpo: se o texto for longo, a fonte diminui até caber, sem passar do mínimo definido no template. Se mesmo assim não couber, a validação acusa erro.

### Templates disponíveis

| `template` | Função | Campos |
|---|---|---|
| `capa` | Interromper a rolagem | `numero`, `titulo`, `chamada`, `foto` (opcional) |
| `pergunta` | Identificação / provocação | `titulo`, `complemento`, `grafico` |
| `sinal` | Um item da lista | `numero`, `titulo`, `texto`, `grafico`, `grafico_rotulos`, `cta` (opcional), `variante` (`a`, `b`, `c`; padrão automático) |
| `destaque` | Pedido de salvamento / suspense | `titulo`, `complemento`, `progresso: {vistos, total}` |
| `sinal-duplo` | Dois itens no mesmo slide | `blocos: [{numero, titulo, texto, grafico}, …]` |
| `checklist` | Ferramenta prática | `titulo`, `itens: [...]` |
| `encerramento` | Comentário + seguir | `titulo`, `cta: {icone, texto}`, `assinatura` |

`fundo`: `escuro`, `claro`, `suave` ou `acento`.
`grafico`: `feed`, `medidor`, `sobreposicao`, `multidao`, `excluido`, `imagem-falsa`, `barras`.
`cta.icone`: `compartilhar`, `comentar`, `salvar`.

### Fotografias

Coloque o arquivo original em `assets/` e adicione ao slide:

```json
"foto": { "arquivo": "retrato.jpg", "posicao": "center 30%", "exposicao": 1.05, "contraste": 1.0, "descricao": "Paulinho no palco" }
```

O sistema só recorta, posiciona e ajusta exposição/contraste dentro de ±15%. Não há nenhum filtro que altere rosto, pele, roupa ou cenário. Hoje a foto é suportada no template `capa`; sem foto, a capa é tipográfica.

## O que a validação confere

Roda no navegador, depois de todas as fontes carregarem e do ajuste de corpo:

- todos os textos do JSON aparecem no slide;
- nenhuma caixa sai da área de segurança (90 px laterais, 120 px no topo);
- nenhuma linha de texto é cortada pela borda ou escapa da própria caixa;
- caixas não se sobrepõem; nenhum texto fica encoberto por outro elemento;
- corpo mínimo de 24 px (≈ 8,7 px numa tela de 390 px) e contraste WCAG (4,5:1 ou 3:1 para texto grande);
- avisos para corpo reduzido, palavra curta isolada no fim de título e linhas acima de 44 caracteres.

Nos arquivos: dimensão exata de cada PNG, PDF com o número certo de páginas, cada página contendo o título do slide correspondente (confere a ordem), tamanho de página, visão geral e prévia presentes.

## Estrutura

```
prisma-carrossel/
├── carrosseis/<id>/carrossel.json   dados de cada carrossel
├── design/                          tokens.css, base.css, templates.css, fonts/
├── src/
│   ├── build.js                     exportação completa
│   ├── validate.js                  revalidação
│   ├── render.js                    dados → HTML (um <section> por slide)
│   ├── templates.js                 templates por função narrativa
│   ├── graficos.js                  gráficos vetoriais e ícones
│   ├── saidas.js                    folha de contato e prévia
│   ├── validacao.js                 checagens dos arquivos
│   ├── util.js
│   └── navegador/                   ajuste.js (fontes + corpo), inspecao.js (medições)
├── assets/                          fotografias do usuário
└── saida/<id>/                      arquivos finais
```

Fontes: Archivo (títulos, eixo de largura variável) e Inter (texto), ambas sob licença SIL OFL, embarcadas em `design/fonts/`.
