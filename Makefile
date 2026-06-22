up:
	docker compose up --build -d

dev:
	docker compose --profile dev up front-dev

down:
	docker compose down --remove-orphans

shell:
	docker compose run --rm front-dev sh

build:
	docker compose build front

lint:
	docker compose run --rm front-dev npm run lint

install:
	docker compose run --rm front-dev npm install
