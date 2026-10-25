# ========================================
# 🔄 COOKASSISTANT DOCKER UPDATER
# ========================================
# Скрипт для обновления и пересборки проекта
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔄 CookAssistant Docker Updater" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

param(
    [switch]$KeepData = $false
)

# Проверка Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker не установлен!" -ForegroundColor Red
    exit 1
}

Write-Host "🛑 Остановка контейнеров..." -ForegroundColor Yellow
docker-compose stop

Write-Host "✅ Контейнеры остановлены" -ForegroundColor Green
Write-Host ""

if (-not $KeepData) {
    Write-Host "⚠️  ВНИМАНИЕ: Удаление данных!" -ForegroundColor Red
    Write-Host "   Все данные в базе данных будут потеряны!" -ForegroundColor Yellow
    $confirm = Read-Host "   Продолжить? (yes/no)"
    
    if ($confirm -ne "yes") {
        Write-Host "❌ Отменено пользователем" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "🗑️  Удаление контейнеров и volumes..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "✅ Удалено" -ForegroundColor Green
} else {
    Write-Host "💾 Сохранение данных..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "✅ Данные сохранены" -ForegroundColor Green
}

Write-Host ""

# Очистка старых образов
Write-Host "🧹 Очистка старых образов..." -ForegroundColor Yellow
docker-compose build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка сборки!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Образы пересобраны" -ForegroundColor Green
Write-Host ""

# Запуск
Write-Host "🚀 Запуск обновленных контейнеров..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка запуска!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Контейнеры запущены" -ForegroundColor Green
Write-Host ""

# Ждем инициализации
Write-Host "⏳ Ожидание инициализации (30 сек)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Статус
Write-Host ""
Write-Host "📊 Статус:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ ОБНОВЛЕНИЕ ЗАВЕРШЕНО!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Приложение доступно на http://localhost" -ForegroundColor Yellow
Write-Host ""
