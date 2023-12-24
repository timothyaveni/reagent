#!/bin/bash

# use args from script run to run 'npx prisma ...'
docker compose exec remix bash -c "cd /app && npx prisma $@"