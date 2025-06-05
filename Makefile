include .env
MIGRATIONS_PATH = ./internal/db/migrations

run:
	@air & \
	cd web && pnpm dev & \
	wait

.PHONY: migrate-create
migration:
	@migrate create -seq -ext sql -dir $(MIGRATIONS_PATH) $(filter-out $@,$(MAKECMDGOALS))

.PHONY: migrate-up
migrate-up:
	@migrate -path=$(MIGRATIONS_PATH) -database=$(DATABASE_URL) up

.PHONY: migrate-down
migrate-down:
	@migrate -path=$(MIGRATIONS_PATH) -database=$(DATABASE_URL) down $(filter-out $@,$(MAKECMDGOALS))


.PHONY: seed
seed:
	@go run internal/db/seed.go
