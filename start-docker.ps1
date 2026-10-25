# ========================================
# 🚀 COOKASSISTANT DOCKER LAUNCHER 
# ========================================
# Скрипт для запуска проекта в Docker
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🍳 CookAssistant Docker Launcher" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия Docker
Write-Host "Проверка Docker..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker не установлен!" -ForegroundColor Red
    Write-Host "Установите Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker найден" -ForegroundColor Green

# Проверка, запущен ли Docker
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker не запущен!" -ForegroundColor Red
    Write-Host "Запустите Docker Desktop и попробуйте снова" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker запущен" -ForegroundColor Green
Write-Host ""

# Останавливаем старые контейнеры (если есть)
Write-Host "🛑 Остановка старых контейнеров..." -ForegroundColor Yellow
docker-compose down 2>$null
Write-Host "✅ Готово" -ForegroundColor Green
Write-Host ""

# Собираем образы
Write-Host "🔨 Сборка Docker образов..." -ForegroundColor Yellow
Write-Host "   Это может занять несколько минут при первом запуске..." -ForegroundColor Cyan
docker-compose build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка сборки образов!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Образы собраны" -ForegroundColor Green
Write-Host ""

# Запускаем контейнеры
Write-Host "🚀 Запуск контейнеров..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка запуска контейнеров!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Контейнеры запущены" -ForegroundColor Green
Write-Host ""

# Ждем инициализации базы данных
Write-Host "⏳ Ожидание инициализации базы данных (30 сек)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Проверяем статус контейнеров
Write-Host ""
Write-Host "📊 Статус контейнеров:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ УСПЕШНО ЗАПУЩЕНО!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Приложение доступно:" -ForegroundColor Yellow
Write-Host "   Frontend:  http://localhost" -ForegroundColor White
Write-Host "   Backend:   http://localhost:3000" -ForegroundColor White
Write-Host "   Database:  localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "📝 Полезные команды:" -ForegroundColor Yellow
Write-Host "   Остановить:        docker-compose stop" -ForegroundColor White
Write-Host "   Перезапустить:     docker-compose restart" -ForegroundColor White
Write-Host "   Посмотреть логи:   docker-compose logs -f" -ForegroundColor White
Write-Host "   Полностью удалить: docker-compose down -v" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Приятной работы!" -ForegroundColor Green
Write-Host ""
