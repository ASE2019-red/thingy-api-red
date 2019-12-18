import { writeFileSync } from 'fs';
import { MQTTTopicClient } from '../../mqtt/client';
import { TransformerFn } from '../thingy';
import { DataRecorder } from './dataRecorder';

export class FileDataRecorder extends DataRecorder {
    private recording = false;
    private frames: any[] = [];

    constructor(mqttClient: MQTTTopicClient, device: any, topic: string, private outfile: string) {
        super(mqttClient, device, topic);
    }

    public start(measurement: string, tags: any, transformer: TransformerFn): void {
        this.mqttClient.onTopicMessage(this.topicDefinitions.gravity, (async (message: Buffer) => {
            if (this.isRecording) {
                const fields = transformer(message);
                this.frames.push(fields);
            }
        }));
    }

    public stop(measurement: string): void {
        this.recording = false;
        const data = this.frames.map((v) => v.join(', ')).join('\n');
        writeFileSync('recording.csv', data);
    }

    public isRecording(): boolean {
        return this.recording;
    }

}
