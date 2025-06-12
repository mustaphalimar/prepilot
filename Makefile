include .env
MIGRATIONS_PATH = ./internal/db/migrations

run:
	@air
	wait

.PHONY: migrate-create
migration:
	@migrate create -seq -ext sql -dir $(MIGRATIONS_PATH) $(filter-out $@,$(MAKECMDGOALS))

.PHONY: migrate-up
migrate-up:
	@DATABASE_URL=$(DATABASE_URL) go run cmd/migrate/main.go

.PHONY: migrate-down
migrate-down:
	@echo "Migration rollback not implemented in Go migration system. Use SQL manually if needed."


.PHONY: seed
seed:
	@go run internal/db/seed.go
