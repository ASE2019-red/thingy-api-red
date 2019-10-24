import * as Influx from 'influx';
import { config } from '../config';
import { createConnection } from 'typeorm';
import { User } from '../models/user';

export const influx_conn = async () => {
    const c_influx = new Influx.InfluxDB({
        host: config.flux.hostname,
        database: config.flux.dbname,
    });

    await c_influx.getDatabaseNames().then(names => {
        if (names.includes(config.flux.dbname)) {
            console.log(`Successfully connected to InfluxDB`)
        } else {
            throw Error(`Cannot find database ${config.flux.dbname}`);
        }
    });

    return c_influx;
};

export const pg_conn = async () => {
    let c_pg = await createConnection({
        type: 'postgres',
        host: config.postgres.hostname,
        username: config.postgres.user,
        database: config.postgres.dbname,
        password: config.postgres.password,
        entities: [User,],
        logging: ['error'],
        synchronize: true,
    }).then(c => {
        console.log(`Successfully connected to PostgreSQL`)
    });

    return c_pg;
};
