#!/bin/bash

# Docker Helper Script untuk Mall Approval System
# Script ini menyediakan shortcut untuk command Docker yang sering digunakan

set -e

# Colors untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function untuk print colored message
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Function untuk check apakah Docker running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker tidak running. Silakan start Docker terlebih dahulu."
        exit 1
    fi
}

# Function untuk setup awal project
setup() {
    print_info "Memulai setup project..."
    
    # Check Docker
    check_docker
    
    # Copy .env.example jika .env belum ada
    if [ ! -f .env ]; then
        print_info "Membuat file .env dari .env.example..."
        cp .env.example .env
        print_success "File .env berhasil dibuat"
    else
        print_info "File .env sudah ada, skip..."
    fi
    
    # Start containers
    print_info "Starting Docker containers..."
    docker-compose up -d
    print_success "Containers berhasil distart"
    
    # Wait for MySQL to be ready
    print_info "Menunggu MySQL ready..."
    sleep 10
    
    # Install Composer dependencies
    print_info "Installing Composer dependencies..."
    docker-compose exec -T app composer install --no-interaction
    print_success "Composer dependencies berhasil diinstall"
    
    # Generate app key
    print_info "Generating application key..."
    docker-compose exec -T app php artisan key:generate
    print_success "Application key berhasil digenerate"
    
    # Run migrations
    print_info "Running database migrations..."
    docker-compose exec -T app php artisan migrate
    print_success "Migrations berhasil dijalankan"
    
    # Run seeders
    print_info "Running database seeders..."
    docker-compose exec -T app php artisan db:seed
    print_success "Seeders berhasil dijalankan"
    
    # Install NPM dependencies
    print_info "Installing NPM dependencies..."
    docker-compose exec -T node npm install
    print_success "NPM dependencies berhasil diinstall"
    
    print_success "Setup selesai! Aplikasi siap digunakan."
    print_info "Akses aplikasi di: http://localhost:8000"
    print_info "Login sebagai Admin: admin@mall.com / password123"
}

# Function untuk start containers
start() {
    check_docker
    print_info "Starting containers..."
    docker-compose up -d
    print_success "Containers berhasil distart"
}

# Function untuk stop containers
stop() {
    print_info "Stopping containers..."
    docker-compose down
    print_success "Containers berhasil distop"
}

# Function untuk restart containers
restart() {
    print_info "Restarting containers..."
    docker-compose restart
    print_success "Containers berhasil direstart"
}

# Function untuk view logs
logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Function untuk artisan commands
artisan() {
    docker-compose exec app php artisan "$@"
}

# Function untuk composer commands
composer() {
    docker-compose exec app composer "$@"
}

# Function untuk npm commands
npm() {
    docker-compose exec node npm "$@"
}

# Function untuk clear cache
clear_cache() {
    print_info "Clearing Laravel cache..."
    docker-compose exec app php artisan cache:clear
    docker-compose exec app php artisan config:clear
    docker-compose exec app php artisan route:clear
    docker-compose exec app php artisan view:clear
    print_success "Cache berhasil dibersihkan"
}

# Function untuk fresh install (reset database)
fresh() {
    print_info "Fresh install - akan reset database!"
    read -p "Apakah Anda yakin? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Running fresh migration..."
        docker-compose exec app php artisan migrate:fresh --seed
        print_success "Database berhasil direset"
    else
        print_info "Fresh install dibatalkan"
    fi
}

# Function untuk run tests
test() {
    print_info "Running PHPUnit tests..."
    docker-compose exec app php artisan test "$@"
}

# Function untuk rebuild containers
rebuild() {
    print_info "Rebuilding containers..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Containers berhasil direbuild"
}

# Main script
case "$1" in
    setup)
        setup
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$2"
        ;;
    artisan)
        shift
        artisan "$@"
        ;;
    composer)
        shift
        composer "$@"
        ;;
    npm)
        shift
        npm "$@"
        ;;
    clear-cache)
        clear_cache
        ;;
    fresh)
        fresh
        ;;
    test)
        shift
        test "$@"
        ;;
    rebuild)
        rebuild
        ;;
    *)
        echo "Mall Approval System - Docker Helper"
        echo ""
        echo "Usage: ./docker-helper.sh [command]"
        echo ""
        echo "Commands:"
        echo "  setup         Setup project pertama kali (install dependencies, migrate, seed)"
        echo "  start         Start Docker containers"
        echo "  stop          Stop Docker containers"
        echo "  restart       Restart Docker containers"
        echo "  logs [name]   View logs (optional: specify container name)"
        echo "  artisan       Run artisan command (e.g., ./docker-helper.sh artisan migrate)"
        echo "  composer      Run composer command (e.g., ./docker-helper.sh composer install)"
        echo "  npm           Run npm command (e.g., ./docker-helper.sh npm run dev)"
        echo "  clear-cache   Clear Laravel cache"
        echo "  fresh         Fresh migration (reset database)"
        echo "  test          Run PHPUnit tests"
        echo "  rebuild       Rebuild Docker containers"
        echo ""
        echo "Examples:"
        echo "  ./docker-helper.sh setup"
        echo "  ./docker-helper.sh artisan migrate"
        echo "  ./docker-helper.sh composer require package/name"
        echo "  ./docker-helper.sh npm run dev"
        echo "  ./docker-helper.sh logs app"
        ;;
esac
