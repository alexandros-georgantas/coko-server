#!/bin/sh

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

docker compose -f docker-compose.lint.yml build server

docker compose \
  -f docker-compose.lint.yml \
  run \
  server \
  sh scripts/lintCommands.sh

docker compose -f docker-compose.lint.yml down
