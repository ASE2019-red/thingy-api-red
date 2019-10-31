import * as Influx from 'influx';
import { createConnection, Connection } from 'typeorm';
import { User } from '../models/user';
import { CoffeeEvent } from '../models/coffeeEvent';

export const influx_conn = async (config: {hostname: string, dbname: string }) => {
    const c_influx: Influx.InfluxDB = new Influx.InfluxDB({
        host: config.hostname,
        database: config.dbname,
    });

    await c_influx.getDatabaseNames().then(names => {
        if (names.includes(config.dbname)) {
            console.log(`Successfully connected to InfluxDB`)
        } else {
            throw Error(`Cannot find database ${config.dbname}`);
        }
    });

    return c_influx;
};

export const pg_conn = async (config: {hostname: string, port: number, user: string, dbname: string 
                                       password: string}) => {
    const c_pg: Connection = await createConnection({
        type: 'postgres',
        host: config.hostname,
        port: config.port,
        username: config.user,
        database: config.dbname,
        password: config.password,
        entities: [User, CoffeeEvent],
        logging: ['error'],
        synchronize: true,
    });

    console.log(`Successfully connected to PostgreSQL`)
    return c_pg;
};
