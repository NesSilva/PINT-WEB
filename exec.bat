@echo off

echo 🚀 Backend: porta 3001
cd backend
npm install
start "Backend" cmd /k "set PORT=3001 && npm run dev"


echo 🎨 Frontend: porta 3000
cd ..\frontend
npm install
start "Frontend" cmd /k "set PORT=3000 && npm start"

pause  "Pressione qualquer tecla para sair..."
