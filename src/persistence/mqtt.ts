import * as mqtt from 'async-mqtt';
import { AsyncMqttClient } from 'async-mqtt';
import { config } from '../config';


const gatewayName = config.mqtt.gatewayName;
const macThingy1 = config.mqtt.macThingy1;
const macThingy2 = config.mqtt.macThingy2;

export const topicDefinitions = {
    'gateway': {
        'version': `${gatewayName}/Version`,
        'uptime': `${gatewayName}/Uptime`,
    },
    'thingy1': {
        'connected': `${macThingy1}/Connected`,
        'gravity': `${macThingy1}/Thingy Motion Service/Thingy Gravity Characteristic`,
        'sound': `${macThingy1}/Thingy Sound Service/Thingy Microphone Characteristic`,
    },
    'thingy2': {
        'connected': `${macThingy2}/Connected`,
        'gravity': `${macThingy2}/Thingy Motion Service/Thingy Gravity Characteristic`,
        'sound': `${macThingy2}/Thingy Sound Service/Thingy Microphone Characteristic`,
    },
}

export const mqtt_conn = async () => {
    const client: AsyncMqttClient = mqtt.connect({
        host: config.mqtt.hostname,
        port: config.mqtt.port,
        protocol: 'mqtt',
        username: config.mqtt.user,
        password: config.mqtt.password,
    });

    client.on('error', (err: Error) => {
        throw new Error(`Cannot connect to MQTT broker. ${err}`);
    })

    client.on('connected', () => {
        console.log("Successfully connected to MQTT broker");
    });

    client.subscribe(topicDefinitions.gateway.version);

    client.on('message', (topic: string, message: Buffer) => {
        if (topic === topicDefinitions.gateway.version) {
            console.log(`Successfully connected to gateway via MQTT broker. Gateway version: ${message.toString()}`)
            client.unsubscribe(topicDefinitions.gateway.version);
        } else {
            console.log(`${message.toString()}`)
        }
    })

    client.subscribe(topicDefinitions.thingy1.gravity)

    return client;
};
