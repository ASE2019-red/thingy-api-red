import * as mqtt from 'async-mqtt';
import {AsyncMqttClient} from 'async-mqtt';
import { EventEmitter } from 'events';

export class MQTTTopicClient extends EventEmitter {
    private client?: AsyncMqttClient;

    constructor() {
        super();
        this.setMaxListeners(100);
    }

    public async connect(config: {
        hostname: string, port: string, user: string, password: string,
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

        this.client.on('connect', () => {
            console.log('Successfully connected to MQTT broker');
        });

        this.client.on('message', (topic: string, payload: Buffer) => {
            this.emit(topic, payload);
        });
    }

    public async disconnect() {
        await this.client.end();
    }

    /**
     * Subscribe to the given topic.
     * @param topic the full topic definition.
     * @param listener the callback function to be invoked.
     * If you need to keep the closure of the caller,
     * the listener needs to be bound or a arrow function.
     */
    public onTopicMessage(topic: string, listener: (message: Buffer) => void) {
        this.client.subscribe(topic).then((r) => {
            this.addListener(topic, listener);
        });
    }

    public async publish(topic: string, message: string | Buffer) {
        await this.client.publish(topic, message);
    }
}

export default MQTTTopicClient;
