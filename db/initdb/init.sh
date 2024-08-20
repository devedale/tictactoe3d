#!/bin/bash

# Export environment variables do that we can call them in the following commands.

export DB_USER=$POSTGRES_USER  
export DB_PASSWORD=$POSTGRES_PASSWORD  
export DB_NAME=$POSTGRES_DB  

# Create the SQL initialization file with the necessary SQL commands.
# Concat heredocument lines evaluated with environment variables 
# and redirect in file /docker-entrypoint-initdb.d/init.sql 

cat << EOF > /docker-entrypoint-initdb.d/init.sql
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

# Set permissions for the SQL initialization file.
# The chmod command ensures that the file can be read and executed by the PostgreSQL process and others.
chmod -R 755 /docker-entrypoint-initdb.d/init.sql  # Sets the file permissions rwxr-xr-x.

# The psql command runs the SQL command "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER" using environment variables.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < /docker-entrypoint-initdb.d/init.sql

# -v ON_ERROR_STOP=1: Stop execution if any SQL command fails, ensuring errors are caught.
# < /docker-entrypoint-initdb.d/init.sql: Redirect the content of the SQL file to the psql command for execution.
