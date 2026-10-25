# ========================================
# 🚀 COOKASSISTANT ONE-CLICK SETUP
# ========================================
# Полная установка и запуск за один клик
# ========================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                        ║" -ForegroundColor Cyan
Write-Host "║     🍳 COOKASSISTANT SETUP 🍳          ║" -ForegroundColor Green
Write-Host "║                                        ║" -ForegroundColor Cyan
Write-Host "║     Установка и запуск за 1 клик      ║" -ForegroundColor Yellow
Write-Host "║                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Проверка Docker
Write-Host "🔍 Шаг 1/5: Проверка Docker..." -ForegroundColor Cyan
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker не найден!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Установите Docker Desktop:" -ForegroundColor Yellow
    Write-Host "  https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host ""
    Read-Host "Нажмите Enter для выхода"
    exit 1
}
Write-Host "✅ Docker найден" -ForegroundColor Green

# Проверка запущен ли Docker
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker не запущен!" -ForegroundColor Red
    Write-Host "Запустите Docker Desktop и нажмите Enter..." -ForegroundColor Yellow
    Read-Host
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker всё ещё не запущен. Выход." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Docker запущен" -ForegroundColor Green
Write-Host ""

# Очистка старых контейнеров
Write-Host "🧹 Шаг 2/5: Очистка старых контейнеров..." -ForegroundColor Cyan
docker-compose down -v 2>$null
Write-Host "✅ Готово" -ForegroundColor Green
Write-Host ""

# Создание .env файлов
Write-Host "📝 Шаг 3/5: Создание конфигурационных файлов..." -ForegroundColor Cyan

# Backend .env
if (-not (Test-Path "Back\.env")) {
    Copy-Item "Back\.env.example" "Back\.env" -ErrorAction SilentlyContinue
    Write-Host "  ✅ Back\.env создан" -ForegroundColor Green
}

# Frontend .env
if (-not (Test-Path "Front\.env")) {
    Copy-Item "Front\.env.example" "Front\.env" -ErrorAction SilentlyContinue
    Write-Host "  ✅ Front\.env создан" -ForegroundColor Green
}
Write-Host ""

# Сборка образов
Write-Host "🔨 Шаг 4/5: Сборка Docker образов..." -ForegroundColor Cyan
Write-Host "  ⏳ Это может занять несколько минут при первом запуске..." -ForegroundColor Yellow
Write-Host ""

docker-compose build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка сборки!" -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}
Write-Host "✅ Образы собраны" -ForegroundColor Green
Write-Host ""

# Запуск
Write-Host "🚀 Шаг 5/5: Запуск приложения..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка запуска!" -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}
Write-Host "✅ Контейнеры запущены" -ForegroundColor Green
Write-Host ""

# Ожидание инициализации
Write-Host "⏳ Ожидание инициализации базы данных..." -ForegroundColor Yellow
Write-Host "  (это займёт около 30 секунд)" -ForegroundColor Cyan

for ($i = 30; $i -gt 0; $i--) {
    Write-Progress -Activity "Инициализация" -Status "Осталось $i секунд..." -PercentComplete ((30-$i)/30*100)
    Start-Sleep -Seconds 1
}

Write-Progress -Activity "Инициализация" -Completed
Write-Host "✅ Инициализация завершена" -ForegroundColor Green
Write-Host ""

# Проверка здоровья
Write-Host "🔍 Проверка работоспособности..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

$healthy = $true

# Проверка Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost" -TimeoutSec 10 -UseBasicParsing 2>$null
    Write-Host "  ✅ Frontend доступен" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Frontend пока недоступен" -ForegroundColor Yellow
    $healthy = $false
}

# Проверка Backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -UseBasicParsing 2>$null
    Write-Host "  ✅ Backend доступен" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Backend пока недоступен" -ForegroundColor Yellow
    $healthy = $false
}

# Проверка Database
$dbTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue 2>$null
if ($dbTest.TcpTestSucceeded) {
    Write-Host "  ✅ Database доступна" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Database пока недоступна" -ForegroundColor Yellow
    $healthy = $false
}

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                        ║" -ForegroundColor Cyan

if ($healthy) {
    Write-Host "║       ✅ УСТАНОВКА ЗАВЕРШЕНА! ✅       ║" -ForegroundColor Green
} else {
    Write-Host "║     ⚠️  УСТАНОВКА ЗАВЕРШЕНА ⚠️        ║" -ForegroundColor Yellow
}

Write-Host "║                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "🌐 ДОСТУП К ПРИЛОЖЕНИЮ:" -ForegroundColor Yellow
Write-Host "  Frontend:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost" -ForegroundColor Cyan
Write-Host "  Backend:   " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Database:  " -NoNewline -ForegroundColor White
Write-Host "localhost:5432" -ForegroundColor Cyan
Write-Host ""

if (-not $healthy) {
    Write-Host "⚠️  Некоторые сервисы ещё запускаются..." -ForegroundColor Yellow
    Write-Host "  Подождите 1-2 минуты и проверьте снова" -ForegroundColor White
    Write-Host ""
}

Write-Host "📝 ПОЛЕЗНЫЕ КОМАНДЫ:" -ForegroundColor Yellow
Write-Host "  Проверить здоровье:  " -NoNewline -ForegroundColor White
Write-Host ".\check-health.ps1" -ForegroundColor Cyan
Write-Host "  Полное тестирование: " -NoNewline -ForegroundColor White
Write-Host ".\test-all.ps1" -ForegroundColor Cyan
Write-Host "  Посмотреть логи:     " -NoNewline -ForegroundColor White
Write-Host "docker-compose logs -f" -ForegroundColor Cyan
Write-Host "  Остановить:          " -NoNewline -ForegroundColor White
Write-Host ".\stop-docker.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎉 Приятной работы!" -ForegroundColor Green
Write-Host ""

# Предложение открыть браузер
$openBrowser = Read-Host "Открыть приложение в браузере? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "http://localhost"
}

Write-Host ""
