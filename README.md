# thingy-api-red

## Setup

Before starting the server, copy .env.example as .env and fill in the TODO fields

Not mandatory is NODE_RED_SLACK_WEBHOOK

If you want to seed some test data run:

    $ docker-compose up -d postgres influx
    $ npm run seed

To startup the application, run

    $ npm run watch-server

It's possible to startup the application stack with docker-compose:

    $ docker-compuse up -d # Starts the three services postgres, influx and api

### Production
The whole stack is automatically deployed to a live server server on each pull request
or commit to master

To deploy the docker-compose stack manually to production, run the following:
    $ export DOCKER_HOST=ssh://root@{server-ip}
    $ docker stack deploy --compose-file docker-compose-production.yaml thingy-api-red

You need to have passwordless access on the server (i.e. via key file)

## Testing
To run all tests:
    $ docker-compose up -d postgres influx
    $ npm run test

All tests are automatically run on github for each commit

## API
The definition of the API can be found in the [swagger.yaml](./swagger.yaml) file. If the API is running, this definition is displayed at its [root](http://localhost:8000/).

## Persistence
The two database systems can be started for local development via `docker-compose up -d influx postgres`. The ports are published, which makes it possible to access the databases.

For the productive environment, the microservices are located in a common overlay network, which makes external access impossible.

### PostgreSQL
To store simple relational data, this project uses PostgreSQL with [TypeORM](https://github.com/typeorm/typeorm).

To run the database locally, do:

    $ docker-compose up -d postgres

To connect to the database, do:

    $ PGPASSWORD=mysecretpassword psql -h localhost thingy-db-red postgres

### InfluxDB
InfluxDB is used to store timeseries data which will be consumed form MQTT broker.
This project uses the InfluxDB Docker image and bootstraps some sample data.

To run the database locally, do:

    $ docker-compose up -d influx

This will setup the DB for you. There are mainly two interfaces for accessing the data: A REST API and the CLI.
To select all data stored in the dummy gravity measurement, do

    $ http --form POST http://localhost:8086/query db=thingy-db-red q="select * from gravity"

You can do this for the sound mesaurement in the same manner. The bootstrap data is located under `resources/init-fluxdb/init.iql`.
For more information visit https://docs.influxdata.com/influxdb/v1.7/introduction/getting-started/. A good documentation for
the InfluxDB Docker Image can be found under https://hub.docker.com/_/influxdb/.

#### Cleanup Docker volumes (local development)
To cleanup all volumes:

    $ docker-compose down --volumes
