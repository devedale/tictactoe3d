#!/bin/bash

# Ferma e rimuove tutti i container, le immagini e i volumi definiti nel docker-compose.yml
docker-compose down --rmi all --volumes

#chown -R $(whoami):$(whoami) .

# Avvia i servizi definiti nel docker-compose.yml utilizzando il file .env
docker-compose --env-file .env up



