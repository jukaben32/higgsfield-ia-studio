@echo off
rem Lanzador de Betha IA Studio: arranca el servidor local y abre el navegador.
rem Para cerrar la app, cierra esta ventana.
title Betha IA Studio (no cierres esta ventana mientras lo uses)
cd /d "%~dp0.."

rem Primera vez: instala las dependencias si faltan
if not exist node_modules (
  echo Instalando dependencias por primera vez, espera un momento...
  call npm install
)

rem Abre el navegador unos segundos despues, cuando el servidor ya este listo
start "" /min cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:5173"

echo Iniciando Betha IA Studio en http://localhost:5173 ...
call npm run dev -- --port 5173 --strictPort

rem Si llegamos aqui, el servidor se detuvo (o ya estaba abierto en otra ventana)
echo.
echo El servidor se detuvo. Si ya tenias la app abierta en otra ventana, usa esa.
pause
