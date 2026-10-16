@echo off
setlocal
cd /d "%~dp0"
title PRISMA Studio
echo.
echo  PRISMA Studio - Carrosseis
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  [ERRO] Node.js nao encontrado. De dois cliques em instalar-prisma.bat primeiro.
  pause
  exit /b 1
)
if not exist "node_modules\express" (
  echo  [ERRO] Dependencias nao instaladas. De dois cliques em instalar-prisma.bat primeiro.
  pause
  exit /b 1
)
if not exist "studio\dist\index.html" (
  echo  [ERRO] A interface nao foi encontrada em studio\dist. Baixe o pacote completo de novo.
  pause
  exit /b 1
)

echo  Iniciando o servidor local. O navegador vai abrir sozinho.
echo  Mantenha esta janela aberta enquanto usa o PRISMA. Para sair, feche-a.
echo.
set PRISMA_ABRIR=1
node servidor\index.js
if errorlevel 1 (
  echo.
  echo  [ERRO] O PRISMA encerrou com erro. Leia a mensagem acima.
  pause
)
