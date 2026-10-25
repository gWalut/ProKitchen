# ========================================
# 🧪 COOKASSISTANT FULL TEST
# ========================================
# Полное тестирование всего стека
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 CookAssistant Full Stack Test" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing 2>$null
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " ✅" -ForegroundColor Green
            $script:testsPassed++
            return $true
        } else {
            Write-Host " ❌ (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:testsFailed++
            return $false
        }
    } catch {
        Write-Host " ❌ (Error: $($_.Exception.Message))" -ForegroundColor Red
        $script:testsFailed++
        return $false
    }
}

Write-Host "1️⃣  Testing Frontend..." -ForegroundColor Cyan
Write-Host ""

Test-Endpoint "Frontend Home" "http://localhost"
Test-Endpoint "Frontend Assets" "http://localhost/assets/" 404  # Ожидаем 404 для пустой директории

Write-Host ""
Write-Host "2️⃣  Testing Backend API..." -ForegroundColor Cyan
Write-Host ""

Test-Endpoint "Backend Health" "http://localhost:3000"
Test-Endpoint "Auth Endpoint" "http://localhost:3000/api/v1/auth/login" 400  # POST без тела = 400

Write-Host ""
Write-Host "3️⃣  Testing Database Connection..." -ForegroundColor Cyan
Write-Host ""

$dbTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue 2>$null
if ($dbTest.TcpTestSucceeded) {
    Write-Host "Database port 5432" -ForegroundColor Yellow -NoNewline
    Write-Host " ✅" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "Database port 5432" -ForegroundColor Yellow -NoNewline
    Write-Host " ❌" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""
Write-Host "4️⃣  Testing Docker Containers..." -ForegroundColor Cyan
Write-Host ""

$containers = @("cookassist_db", "cookassist_backend", "cookassist_frontend")

foreach ($container in $containers) {
    $status = docker inspect $container --format='{{.State.Status}}' 2>$null
    $health = docker inspect $container --format='{{.State.Health.Status}}' 2>$null
    
    Write-Host "Container: $container" -ForegroundColor Yellow -NoNewline
    
    if ($status -eq "running") {
        if ($health -eq "healthy" -or $health -eq "") {
            Write-Host " ✅ (running)" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host " ⚠️  (running but $health)" -ForegroundColor Yellow
            $testsFailed++
        }
    } else {
        Write-Host " ❌ ($status)" -ForegroundColor Red
        $testsFailed++
    }
}

Write-Host ""
Write-Host "5️⃣  Testing API Integration..." -ForegroundColor Cyan
Write-Host ""

# Тест регистрации (должен вернуть ошибку если пользователь уже есть или успех)
Write-Host "API Registration endpoint" -ForegroundColor Yellow -NoNewline
try {
    $body = @{
        email = "test@test.com"
        password = "test123"
        full_name = "Test User"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 10 `
        -UseBasicParsing 2>$null
    
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201 -or $response.StatusCode -eq 400) {
        Write-Host " ✅" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    # 400 или 409 - нормально (пользователь уже существует)
    if ($_.Exception.Response.StatusCode -eq 400 -or $_.Exception.Response.StatusCode -eq 409) {
        Write-Host " ✅ (user exists)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $testsFailed++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Прошло: $testsPassed" -ForegroundColor Green
Write-Host "❌ Провалено: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Приложение готово к использованию:" -ForegroundColor Yellow
    Write-Host "  🌐 Frontend:  http://localhost" -ForegroundColor White
    Write-Host "  🔧 Backend:   http://localhost:3000" -ForegroundColor White
    Write-Host "  🗄️  Database:  localhost:5432" -ForegroundColor White
} else {
    Write-Host "⚠️  НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Рекомендации:" -ForegroundColor Yellow
    Write-Host "  1. Проверьте логи: docker-compose logs -f" -ForegroundColor White
    Write-Host "  2. Перезапустите: .\stop-docker.ps1 и .\start-docker.ps1" -ForegroundColor White
    Write-Host "  3. Проверьте здоровье: .\check-health.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
