import MQTTTopicClient from '../../mqtt/client';
import {TransformerFn} from '../thingy';
import { TopicDefinitions, topicDefinitionsForDevice } from './../thingy';

export abstract class DataRecorder {
    public topicDefinitions: TopicDefinitions;

    protected constructor(protected mqttClient: MQTTTopicClient, protected device: any, protected topic: string) {
        this.topicDefinitions = topicDefinitionsForDevice(device);
    }

    public get topicDefinition() {
        switch (this.topic) {
            case 'gravity': return this.topicDefinitions.gravity;
            case 'acceleration': return this.topicDefinitions.acceleration;
            default: return undefined;
        }
    }

    public abstract start(measurement?: string, tags?: any, transformer?: TransformerFn): void;

    public abstract stop(measurement?: string): void;

    public abstract isRecording(): boolean;
}

export default DataRecorder;
