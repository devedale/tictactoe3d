#!/bin/bash

#!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!#
# Stops and removes all containers, images, and volumes defined in the docker-compose.yml for debug purposes, remove for production use #
docker-compose down --rmi all --volumes                                                                                                 #
#!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!#


# Sets the ownership of the current directory and all its contents to UID 1000 and GID 1000
# this allows to start the db container correctlly because of this command in the db Dockerfile "RUN usermod -u 1000 postgres"
chown -R 1000:1000 .

# Starts the services defined in the docker-compose.yml using the .env file for environment variables
docker-compose --env-file .env up
