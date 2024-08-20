#!/bin/bash


# Exit immediately if a command exits with a non-zero status.
set -e

# Print each command before executing it.
set -x



# The `2>&1` redirection combines standard error (stderr) and 
# standard output (stdout) streams. 

# Execute all pending database migrations. 

npx sequelize-cli db:migrate 2>&1

# Seed the database with initial data.

npx sequelize-cli db:seed:all 2>&1

# Pass control to the CMD instruction in the Dockerfile or any 
# other command passed as arguments to this script.

exec "$@"
