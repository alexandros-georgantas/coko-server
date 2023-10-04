#!/bin/sh

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

docker compose -f docker-compose.testing.yml up -d filehosting createbucket db

docker compose -f docker-compose.testing.yml run server

docker compose -f docker-compose.testing.yml down
