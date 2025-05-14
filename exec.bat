@echo off
REM Sai se algum comando falhar

REM Inicia o backend na porta 3001
echo 🚀 Backend: porta 3001
cd backend
npm install
set PORT=3001
start "Backend" cmd /k "npm run dev"

REM Inicia o frontend na porta 3000
echo 🎨 Frontend: porta 3000
cd ..\frontend
npm install
set PORT=3000
start "Frontend" cmd /k "npm start"
