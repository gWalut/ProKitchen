# ========================================
# 🛑 COOKASSISTANT DOCKER STOPPER
# ========================================
# Скрипт для остановки проекта
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🛑 CookAssistant Docker Stopper" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$action = Read-Host @"
Выберите действие:
  1 - Остановить (данные сохраняются)
  2 - Остановить и удалить контейнеры (данные сохраняются)
  3 - ПОЛНАЯ ОЧИСТКА (удаляет ВСЁ включая данные БД)
Введите номер
"@

switch ($action) {
    "1" {
        Write-Host "🛑 Остановка контейнеров..." -ForegroundColor Yellow
        docker-compose stop
        Write-Host "✅ Контейнеры остановлены" -ForegroundColor Green
        Write-Host "   Для запуска используйте: docker-compose start" -ForegroundColor Cyan
    }
    "2" {
        Write-Host "🗑️  Удаление контейнеров..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✅ Контейнеры удалены, данные сохранены" -ForegroundColor Green
        Write-Host "   Для запуска используйте: .\start-docker.ps1" -ForegroundColor Cyan
    }
    "3" {
        Write-Host "⚠️  ВНИМАНИЕ: ПОЛНАЯ ОЧИСТКА!" -ForegroundColor Red
        $confirm = Read-Host "   Все данные будут потеряны! Продолжить? (yes/no)"
        
        if ($confirm -eq "yes") {
            Write-Host "🗑️  Удаление всех контейнеров и данных..." -ForegroundColor Yellow
            docker-compose down -v
            Write-Host "✅ Всё удалено" -ForegroundColor Green
        } else {
            Write-Host "❌ Отменено" -ForegroundColor Yellow
        }
    }
    default {
        Write-Host "❌ Неверный выбор" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
