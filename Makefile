# Makefile untuk Mall Approval System
# Alternative untuk docker-helper script

.PHONY: help setup start stop restart logs artisan composer npm clear-cache fresh test rebuild

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Tampilkan help message
	@echo "$(BLUE)Mall Approval System - Docker Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Usage:$(NC)"
	@echo "  make [command]"
	@echo ""
	@echo "$(GREEN)Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Examples:$(NC)"
	@echo "  make setup"
	@echo "  make artisan cmd='migrate'"
	@echo "  make composer cmd='require package/name'"
	@echo "  make npm cmd='run dev'"

setup: ## Setup project pertama kali (install dependencies, migrate, seed)
	@echo "$(BLUE)Starting setup...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env file...$(NC)"; \
		cp .env.example .env; \
		echo "$(GREEN)✓ .env file created$(NC)"; \
	fi
	@echo "$(YELLOW)Starting Docker containers...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✓ Containers started$(NC)"
	@echo "$(YELLOW)Waiting for MySQL to be ready...$(NC)"
	@sleep 10
	@echo "$(YELLOW)Installing Composer dependencies...$(NC)"
	@docker-compose exec -T app composer install --no-interaction
	@echo "$(GREEN)✓ Composer dependencies installed$(NC)"
	@echo "$(YELLOW)Generating application key...$(NC)"
	@docker-compose exec -T app php artisan key:generate
	@echo "$(GREEN)✓ Application key generated$(NC)"
	@echo "$(YELLOW)Running migrations...$(NC)"
	@docker-compose exec -T app php artisan migrate
	@echo "$(GREEN)✓ Migrations completed$(NC)"
	@echo "$(YELLOW)Seeding database...$(NC)"
	@docker-compose exec -T app php artisan db:seed
	@echo "$(GREEN)✓ Database seeded$(NC)"
	@echo "$(YELLOW)Installing NPM dependencies...$(NC)"
	@docker-compose exec -T node npm install
	@echo "$(GREEN)✓ NPM dependencies installed$(NC)"
	@echo ""
	@echo "$(GREEN)✓ Setup complete!$(NC)"
	@echo "$(BLUE)Access application at: http://localhost:8000$(NC)"
	@echo "$(BLUE)Login as Admin: admin@mall.com / password123$(NC)"

start: ## Start Docker containers
	@echo "$(YELLOW)Starting containers...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✓ Containers started$(NC)"

stop: ## Stop Docker containers
	@echo "$(YELLOW)Stopping containers...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✓ Containers stopped$(NC)"

restart: ## Restart Docker containers
	@echo "$(YELLOW)Restarting containers...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)✓ Containers restarted$(NC)"

logs: ## View logs (usage: make logs service=app)
	@docker-compose logs -f $(service)

artisan: ## Run artisan command (usage: make artisan cmd='migrate')
	@docker-compose exec app php artisan $(cmd)

composer: ## Run composer command (usage: make composer cmd='install')
	@docker-compose exec app composer $(cmd)

npm: ## Run npm command (usage: make npm cmd='run dev')
	@docker-compose exec node npm $(cmd)

clear-cache: ## Clear Laravel cache
	@echo "$(YELLOW)Clearing cache...$(NC)"
	@docker-compose exec app php artisan cache:clear
	@docker-compose exec app php artisan config:clear
	@docker-compose exec app php artisan route:clear
	@docker-compose exec app php artisan view:clear
	@echo "$(GREEN)✓ Cache cleared$(NC)"

fresh: ## Fresh migration (reset database)
	@echo "$(YELLOW)Running fresh migration...$(NC)"
	@docker-compose exec app php artisan migrate:fresh --seed
	@echo "$(GREEN)✓ Database reset$(NC)"

test: ## Run PHPUnit tests (usage: make test args='--filter=LoginTest')
	@echo "$(YELLOW)Running tests...$(NC)"
	@docker-compose exec app php artisan test $(args)

rebuild: ## Rebuild Docker containers
	@echo "$(YELLOW)Rebuilding containers...$(NC)"
	@docker-compose down
	@docker-compose build --no-cache
	@docker-compose up -d
	@echo "$(GREEN)✓ Containers rebuilt$(NC)"

shell-app: ## Open bash shell in app container
	@docker-compose exec app bash

shell-db: ## Open MySQL shell in db container
	@docker-compose exec db mysql -u mall_user -p mall_approval

shell-node: ## Open shell in node container
	@docker-compose exec node sh

ps: ## Show container status
	@docker-compose ps

stats: ## Show container stats (CPU, memory)
	@docker stats

backup-db: ## Backup database to backup.sql
	@echo "$(YELLOW)Backing up database...$(NC)"
	@docker-compose exec db mysqldump -u mall_user -psecret123 mall_approval > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Database backed up$(NC)"

restore-db: ## Restore database from backup.sql (usage: make restore-db file=backup.sql)
	@echo "$(YELLOW)Restoring database...$(NC)"
	@docker-compose exec -T db mysql -u mall_user -psecret123 mall_approval < $(file)
	@echo "$(GREEN)✓ Database restored$(NC)"
