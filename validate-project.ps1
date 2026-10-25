# ========================================
# ✅ COOKASSISTANT PROJECT VALIDATOR
# ========================================
# Проверка готовности проекта к запуску
# ========================================

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                        ║" -ForegroundColor Cyan
Write-Host "║   ✅ PROJECT VALIDATOR ✅              ║" -ForegroundColor Green
Write-Host "║                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$totalChecks = 0
$passedChecks = 0

function Test-File {
    param([string]$Path, [string]$Name)
    $script:totalChecks++
    Write-Host "Проверка: $Name" -ForegroundColor Yellow -NoNewline
    if (Test-Path $Path) {
        Write-Host " ✅" -ForegroundColor Green
        $script:passedChecks++
        return $true
    } else {
        Write-Host " ❌ НЕ НАЙДЕН!" -ForegroundColor Red
        return $false
    }
}

function Test-FileContent {
    param([string]$Path, [string]$Pattern, [string]$Name)
    $script:totalChecks++
    Write-Host "Проверка: $Name" -ForegroundColor Yellow -NoNewline
    if ((Test-Path $Path) -and (Select-String -Path $Path -Pattern $Pattern -Quiet)) {
        Write-Host " ✅" -ForegroundColor Green
        $script:passedChecks++
        return $true
    } else {
        Write-Host " ❌" -ForegroundColor Red
        return $false
    }
}

# ═══════════════════════════════════════
Write-Host "1️⃣  СКРИПТЫ УПРАВЛЕНИЯ" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Test-File "SETUP.ps1" "SETUP.ps1 (главный установщик)"
Test-File "start-docker.ps1" "start-docker.ps1"
Test-File "stop-docker.ps1" "stop-docker.ps1"
Test-File "update-docker.ps1" "update-docker.ps1"
Test-File "check-health.ps1" "check-health.ps1"
Test-File "test-all.ps1" "test-all.ps1"
Write-Host ""

# ═══════════════════════════════════════
Write-Host "2️⃣  ДОКУМЕНТАЦИЯ" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Test-File "README.md" "README.md"
Test-File "DOCKER-README.md" "DOCKER-README.md"
Test-File "QUICKSTART.md" "QUICKSTART.md"
Test-File "CHECKLIST.md" "CHECKLIST.md"
Test-File "COMMANDS.md" "COMMANDS.md"
Test-File "SUMMARY.md" "SUMMARY.md"
Test-File "MANIFEST.md" "MANIFEST.md"
Test-File "VISUAL-GUIDE.txt" "VISUAL-GUIDE.txt"
Write-Host ""

# ═══════════════════════════════════════
Write-Host "3️⃣  DOCKER КОНФИГУРАЦИЯ" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Test-File "docker-compose.yml" "docker-compose.yml"
Test-File ".gitignore" ".gitignore"
Test-FileContent "docker-compose.yml" "cookassist_backend" "Backend сервис в compose"
Test-FileContent "docker-compose.yml" "cookassist_frontend" "Frontend сервис в compose"
Test-FileContent "docker-compose.yml" "cookassist_db" "Database сервис в compose"
Write-Host ""

# ═══════════════════════════════════════
Write-Host "4️⃣  BACKEND ФАЙЛЫ" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Test-File "Back/Dockerfile" "Backend Dockerfile"
Test-File "Back/.dockerignore" "Backend .dockerignore"
Test-File "Back/.env.example" "Backend .env.example"
Test-File "Back/src/models/db.js" "Backend db.js"
Test-File "Back/src/config.js" "Backend config.js"
Test-File "Back/package.json" "Backend package.json"
Write-Host ""

# ═══════════════════════════════════════
Write-Host "5️⃣  BACKEND СОДЕРЖИМОЕ" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Test-FileContent "Back/src/models/db.js" "postgres|pg" "PostgreSQL поддержка в db.js"
Test-FileContent "Back/src/config.js" "DB_TYPE" "DB_TYPE в config.js"
Test-FileContent "Back/package.json" '"pg"' "pg зависимость в package.json"
Test-FileContent "Back/Dockerfile" "wget" "wget для healthcheck"
Write-Host ""

# ═══════════════════════════════════════
Write-Host "6️⃣  FRONTEND ФАЙЛЫ" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Test-File "Front/Dockerfile" "Frontend Dockerfile"
Test-File "Front/nginx.conf" "Frontend nginx.conf"
Test-File "Front/.dockerignore" "Frontend .dockerignore"
Test-File "Front/.env.example" "Frontend .env.example"
Test-File "Front/vite.config.ts" "Frontend vite.config.ts"
Test-File "Front/src/api/client.ts" "Frontend API client"
Write-Host ""

