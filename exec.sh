#!/usr/bin/env bash
set -e

echo "🚀 Backend: porta 3001"
cd backend
npm i
PORT=3001 npm run dev &

echo "🎨 Frontend: porta 3000"
cd ../frontend
npm i
PORT=3000 npm start

wait

