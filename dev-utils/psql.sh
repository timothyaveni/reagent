#!/bin/bash

docker compose -f docker-compose.dev.yml exec postgres psql -U postgres postgres
