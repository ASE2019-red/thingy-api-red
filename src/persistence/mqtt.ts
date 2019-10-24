import * as mqtt from 'async-mqtt';
import { AsyncMqttClient } from 'async-mqtt';
import { config } from '../config';

export const mqtt_conn = async () => {
    const mqtt_conn: AsyncMqttClient = mqtt.connect({
        host: config.mqtt.hostname,
        port: config.mqtt.port,
        username: config.mqtt.user,
        password: config.mqtt.password,
    });

    // TODO: Do connection check
    //

    console.log("Successfully connected to MQTT broker");
    return mqtt_conn;
};
