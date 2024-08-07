#!/bin/bash

export DB_USER=$POSTGRES_USER
export DB_PASSWORD=$POSTGRES_PASSWORD
export DB_NAME=$POSTGRES_DB

cat << EOF > /docker-entrypoint-initdb.d/init.sql

GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

EOF

chmod -R 755 /docker-entrypoint-initdb.d/init.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < /docker-entrypoint-initdb.d/init.sql
