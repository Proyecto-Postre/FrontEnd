@echo off
cd /d %~dp0
echo Iniciando servidor de simulacion (Dulce Fe Backend)...
echo API disponible en: http://localhost:3000/api/products
call npx json-server --watch db.json --routes routes.json --port 3000
pause
