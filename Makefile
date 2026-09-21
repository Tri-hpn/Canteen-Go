.PHONY: up down logs seed rebuild clean

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

seed:
	curl "http://localhost:3000/api/seed?secret=seed_canteen_vwa_2026"

rebuild:
	docker compose build --no-cache && docker compose up -d

clean:
	docker compose down -v