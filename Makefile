# ============================================================
# RiseCoreFlow — Makefile
# ============================================================

.PHONY: help dev build start lint migrate seed clean

help:
	@echo "RiseCoreFlow — команды разработки"
	@echo ""
	@echo "  make dev       Next.js dev server :3050"
	@echo "  make build     Production build"
	@echo "  make start     Production server"
	@echo "  make migrate   Применить все миграции"
	@echo "  make seed      Заполнить тестовыми данными"
	@echo "  make lint      ESLint проверка"
	@echo "  make clean     Удалить .next/ и node_modules/"

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

# Миграции в правильном порядке
migrate:
	node prisma/migrate-v2.js
	node prisma/migrate-v3.js
	@echo "Миграции применены"

# Seed данные
seed:
	node prisma/seed-direct.js
	node prisma/seed-winextraflow.js
	node prisma/seed-examples.js
	@echo "Данные загружены"

seed-emails:
	node prisma/seed-emails.js

# Полный первый запуск
setup: migrate seed dev

clean:
	rm -rf .next node_modules
	@echo "Очищено. Запусти: npm install && make dev"

# Проверить текущий AI-провайдер
ai-status:
	@curl -s http://localhost:3050/api/ai/status | python -m json.tool 2>/dev/null || \
	  node -e "fetch('http://localhost:3050/api/ai/status').then(r=>r.json()).then(console.log)"

# Статистика платформы
stats:
	@curl -s http://localhost:3050/api/public/stats | python -m json.tool 2>/dev/null || echo "Сервер не запущен"
