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
        gatewayName: process.env.MQTT_GATEWAY_NAME || 'BLE2MQTT-7214',
        macThingy1: process.env.MQTT_THINGY1_MAC || 'e8:e0:72:6b:92:a3',
        macThingy2: process.env.MQTT_THINGY2_MAC || 'e3:dc:75:9c:04:6f',
    },
};

export { config };
