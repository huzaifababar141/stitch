.PHONY: up down reset-db logs psql redis-cli

# Start all Docker services in background
up:
	docker-compose up -d

# Stop all Docker services
down:
	docker-compose down

# Stop services, destroy database volumes, and restart (Full Reset)
reset-db:
	docker-compose down -v && docker-compose up -d

# Tail logs directly from all services
logs:
	docker-compose logs -f

# Enter a psql shell connected directly to the database
psql:
	docker exec -it tailoring_postgres psql -U tailoring_user -d tailoring_db

# Enter the redis-cli shell
redis-cli:
	docker exec -it tailoring_redis redis-cli
