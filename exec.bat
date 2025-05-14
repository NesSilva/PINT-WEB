@echo off
setlocal

REM Inicia o backend na porta 3001
echo 🚀 Iniciando Backend na porta 3001...
cd backend
call npm install
start "Backend" cmd /k "set PORT=3001 && npm run dev"
cd ..

REM Inicia o frontend na porta 3000
echo 🎨 Iniciando Frontend na porta 3000...
cd frontend
call npm install
start "Frontend" cmd /k "set PORT=3000 && npm start"
cd ..

REM Mantém o terminal principal aberto
echo.
echo ✔️ Servidores iniciados. Pressione qualquer tecla para sair...
pause >nul