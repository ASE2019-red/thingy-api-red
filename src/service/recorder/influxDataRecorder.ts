import {InfluxDB, IPoint} from 'influx';
import MQTTTopicClient from '../../mqtt/client';
import {TransformerFn} from '../thingy';
import {DataRecorder} from './dataRecorder';

export class InfluxDataRecorder extends DataRecorder {
    private record = false;

    // simple limit for db writes
    private frameCount = 0;
    private stepSize = 2;

    constructor(mqttClient: MQTTTopicClient, private influxClient: InfluxDB,
                protected device: any, topic: string, private transformer: TransformerFn,
                private influxMeasurement: string, private influxTags: any = {},
                stepSize?: number) {
        super(mqttClient, device, topic);
        if (stepSize) this.stepSize = stepSize;
    }

    public start(): void {
        this.record = true;
        this.mqttClient.onTopicMessage(this.topicDefinition, this.listener.bind(this));
    }

    public stop(): void {
        this.mqttClient.removeListener(this.topicDefinition, this.listener);
    }

    public isRecording(): boolean {
        this.record = false;
        return this.record;
    }

    public async listener(message: Buffer): Promise<void> {
        this.frameCount++;
        if (!this.record || this.frameCount % this.stepSize != 0) {
            return;
        }
        try {
            const fields = this.transformer(message);
            const point: IPoint = {
                measurement: this.influxMeasurement,
                tags: this.influxTags,
                fields,
            };
            await this.influxClient.writePoints([point]);
        } catch (e) {
            console.error('Cannot write to InfluxDB');
            console.error(e);
        }
    }
}
