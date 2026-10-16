# Relatório de testes E2E — PRISMA Studio

Executado em 2026-10-16T01:03:25.739Z · 17/17 aprovados

Ambiente: servidor real em 127.0.0.1, Chromium via Playwright, dados temporários (o projeto real não foi tocado).

| Teste | Resultado | Detalhe | Tempo |
|---|---|---|---|
| 1. Abrir a biblioteca e ver o carrossel de 17/10 | ✔ passou | cartão com capa, data 17/10/2026 e 9 slides | 1.4 s |
| 2. Selecionar e editar um slide | ✔ passou | slide 3 aberto no painel e na prévia | 1.4 s |
| 3. Alterar um título e salvar | ✔ passou | indicador passou por 'Alterações não salvas' → 'Salvo'; JSON em disco atualizado; versão anterior no histórico | 1.3 s |
| 4. Prévia atualizada | ✔ passou | prévia central e miniatura mostram o texto novo; layout validado | 0.1 s |
| 5. Renderizar novamente | ✔ passou | exportação concluída e validada (0 erros) | 2.0 s |
| 6. Baixar um PNG e conferir dimensão e conteúdo | ✔ passou | PRISMA-Carrossel-2026-10-17-slide-03.png: 1080×1350, conteúdo novo; slide 1 idêntico byte a byte ao aprovado | 0.5 s |
| 7. Baixar o PDF e verificar páginas | ✔ passou | PRISMA-Carrossel-2026-10-17.pdf: 9 páginas, ordem correta, página 3 com o título novo | 0.4 s |
| 8. Baixar o ZIP, descompactar e verificar | ✔ passou | 15 arquivos: 9 PNGs 1080×1350, PDF 9 págs, visão geral, relatório APROVADO, projeto com título editado | 0.3 s |
| 9. Fechar e reabrir: projeto continua salvo | ✔ passou | servidor reiniciado; edição preservada | 1.5 s |
| 10. Criar um segundo carrossel duplicando o primeiro | ✔ passou | cópia "5 sinais de que estão manipulando sua opinião (cópia)" (2026-10-17-5-sinais-de-que-estao-manipulando-sua-o) com 9 slides; original intacto | 0.2 s |
| 11. Fotografia não facial: upload, layout e exportação | ✔ passou | foto de fundo na capa e retrato no encerramento validados; arquivo guardado idêntico ao original; export 1080×1350 sem erros | 8.7 s |
| 12. Texto longo demais: avisos e proteção contra corte | ✔ passou | contador vermelho + aviso "⚠ Atenção: o título não cabe no espaço, mesmo no menor tamanho legível; o complemento passou da margem de segurança; o gráfico passou da margem de segurança…" na prévia; exportação marcou 5 erro(s); Ctrl+Z restaurou | 3.9 s |
| Extra A. Criar carrossel a partir de texto colado | ✔ passou | 4 blocos → capa-impacto, lista-numerada, checklist, encerramento | 0.6 s |
| Extra B. Importar JSON | ✔ passou | criado como projeto novo, sem sobrescrever | 0.6 s |
| Extra C. Segurança: host, path traversal e uploads | ✔ passou | host externo 403; traversal 400/403/404; upload não-imagem 415; exclusão exige confirmação | 0.0 s |
| Extra D. Excluir com confirmação (vai para a lixeira) | ✔ passou | cancelar preserva; confirmar move para dados/lixeira | 0.4 s |
| Extra E. Downloads por destino (Instagram, TikTok, LinkedIn, Substack) | ✔ passou | PRISMA-Carrossel-2026-10-17-Instagram.zip, PRISMA-Carrossel-2026-10-17-TikTok.zip, PRISMA-Carrossel-2026-10-17-LinkedIn.pdf, PRISMA-Carrossel-2026-10-17-Substack.zip | 1.1 s |
