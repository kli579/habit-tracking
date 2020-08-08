#!/bin/bash

if [ "$ENVIRONMENT" = "production" ]
then
# Sets the database to allow all connections
    echo "host all  all  0.0.0.0/0  trust" >> /var/lib/postgresql/data/pg_hba.conf
    echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf
fi