# thingy-api-red

## API


## Persistence

### InfluxDB
InfluxDB is used to store timeseries data which will be consumed form MQTT broker.
This project uses the InfluxDB Docker image and bootstraps some sample data.

To run the database locally, do:

    $ docker-compose up -d influx

This will setup the DB for you. There are mainly two interfaces for accessing the data: A REST API and the CLI.
To select all data stored in the dummy gravity measurement, do

    $ http --form POST http://localhost:8086/query db=thingy-db-red q="select * from gravity"

You can do this for the sound mesaurement in the same manner. The bootstrap data is located under `resources/init-fluxdb/init.iql`.
For more information visit https://docs.influxdata.com/influxdb/v1.7/introduction/getting-started/.
