import * as Influx from 'influx';
import { Connection, createConnection } from 'typeorm';
import { Coffee } from '../models/coffee';
import { Machine } from '../models/machine';
import { User } from '../models/user';

export const influxConn = async (config: {hostname: string, dbname: string }) => {
    const conn: Influx.InfluxDB = new Influx.InfluxDB({
        host: config.hostname,
        database: config.dbname,
    });

    await conn.getDatabaseNames().then((names) => {
        if (names.includes(config.dbname)) {
            console.log(`Successfully connected to InfluxDB`);
        } else {
            throw Error(`Cannot find database ${config.dbname}`);
        }
    });

    return conn;
};

export const pgConn = async (config: {hostname: string, port: number, user: string, dbname: string
                                       password: string}) => {
    const conn: Connection = await createConnection({
        type: 'postgres',
        host: config.hostname,
        port: config.port,
        username: config.user,
        database: config.dbname,
        password: config.password,
        entities: [User, Coffee, Machine],
        logging: ['error'],
        synchronize: true,
    });

    console.log(`Successfully connected to PostgreSQL`);
    return conn;
};
