#!/bin/bash

# Script para iniciar ambos servidores

echo "🚀 Iniciando servidores del sistema de ponche..."

# Ir al directorio backend
cd "$(dirname "$0")/backend"
echo "📦 Iniciando backend en puerto 3000..."
npm start &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Esperar un poco
sleep 2

# Ir al directorio frontend
cd ../frontend
echo "🎨 Iniciando frontend en puerto 5173..."
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Servidores iniciados correctamente!"
echo "📍 Backend: http://localhost:3000"
echo "📍 Frontend: http://localhost:5173"
echo ""
echo "Para detener los servidores, presiona Ctrl+C"
echo ""

# Mantener el script corriendo
wait
