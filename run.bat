@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

echo =========================================
echo LLM Wiki 本地启动脚本
echo =========================================

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python，请确保已安装 Python 3.12 或 3.14 并添加到系统环境变量。
    pause
    goto end
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js (npm)，请确保已安装 Node.js 20+ 并添加到系统环境变量。
    pause
    goto end
)

echo [信息] 依赖检查通过...

set WORKSPACE=%CD%\research
if not exist "%WORKSPACE%" (
    echo [信息] 创建默认工作区: %WORKSPACE%
    mkdir "%WORKSPACE%"
)

echo [信息] 当前工作区: %WORKSPACE%

echo =========================================
echo 安装后端依赖...
echo =========================================
cd api
if not exist ".venv" (
    echo [信息] 创建虚拟环境...
    python.exe -m venv .venv
)
call .venv\Scripts\activate.bat
echo [信息] 安装 Python 依赖...
pip install -r requirements.txt
cd ..

echo =========================================
echo 安装前端依赖...
echo =========================================
cd web
if not exist "node_modules" (
    echo [信息] 安装 Node 依赖...
    call npm install
)
cd ..

echo =========================================
echo 启动 LLM Wiki...
echo =========================================
python llmwiki open "%WORKSPACE%"

pause
:end
