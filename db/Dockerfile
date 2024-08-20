FROM postgres

# Installs PostGIS and PostgreSQL 13 support
RUN apt-get update && \
    apt-get install -y postgis postgresql-13-postgis-3

# Changes the UID of the 'postgres' user to 1000
RUN usermod -u 1000 postgres

# Starts the PostgreSQL server
CMD ["postgres"]
