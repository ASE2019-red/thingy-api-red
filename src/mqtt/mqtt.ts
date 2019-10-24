import * as mqtt from 'async-mqtt';
import { AsyncMqttClient, ISubscriptionGrant } from 'async-mqtt';
import { config } from '../config';

export class MQTTTopicClient {
    private client?: AsyncMqttClient;
    private topicMessageCallbacks = new Map<string, (message: Buffer) => void>() 

    connect = async () => {
        console.log("Should connect");
        this.client = mqtt.connect({
            host: config.mqtt.hostname,
            port: config.mqtt.port,
            protocol: 'mqtt',
            username: config.mqtt.user,
            password: config.mqtt.password,
        });
    
        console.log("here");
        this.client.on('error', (err: Error) => {
            console.log(`Cannot connect to MQTT broker. ${err}`);
            throw new Error(`Cannot connect to MQTT broker. ${err}`);
        })
    
        console.log("there");
        this.client.on('connected', () => {
            console.log("Successfully connected to MQTT broker");
        });

        console.log("there 2");
        this.client.on('message', (topic: string, payload: Buffer) => {
            if(this.topicMessageCallbacks.has(topic)) {
                this.topicMessageCallbacks.get(topic)(payload);
            }
        })
        console.log("there 3");
    };

    onTopicMessage(topic: string, callback: (message: Buffer) => void) {
        console.log("added on topic message for: "+topic);
        this.topicMessageCallbacks.set(topic, callback)
        this.client.subscribe(topic);
    }
}

export default MQTTTopicClient;
