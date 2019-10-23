import * as Influx from 'influx';
import { Client } from 'pg';
import { config } from '../config';
import { createConnection } from 'typeorm';
import { User } from '../models/user';
import { create } from 'istanbul-reports';

export const influx_conn = async () => {
    const c_influx = new Influx.InfluxDB({
        host: config.flux_hostname,
        database: config.flux_dbname,
    });

    await c_influx.getDatabaseNames().then(names => {
        if (names.includes(config.flux_dbname)) {
            console.log(`Successfully connected to InfluxDB`)
        } else {
            throw Error(`Cannot find database ${config.flux_dbname}`);
        }
    });

    return c_influx;
};

export const pg_conn = async () => {
    let c_pg = await createConnection({
        type: 'postgres',
        host: config.pg_hostname,
        username: config.pg_user,
        database: config.pg_dbname,
        password: config.pg_pw,
        entities: [User,],
        logging: ['error'],
        synchronize: true,
    }).then(c => {
        console.log(`Successfully connected to PostgreSQL`)
    });

    return c_pg;
};
