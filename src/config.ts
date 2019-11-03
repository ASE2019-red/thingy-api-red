import * as dotenv from 'dotenv';

export function loadConfig() {
    dotenv.config();
    return {
        port: process.env.NODE_PORT,
        prettyLog: process.env.NODE_ENV == 'development',

        flux: {
            hostname: process.env.INFLUXDB_HOST,
            port: process.env.INFLUXDB_PORT,
            dbname: process.env.INFLUXDB_DBNAME,
            user: process.env.INFLUXDB_ADMIN_USER,
            password: process.env.INFLUXDB_ADMIN_PASSWORD,
        },

        postgres: {
            hostname: process.env.POSTGRES_HOST,
            port: parseInt(process.env.POSTGRES_PORT),
            dbname: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
        },

        mqtt: {
            hostname: process.env.MQTT_HOST,
            port: process.env.MQTT_PORT,
            user: process.env.MQTT_USER,
            password: process.env.MQTT_PW,
            // TODO: later we should store a list of all available sensors and their topics in the db
            accelerationSensorTopic: process.env.ACCELERATION_SENSOR_TOPIC,
        },
    };
}
