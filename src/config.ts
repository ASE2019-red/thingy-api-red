import * as dotenv from 'dotenv';

// TODO: move to JSON configuration
export function loadConfig() {
    dotenv.config();
    return {
        port: process.env.NODE_PORT,
        prettyLog: process.env.NODE_ENV == 'development',

        flux: {
            hostname: process.env.FLUXDB_HOST,
            port: process.env.FLUXDB_PORT,
            dbname: process.env.FLUXDB_DBNAME,
            user: process.env.FLUXDB_USER,
            password: process.env.FLUXDB_PW,
        },

        postgres: {
            hostname: process.env.POSTGRES_HOST,
            port: parseInt(process.env.POSTGRES_PORT),
            dbname: process.env.POSTGRES_DBNAME,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PW,
        },

        mqtt: {
            hostname: process.env.MQTT_HOST,
            port: process.env.MQTT_PORT,
            user: process.env.MQTT_USER,
            password: process.env.MQTT_PW,
            // todo: later we should store a list of all available sensors and their topics in the db
            accelerationSensorTopic: process.env.ACCELERATION_SENSOR_TOPIC
        },
    };
}
