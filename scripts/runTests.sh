#!/bin/sh

docker compose -f docker-compose.testing.yml up -d filehosting createbucket db

docker compose -f docker-compose.testing.yml run server

docker compose -f docker-compose.testing.yml down
