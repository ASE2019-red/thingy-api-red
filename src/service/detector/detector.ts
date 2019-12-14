import { MQTTTopicClient } from './../../mqtt/client';
import { TopicDefinitions, topicDefinitionsForDevice } from './../thingy';

export type DetectFn = (machineId: string) => void;
export abstract class Detector {
    protected definitions: TopicDefinitions;

    constructor(protected machineId: string, protected sensorId: string,
                protected mqtt: MQTTTopicClient, protected onDetect: DetectFn) {
        this.definitions = topicDefinitionsForDevice(sensorId);
    }

    public abstract stop(): void;
}
