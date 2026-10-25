# ========================================
# 🔍 COOKASSISTANT HEALTH CHECKER
# ========================================
# Проверка работоспособности всех сервисов
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 CookAssistant Health Check" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allHealthy = $true

# Проверка Docker
Write-Host "1️⃣  Проверка Docker..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "   ❌ Docker не установлен" -ForegroundColor Red
    $allHealthy = $false
} else {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Docker не запущен" -ForegroundColor Red
        $allHealthy = $false
    } else {
        Write-Host "   ✅ Docker работает" -ForegroundColor Green
    }
}

Write-Host ""

# Проверка контейнеров
Write-Host "2️⃣  Проверка контейнеров..." -ForegroundColor Yellow
$containers = docker-compose ps -q 2>$null

if ($containers) {
    $dbStatus = docker inspect cookassist_db --format='{{.State.Health.Status}}' 2>$null
    $backendStatus = docker inspect cookassist_backend --format='{{.State.Health.Status}}' 2>$null
    $frontendStatus = docker inspect cookassist_frontend --format='{{.State.Health.Status}}' 2>$null
    
    Write-Host "   База данных:  " -NoNewline
    if ($dbStatus -eq "healthy") {
        Write-Host "✅ Здорова" -ForegroundColor Green
    } else {
        Write-Host "❌ $dbStatus" -ForegroundColor Red
        $allHealthy = $false
    }
    
    Write-Host "   Backend:      " -NoNewline
    if ($backendStatus -eq "healthy") {
        Write-Host "✅ Здоров" -ForegroundColor Green
    } else {
        Write-Host "❌ $backendStatus" -ForegroundColor Red
        $allHealthy = $false
    }
    
    Write-Host "   Frontend:     " -NoNewline
    if ($frontendStatus -eq "healthy") {
        Write-Host "✅ Здоров" -ForegroundColor Green
    } else {
        Write-Host "❌ $frontendStatus" -ForegroundColor Red
        $allHealthy = $false
    }
} else {
    Write-Host "   ❌ Контейнеры не запущены" -ForegroundColor Red
    $allHealthy = $false
}

Write-Host ""

# Проверка доступности сервисов
Write-Host "3️⃣  Проверка HTTP endpoints..." -ForegroundColor Yellow

# Frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost" -TimeoutSec 5 -UseBasicParsing 2>$null
    Write-Host "   Frontend (localhost):    " -NoNewline
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Доступен" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Код: $($frontendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Frontend (localhost):    ❌ Недоступен" -ForegroundColor Red
    $allHealthy = $false
}

# Backend
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing 2>$null
    Write-Host "   Backend (localhost:3000):" -NoNewline
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Доступен" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Код: $($backendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Backend (localhost:3000):❌ Недоступен" -ForegroundColor Red
    $allHealthy = $false
}

Write-Host ""

# Проверка БД порта
Write-Host "4️⃣  Проверка порта PostgreSQL..." -ForegroundColor Yellow
$dbPortTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue 2>$null
if ($dbPortTest.TcpTestSucceeded) {
    Write-Host "   ✅ Порт 5432 открыт" -ForegroundColor Green
} else {
    Write-Host "   ❌ Порт 5432 закрыт" -ForegroundColor Red
    $allHealthy = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allHealthy) {
    Write-Host "✅ ВСЕ СЕРВИСЫ РАБОТАЮТ!" -ForegroundColor Green
} else {
    Write-Host "❌ ОБНАРУЖЕНЫ ПРОБЛЕМЫ!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Попробуйте:" -ForegroundColor Yellow
    Write-Host "  1. Перезапустить: docker-compose restart" -ForegroundColor White
    Write-Host "  2. Посмотреть логи: docker-compose logs -f" -ForegroundColor White
    Write-Host "  3. Полный перезапуск: .\stop-docker.ps1 и .\start-docker.ps1" -ForegroundColor White
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
