#!/bin/bash

# use args from script run to run 'npx prisma ...'
# todo: docker-compose relative to script dir, not run pwd
docker compose -f docker-compose.dev.yml exec remix bash -c 'cd /app && npx prisma "$@"' _ "$@"
