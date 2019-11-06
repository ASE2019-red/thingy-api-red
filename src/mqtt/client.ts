import * as mqtt from 'async-mqtt';
import {AsyncMqttClient} from 'async-mqtt';

export class MQTTTopicClient {
    private client?: AsyncMqttClient;
    private topicMessageCallbacks = new Map<string, (message: Buffer) => void>();

    public async connect(config: {
        hostname: string, port: string, user: string, password: string,
        macThingy1: string, macThingy2: string, macThingy3: string,
    }) {
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
        });

        this.client.on('connected', () => {
            console.log('Successfully connected to MQTT broker');
        });

        this.client.on('message', (topic: string, payload: Buffer) => {
            if (this.topicMessageCallbacks.has(topic)) {
                this.topicMessageCallbacks.get(topic)(payload);
            }
        });
    }

    public async disconnect() {
        await this.client.end();
    }

    public onTopicMessage(topic: string, callback: (message: Buffer) => void) {
        this.client.subscribe(topic).then((r) => {
            this.topicMessageCallbacks.set(topic, callback);
        });
    }

    public async publish(topic: string, message: string | Buffer) {
        await this.client.publish(topic, message);
    }
}

export default MQTTTopicClient;
