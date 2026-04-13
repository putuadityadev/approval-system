# Docker Helper Script untuk Mall Approval System (Windows PowerShell)
# Script ini menyediakan shortcut untuk command Docker yang sering digunakan

param(
    [Parameter(Position=0)]
    [string]$Command,
    
    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

# Function untuk print colored message
function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

# Function untuk check apakah Docker running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Print-Error "Docker tidak running. Silakan start Docker terlebih dahulu."
        exit 1
    }
}

# Function untuk setup awal project
function Invoke-Setup {
    Print-Info "Memulai setup project..."
    
    # Check Docker
    Test-Docker
    
    # Copy .env.example jika .env belum ada
    if (-not (Test-Path .env)) {
        Print-Info "Membuat file .env dari .env.example..."
        Copy-Item .env.example .env
        Print-Success "File .env berhasil dibuat"
    } else {
        Print-Info "File .env sudah ada, skip..."
    }
    
    # Start containers
    Print-Info "Starting Docker containers..."
    docker-compose up -d
    Print-Success "Containers berhasil distart"
    
    # Wait for MySQL to be ready
    Print-Info "Menunggu MySQL ready..."
    Start-Sleep -Seconds 10
    
    # Install Composer dependencies
    Print-Info "Installing Composer dependencies..."
    docker-compose exec -T app composer install --no-interaction
    Print-Success "Composer dependencies berhasil diinstall"
    
    # Generate app key
    Print-Info "Generating application key..."
    docker-compose exec -T app php artisan key:generate
    Print-Success "Application key berhasil digenerate"
    
    # Run migrations
    Print-Info "Running database migrations..."
    docker-compose exec -T app php artisan migrate
    Print-Success "Migrations berhasil dijalankan"
    
    # Run seeders
    Print-Info "Running database seeders..."
    docker-compose exec -T app php artisan db:seed
    Print-Success "Seeders berhasil dijalankan"
    
    # Install NPM dependencies
    Print-Info "Installing NPM dependencies..."
    docker-compose exec -T node npm install
    Print-Success "NPM dependencies berhasil diinstall"
    
    Print-Success "Setup selesai! Aplikasi siap digunakan."
    Print-Info "Akses aplikasi di: http://localhost:8000"
    Print-Info "Login sebagai Admin: admin@mall.com / password123"
}

# Function untuk start containers
function Start-Containers {
    Test-Docker
    Print-Info "Starting containers..."
    docker-compose up -d
    Print-Success "Containers berhasil distart"
}

# Function untuk stop containers
function Stop-Containers {
    Print-Info "Stopping containers..."
    docker-compose down
    Print-Success "Containers berhasil distop"
}

# Function untuk restart containers
function Restart-Containers {
    Print-Info "Restarting containers..."
    docker-compose restart
    Print-Success "Containers berhasil direstart"
}

# Function untuk view logs
function Show-Logs {
    param([string]$Container)
    
    if ($Container) {
        docker-compose logs -f $Container
    } else {
        docker-compose logs -f
    }
}

# Function untuk artisan commands
function Invoke-Artisan {
    param([string[]]$Args)
    docker-compose exec app php artisan @Args
}

# Function untuk composer commands
function Invoke-Composer {
    param([string[]]$Args)
    docker-compose exec app composer @Args
}

# Function untuk npm commands
function Invoke-Npm {
    param([string[]]$Args)
    docker-compose exec node npm @Args
}

# Function untuk clear cache
function Clear-LaravelCache {
    Print-Info "Clearing Laravel cache..."
    docker-compose exec app php artisan cache:clear
    docker-compose exec app php artisan config:clear
    docker-compose exec app php artisan route:clear
    docker-compose exec app php artisan view:clear
    Print-Success "Cache berhasil dibersihkan"
}

# Function untuk fresh install (reset database)
function Invoke-Fresh {
    Print-Info "Fresh install - akan reset database!"
    $confirmation = Read-Host "Apakah Anda yakin? (y/n)"
    
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        Print-Info "Running fresh migration..."
        docker-compose exec app php artisan migrate:fresh --seed
        Print-Success "Database berhasil direset"
    } else {
        Print-Info "Fresh install dibatalkan"
    }
}

# Function untuk run tests
function Invoke-Test {
    param([string[]]$Args)
    Print-Info "Running PHPUnit tests..."
    docker-compose exec app php artisan test @Args
}

# Function untuk rebuild containers
function Invoke-Rebuild {
    Print-Info "Rebuilding containers..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    Print-Success "Containers berhasil direbuild"
}

# Function untuk show help
function Show-Help {
    Write-Host "Mall Approval System - Docker Helper (PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-helper.ps1 [command] [arguments]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  setup         Setup project pertama kali (install dependencies, migrate, seed)"
    Write-Host "  start         Start Docker containers"
    Write-Host "  stop          Stop Docker containers"
    Write-Host "  restart       Restart Docker containers"
    Write-Host "  logs [name]   View logs (optional: specify container name)"
    Write-Host "  artisan       Run artisan command (e.g., .\docker-helper.ps1 artisan migrate)"
    Write-Host "  composer      Run composer command (e.g., .\docker-helper.ps1 composer install)"
    Write-Host "  npm           Run npm command (e.g., .\docker-helper.ps1 npm run dev)"
    Write-Host "  clear-cache   Clear Laravel cache"
    Write-Host "  fresh         Fresh migration (reset database)"
    Write-Host "  test          Run PHPUnit tests"
    Write-Host "  rebuild       Rebuild Docker containers"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\docker-helper.ps1 setup"
    Write-Host "  .\docker-helper.ps1 artisan migrate"
    Write-Host "  .\docker-helper.ps1 composer require package/name"
    Write-Host "  .\docker-helper.ps1 npm run dev"
    Write-Host "  .\docker-helper.ps1 logs app"
}

# Main script logic
switch ($Command) {
    "setup" {
        Invoke-Setup
    }
    "start" {
        Start-Containers
    }
    "stop" {
        Stop-Containers
    }
    "restart" {
        Restart-Containers
    }
    "logs" {
        Show-Logs -Container $Arguments[0]
    }
    "artisan" {
        Invoke-Artisan -Args $Arguments
    }
    "composer" {
        Invoke-Composer -Args $Arguments
    }
    "npm" {
        Invoke-Npm -Args $Arguments
    }
    "clear-cache" {
        Clear-LaravelCache
    }
    "fresh" {
        Invoke-Fresh
    }
    "test" {
        Invoke-Test -Args $Arguments
    }
    "rebuild" {
        Invoke-Rebuild
    }
    default {
        Show-Help
    }
}
