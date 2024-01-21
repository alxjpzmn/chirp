#!/bin/bash

ENV_VAR_NAME="REDIS_HOST"

if [ -z "${!ENV_VAR_NAME}" ]; then
    echo "Environment variable $ENV_VAR_NAME is not set. Starting Redis server..."
    
    redis-server --daemonize yes

    echo "Redis server started."
fi

exec bun run /app/index.js
