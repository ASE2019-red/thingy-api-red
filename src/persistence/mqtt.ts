import * as mqtt from 'mqtt';
import { config } from '../config';

export const mqtt_conn = async () => {
    var mqtt_conn = mqtt.connect({
        host: config.mqtt.hostname,
        port: config.mqtt.port,
        username: config.mqtt.user,
        password: config.mqtt.password,
    })

    // mqtt_conn.on('connect', function () {
    // })

    // mqtt_conn.on('message', function (topic, message) {
    //     console.log(message.toString())
    // })

    return mqtt_conn;
};
