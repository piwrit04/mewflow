@echo off
rem ============================================================
rem  喵序 MewFlow - 一键启动脚本
rem  功能：检查 Node.js 环境 -> 安装依赖(首次) -> 启动开发服务器
rem        -> 自动打开浏览器 http://localhost:3000
rem  注意：本文件必须保持 GBK 编码 + CRLF 行尾，否则中文会乱码
rem ============================================================
chcp 936 >nul
title 喵序 MewFlow - 启动器
setlocal enabledelayedexpansion

rem 切换到脚本所在目录（支持双击运行）
cd /d "%~dp0"

echo.
echo  ==========================================
echo   喵序 MewFlow · 让每一单，都井井有喵。
echo  ==========================================
echo.

rem ---------- 1. 检查 Node.js ----------
where node >nul 2>nul
if errorlevel 1 (
    echo  [错误] 未检测到 Node.js 环境。
    echo         请先访问 https://nodejs.org/ 下载并安装 LTS 版本，
    echo         安装完成后重新双击本脚本。
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node -v') do set NODE_VER=%%v
echo  [信息] 已检测到 Node.js 版本：!NODE_VER!
echo.

rem ---------- 2. 检查并安装依赖（仅首次运行） ----------
if not exist "node_modules" (
    echo  [提示] 首次运行，正在安装项目依赖，可能需要几分钟……
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  [错误] 依赖安装失败，请检查网络连接后重新运行本脚本。
        echo.
        pause
        exit /b 1
    )
    echo.
    echo  [完成] 依赖安装成功。
    echo.
) else (
    echo  [信息] 依赖已就绪，跳过安装。
    echo.
)

rem ---------- 3. 启动开发服务器（新窗口运行，便于单独关闭） ----------
echo  [启动] 正在启动喵序 MewFlow 开发服务器……
echo         访问地址：http://localhost:3000
echo.
start "MewFlow Dev Server" cmd /k "npm run dev"

rem ---------- 4. 等待服务器就绪并打开浏览器 ----------
rem 原生延时约4秒（不依赖 timeout，兼容 PATH 含 Git 工具的环境）
ping -n 5 127.0.0.1 >nul
start "" "http://localhost:3000"

echo.
echo  ==========================================
echo   喵序 MewFlow 已启动 ^^! 浏览器将自动打开。
echo.
echo   · 页面地址：http://localhost:3000
echo   · 停止服务：关闭弹出的 "MewFlow Dev Server" 窗口
echo   · 本窗口可随时关闭，不影响服务运行
echo  ==========================================
echo.
pause
