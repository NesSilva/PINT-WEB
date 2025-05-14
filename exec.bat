@echo off
REM Inicia o backend na porta 3001
echo 🚀 Backend: porta 3001
cd backend
npm install
start "Backend" cmd /k "set PORT=3001 && npm run dev"

REM Inicia o frontend na porta 3000
echo 🎨 Frontend: porta 3000
cd ..\frontend
npm install
start "Frontend" cmd /k "set PORT=3000 && npm start"

pause  "Pressione qualquer tecla para sair..."