# ═══════════════════════════════════════
Write-Host "7️⃣  МИГРАЦИИ БД" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Test-File "Back/migrations/001_create_tables.sql" "PostgreSQL миграция"
Test-File "Back/migrations/001_create_tables_sqlite.sql" "SQLite миграция"
Test-File "Back/seeds/seed_allergens.sql" "Seed файл"
Write-Host ""

# ═══════════════════════════════════════
Write-Host "8️⃣  DOCKER ТРЕБОВАНИЯ" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

$totalChecks++
Write-Host "Проверка: Docker установлен" -ForegroundColor Yellow -NoNewline
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host " ✅" -ForegroundColor Green
    $passedChecks++
    
    $dockerVersion = docker --version
    Write-Host "  └─ Версия: $dockerVersion" -ForegroundColor Gray
} else {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "  └─ ТРЕБУЕТСЯ УСТАНОВКА Docker Desktop!" -ForegroundColor Red
}

$totalChecks++
Write-Host "Проверка: Docker Compose" -ForegroundColor Yellow -NoNewline
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    Write-Host " ✅" -ForegroundColor Green
    $passedChecks++
    
    $composeVersion = docker-compose --version
    Write-Host "  └─ Версия: $composeVersion" -ForegroundColor Gray
} else {
    Write-Host " ❌" -ForegroundColor Red
}

$totalChecks++
Write-Host "Проверка: Docker запущен" -ForegroundColor Yellow -NoNewline
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✅" -ForegroundColor Green
    $passedChecks++
} else {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "  └─ Запустите Docker Desktop!" -ForegroundColor Red
}

Write-Host ""

# ═══════════════════════════════════════
Write-Host "9️⃣  ПРОВЕРКА ПОРТОВ" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

$ports = @(80, 3000, 5432)
foreach ($port in $ports) {
    $totalChecks++
    Write-Host "Проверка: Порт $port" -ForegroundColor Yellow -NoNewline
    
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if (-not $connection) {
        Write-Host " ✅ (свободен)" -ForegroundColor Green
        $passedChecks++
    } else {
        Write-Host " ⚠️  (занят)" -ForegroundColor Yellow
        Write-Host "  └─ Процесс: $($connection.OwningProcess)" -ForegroundColor Gray
    }
}

Write-Host ""

# ═══════════════════════════════════════
Write-Host "═════════════════════════════════════" -ForegroundColor Cyan
Write-Host "РЕЗУЛЬТАТЫ ВАЛИДАЦИИ" -ForegroundColor Yellow
Write-Host "═════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$percentage = [math]::Round(($passedChecks / $totalChecks) * 100, 2)

Write-Host "Проверок пройдено: " -NoNewline -ForegroundColor White
Write-Host "$passedChecks" -NoNewline -ForegroundColor Green
Write-Host " / " -NoNewline -ForegroundColor White
Write-Host "$totalChecks" -ForegroundColor White

Write-Host "Процент готовности: " -NoNewline -ForegroundColor White
if ($percentage -eq 100) {
    Write-Host "$percentage%" -ForegroundColor Green
} elseif ($percentage -ge 90) {
    Write-Host "$percentage%" -ForegroundColor Yellow
} else {
    Write-Host "$percentage%" -ForegroundColor Red
}

Write-Host ""

if ($percentage -eq 100) {
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                        ║" -ForegroundColor Green
    Write-Host "║     ✅ ПРОЕКТ ПОЛНОСТЬЮ ГОТОВ! ✅      ║" -ForegroundColor Green
    Write-Host "║                                        ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Можно запускать:" -ForegroundColor Yellow
    Write-Host "   .\SETUP.ps1" -ForegroundColor Cyan
} elseif ($percentage -ge 90) {
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║                                        ║" -ForegroundColor Yellow
    Write-Host "║      ⚠️  ПОЧТИ ГОТОВ! ⚠️               ║" -ForegroundColor Yellow
    Write-Host "║                                        ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Исправьте предупреждения выше" -ForegroundColor Yellow
} else {
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                                        ║" -ForegroundColor Red
    Write-Host "║      ❌ ТРЕБУЕТСЯ ДОРАБОТКА! ❌        ║" -ForegroundColor Red
    Write-Host "║                                        ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "Исправьте ошибки выше перед запуском" -ForegroundColor Red
}

Write-Host ""
