import * as mqtt from 'async-mqtt';
import { AsyncMqttClient, ISubscriptionGrant } from 'async-mqtt';
import { config } from '../config';

export class MQTTTopicClient {
    private client?: AsyncMqttClient;
    private topicMessageCallbacks = new Map<string, (message: Buffer) => void>() 

    connect = async () => {
        this.client = mqtt.connect({
            host: config.mqtt.hostname,
            port: config.mqtt.port,
            protocol: 'mqtt',
            username: config.mqtt.user,
            password: config.mqtt.password,
        });
    
        this.client.on('error', (err: Error) => {
            console.log(`Cannot connect to MQTT broker. ${err}`);
            throw new Error(`Cannot connect to MQTT broker. ${err}`);
        })
    
        this.client.on('connected', () => {
            console.log("Successfully connected to MQTT broker");
        });

        this.client.on('message', (topic: string, payload: Buffer) => {
            if(this.topicMessageCallbacks.has(topic)) {
                this.topicMessageCallbacks.get(topic)(payload);
            }
        })
    };

    onTopicMessage(topic: string, callback: (message: Buffer) => void) {
        this.topicMessageCallbacks.set(topic, callback)
        this.client.subscribe(topic);
    }
}

export default MQTTTopicClient;
