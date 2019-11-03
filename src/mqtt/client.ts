import * as mqtt from 'async-mqtt';
import {AsyncMqttClient} from 'async-mqtt';

export class MQTTTopicClient {
    private client?: AsyncMqttClient;
    private topicMessageCallbacks = new Map<string, (message: Buffer) => void>();
    private topicDefinitions = {};

    public connect = async (config: {
        hostname: string, port: string, user: string, password: string,
        macThingy1: string, macThingy2: string, macThingy3: string
    }) => {
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

        // TODO: later we should store a list of all available sensors and their topics in the db
        this.topicDefinitions = {
            thingy1: {
                connected: `${config.macThingy1}/Connected`,
                gravity: `${config.macThingy1}/Thingy Motion Service/Thingy Gravity Characteristic`,
                acceleration: `${config.macThingy1}/Thingy Motion Service/Thingy Acceleration Characteristic`,
                sound: `${config.macThingy1}/Thingy Sound Service/Thingy Microphone Characteristic`,
            },
            thingy2: {
                connected: `${config.macThingy2}/Connected`,
                gravity: `${config.macThingy2}/Thingy Motion Service/Thingy Gravity Characteristic`,
                acceleration: `${config.macThingy2}/Thingy Motion Service/Thingy Acceleration Characteristic`,
                sound: `${config.macThingy2}/Thingy Sound Service/Thingy Microphone Characteristic`,
            },
            thingy3: {
                connected: `${config.macThingy3}/Connected`,
                gravity: `${config.macThingy3}/Thingy Motion Service/Thingy Gravity Characteristic`,
                acceleration: `${config.macThingy3}/Thingy Motion Service/Thingy Acceleration Characteristic`,
                sound: `${config.macThingy3}/Thingy Sound Service/Thingy Microphone Characteristic`,
            },
        };
    }

    public onTopicMessage(topic: string, callback: (message: Buffer) => void) {
        this.topicMessageCallbacks.set(topic, callback);
        this.client.subscribe(topic);
    }
}

export default MQTTTopicClient;
