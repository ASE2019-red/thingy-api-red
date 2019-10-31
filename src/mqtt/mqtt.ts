import * as mqtt from 'async-mqtt';
import { AsyncMqttClient, ISubscriptionGrant } from 'async-mqtt';

export class MQTTTopicClient {
    private client?: AsyncMqttClient;
    private topicMessageCallbacks = new Map<string, (message: Buffer) => void>() 

    connect = async (config: {hostname: string, port: string, user: string, password: string}) => {
        this.client = mqtt.connect({
            host: config.hostname,
            port: config.port,
            protocol: 'mqtt',
            username: config.user,
            password: config.password,
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
