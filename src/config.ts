// export interface IConfig {
//     port: number;
//     prettyLog: boolean;
// }

// TODO: move to JSON configuration
const config = {
    port: process.env.NODE_PORT || 3000,
    prettyLog: process.env.NODE_ENV == 'development',

    flux: {
        hostname: process.env.FLUXDB_HOST || 'localhost',
        port: process.env.FLUXDB_PORT || 8086,
        dbname: process.env.FLUXDB_DBNAME || 'thingy-db-red',
        user: process.env.FLUXDB_USER || 'fluxdb-user',
        password: process.env.FLUXDB_PW || 'mysecretpassword',
    },

    postgres: {
        hostname: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        dbname: process.env.POSTGRES_DBNAME || 'thingy-db-red',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PW || 'mysecretpassword',
    },

    mqtt: {
        hostname: process.env.MQTT_HOST || 'mqtt.thing.zone',
        port: process.env.MQTT_PORT || 1893,
        user: process.env.MQTT_USER || 'red',
        password: process.env.MQTT_PW || '061526c657',
    },
};

export { config };
