#!/usr/bin/env sh
# PRISMA Studio no macOS/Linux: instala na primeira vez e abre o navegador.
cd "$(dirname "$0")" || exit 1
command -v node >/dev/null 2>&1 || { echo "Node.js nao encontrado. Instale a versao LTS em https://nodejs.org"; exit 1; }
if [ ! -d node_modules/express ]; then
  npm install --omit=dev --no-audit --no-fund || exit 1
  npx playwright install chromium || echo "Aviso: Chromium nao baixado; sera usado o Chrome/Edge instalado."
fi
PRISMA_ABRIR=${PRISMA_ABRIR:-1} exec node servidor/index.js
