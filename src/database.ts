import * as Influx from 'influx';

const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'thingy-db-red'
})

export { influx };