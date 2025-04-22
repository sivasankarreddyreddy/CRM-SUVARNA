#!/bin/bash
# This script starts the server using the quick start option
# that skips database seeding to avoid lengthy startup times

echo "Starting server in quick mode without database seeding..."
NODE_ENV=development node --loader tsx $(dirname "$0")/run-quick.ts