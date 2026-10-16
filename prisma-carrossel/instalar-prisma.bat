@echo off
setlocal
cd /d "%~dp0"
title PRISMA Studio - instalacao
echo.
echo  ==============================================
echo   PRISMA Studio - Carrosseis : instalacao
echo  ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  [ERRO] O Node.js nao esta instalado.
  echo.
  echo  1. Baixe a versao LTS em https://nodejs.org/pt-br/download
  echo  2. Instale com as opcoes padrao.
  echo  3. Feche esta janela e de dois cliques em instalar-prisma.bat de novo.
  echo.
  start "" "https://nodejs.org/pt-br/download"
  pause
  exit /b 1
)

for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node"') do set NODEMAJOR=%%v
if %NODEMAJOR% LSS 18 (
  echo  [ERRO] Seu Node.js e antigo demais. Instale a versao LTS em https://nodejs.org
  pause
  exit /b 1
)
echo  Node.js encontrado:
node -v
echo.

echo  Instalando as dependencias (pode levar alguns minutos)...
call npm install --omit=dev --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo  [ERRO] A instalacao das dependencias falhou. Verifique a internet e tente de novo.
  pause
  exit /b 1
)

echo.
echo  Baixando o navegador de renderizacao (Chromium, cerca de 150 MB)...
call npx playwright install chromium
if errorlevel 1 (
  echo.
  echo  [AVISO] Nao foi possivel baixar o Chromium.
  echo  Sem problema: o PRISMA usa o Microsoft Edge que ja vem no Windows.
)

echo.
echo  ==============================================
echo   Instalacao concluida.
echo   Para abrir, de dois cliques em iniciar-prisma.bat
echo  ==============================================
echo.
pause
