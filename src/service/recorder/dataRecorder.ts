import MQTTTopicClient from '../../mqtt/client';
import {TransformerFn} from '../thingy';

export abstract class DataRecorder {
    public topicDefinitions: any = {};

    protected constructor(protected mqttClient: MQTTTopicClient, protected device: any) {
        this.topicDefinitions = {
            connected: `${this.device}/Connected`,
            gravity: `${this.device}/Thingy Motion Service/Thingy Gravity Characteristic`,
            acceleration: `${this.device}/Thingy Motion Service/Thingy Acceleration Characteristic`,
            sound: `${this.device}/Thingy Sound Service/Thingy Microphone Characteristic`,
        };
    }

    public abstract start(measurement: string, tags: any, transformer: TransformerFn): void;

    public abstract stop(measurement: string): void;

    public abstract isRecording(): boolean;
}

export default DataRecorder;
