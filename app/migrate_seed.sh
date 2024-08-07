#!/bin/bash

# Add the -e option to stop the script in case of errors
set -e

# Add the -x option to enable debugging
set -x

npx sequelize-cli db:migrate 2>&1
npx sequelize-cli db:seed:all 2>&1

exec "$@"