@echo off
echo ================================
echo EFO Label Generator - Dev Setup
echo ================================
echo.

:: Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado
    echo Por favor instalar Node.js desde https://nodejs.org
    pause
    exit /b 1
)

:: Verificar si las dependencias están instaladas
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Falló la instalación de dependencias
        pause
        exit /b 1
    )
)

:: Verificar archivo .env.local
if not exist ".env.local" (
    echo ERROR: Archivo .env.local no encontrado
    echo Por favor configurar las variables de entorno de Supabase
    echo Ver SETUP.txt para instrucciones
    pause
    exit /b 1
)

:: Iniciar servidor de desarrollo
echo.
echo Iniciando servidor de desarrollo...
echo Abrir http://localhost:3000 en el navegador
echo.
echo Presionar Ctrl+C para detener el servidor
echo.

npm run dev