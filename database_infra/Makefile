.PHONY: up down status logs backup restore wipe

# Launch the database and cache stack
up:
	docker compose up -d

# Stop services
down:
	docker compose down

# Check container health and status
status:
	docker compose ps

# Follow logs
logs:
	docker compose logs -f

# Create a timestamped SQL backup
backup:
	@chmod +x scripts/backup.sh
	./scripts/backup.sh

# Complete destructive reset (removes persistent volumes)
wipe:
	docker compose down -v