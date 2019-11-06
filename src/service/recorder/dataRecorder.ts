import {InfluxDB} from 'influx';
import MQTTTopicClient from '../../mqtt/client';
import { TransformerFn } from '../thingy';

export abstract class DataRecorder {
    public static topicDefinitions: any = {};

    constructor(protected config: any, protected mqttClient: MQTTTopicClient) {

        // TODO: later we should store a list of all available sensors and their topics in the db
        // or move them to the thingy lib
        DataRecorder.topicDefinitions = {
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

    public abstract start(topic: string, measurement: string, tags: any, transformer: TransformerFn): void;

    public abstract stop(topic: string, measurement: string): void;

    public abstract isRecording(): boolean;
}

export default DataRecorder;
