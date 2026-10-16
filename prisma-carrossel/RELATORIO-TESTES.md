# Relatório de testes E2E — PRISMA Studio

Executado em 2026-10-16T01:41:40.936Z · 27/27 aprovados

Ambiente: servidor real em 127.0.0.1, Chromium via Playwright, dados temporários (o projeto real não foi tocado).

| Teste | Resultado | Detalhe | Tempo |
|---|---|---|---|
| 1. Abrir a biblioteca e ver o carrossel de 17/10 | ✔ passou | cartão com capa, data 17/10/2026 e 9 slides | 1.4 s |
| 2. Selecionar e editar um slide | ✔ passou | slide 3 aberto no painel e na prévia | 1.4 s |
| 3. Alterar um título e salvar | ✔ passou | indicador passou por 'Alterações não salvas' → 'Salvo'; JSON em disco atualizado; versão anterior no histórico | 1.3 s |
| 4. Prévia atualizada | ✔ passou | prévia central e miniatura mostram o texto novo; layout validado | 0.1 s |
| 5. Renderizar novamente | ✔ passou | exportação concluída e validada (0 erros) | 2.0 s |
| 6. Baixar um PNG e conferir dimensão e conteúdo | ✔ passou | PRISMA-Carrossel-2026-10-17-slide-03.png: 1080×1350, conteúdo novo; slide 1 idêntico byte a byte ao aprovado | 0.5 s |
| 7. Baixar o PDF e verificar páginas | ✔ passou | PRISMA-Carrossel-2026-10-17.pdf: 9 páginas, ordem correta, página 3 com o título novo | 0.3 s |
| 8. Baixar o ZIP, descompactar e verificar | ✔ passou | 16 arquivos: 9 PNGs 1080×1350, PDF 9 págs, visão geral, relatório APROVADO, projeto com título editado | 0.2 s |
| 9. Fechar e reabrir: projeto continua salvo | ✔ passou | servidor reiniciado; edição preservada | 1.5 s |
| 10. Criar um segundo carrossel duplicando o primeiro | ✔ passou | cópia "5 sinais de que estão manipulando sua opinião (cópia)" (2026-10-17-5-sinais-de-que-estao-manipulando-sua-o) com 9 slides; original intacto | 0.1 s |
| 11. Fotografia não facial: upload, layout e exportação | ✔ passou | foto de fundo na capa e retrato no encerramento validados; arquivo guardado idêntico ao original; export 1080×1350 sem erros | 8.1 s |
| 12. Texto longo demais: avisos e proteção contra corte | ✔ passou | contador vermelho + aviso "⚠ Atenção: o título não cabe no espaço, mesmo no menor tamanho legível; o complemento passou da margem de segurança; o gráfico passou da margem de segurança…" na prévia; exportação marcou 5 erro(s); Ctrl+Z restaurou | 3.5 s |
| Extra A. Criar carrossel a partir de texto colado | ✔ passou | 4 blocos → capa-impacto, lista-numerada, checklist, encerramento | 0.7 s |
| Extra B. Importar JSON | ✔ passou | criado como projeto novo, sem sobrescrever | 0.5 s |
| Extra C. Segurança: host, path traversal e uploads | ✔ passou | host externo 403; traversal 400/403/404; upload não-imagem 415; exclusão exige confirmação | 0.0 s |
| Extra D. Excluir com confirmação (vai para a lixeira) | ✔ passou | cancelar preserva; confirmar move para dados/lixeira | 0.3 s |
| Extra E. Downloads por destino (Instagram, TikTok, LinkedIn, Substack) | ✔ passou | PRISMA-Carrossel-2026-10-17-Instagram.zip, PRISMA-Carrossel-2026-10-17-TikTok.zip, PRISMA-Carrossel-2026-10-17-LinkedIn.pdf, PRISMA-Carrossel-2026-10-17-Substack.zip | 1.1 s |
| U1. Minha Biblioteca: upload múltiplo, álbum, etiquetas, favorito e busca | ✔ passou | 2 fotos enviadas de uma vez; álbum criado; etiquetas, descrição, favorito e ponto de interesse salvos; busca por etiqueta encontrou a foto | 2.1 s |
| U2. Biblioteca continua após reiniciar o aplicativo | ✔ passou | 3 imagens de volta após reinício; arquivo idêntico ao enviado | 0.7 s |
| U3. Referências por slide: função, conceito, ≥3 tipos de conexão e justificativa | ✔ passou | conceito “pensar por conta própria + curadoria do que se vê”; 5 tipos de conexão; Truman marcado como referência cultural (sem direito de imagem) | 1.0 s |
| U4. Selecionar e rejeitar referência (sem alterar a arte) | ✔ passou | Truman selecionado; “marionete” rejeitada; exportação continua válida (arte inalterada) | 3.2 s |
| U5. Busca REAL na internet neste ambiente: erro honesto, sem resultados inventados | ✔ passou | Openverse inacessível daqui (bloqueio de rede): mensagem real + link de pesquisa manual; nenhum resultado exibido | 0.2 s |
| U6. Conector Wikimedia (servidor de TESTE com o formato da API): resultados, fontes, licenças, importar e aprovar | ✔ passou | 1 resultado com licença (uso condicionado) e 1 sem licença (só referência); importada com autor/licença/URL/data; bloqueada até aprovar; aprovada após confirmar condições | 0.6 s |
| U7. Inserir imagens nos slides com confirmação; layout validado | ✔ passou | slide 1 com imagem licenciada + crédito na arte; slide 2 com foto pessoal como detalhe; inspiração bloqueada na interface e no servidor; validação ok | 3.4 s |
| U8. Renderizar e baixar o ZIP atualizado (créditos, versão anterior preservada) | ✔ passou | ZIP com 19 arquivos, creditos.txt, origem das imagens no projeto; 3 versão(ões) anterior(es) guardada(s); 0 erros | 2.5 s |
| U9. Revogar a aprovação bloqueia a exportação | ✔ passou | imagem revogada → exportação marca erro de direitos | 2.2 s |
| U10. Relatório de universalidade dos 9 slides | ✔ passou | 9 slides analisados (função, conceito, referências, justificativas, pontuação e layout) | 0.0 s |
