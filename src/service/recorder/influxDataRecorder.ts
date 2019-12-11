import {InfluxDB} from 'influx';
import MQTTTopicClient from '../../mqtt/client';
import {TransformerFn} from '../thingy';
import {DataRecorder} from './dataRecorder';

export class InfluxDataRecorder extends DataRecorder {
    private record = false;

    // simple limit for db writes
    private frameCount = 0;
    private stepSize = 2;

    constructor(mqttClient: MQTTTopicClient, private influxClient: InfluxDB,
                protected device: any, topic: string, stepSize?: number) {
        super(mqttClient, device, topic);
        if (stepSize) this.stepSize = stepSize;
    }

    public start(measurement: string, tags: any = {}, transformer: TransformerFn) {
        this.record = true;
        this.mqttClient.onTopicMessage(this.topicDefinition, (async (message: Buffer) => {
            this.frameCount++;
            if (!this.isRecording() || this.frameCount % this.stepSize != 0) {
                return;
            }
            try {
                const fields = transformer(message);
                await this.influxClient.writePoints([{measurement, tags, fields}]);
            } catch (e) {
                console.error('Cannot write to InfluxDB');
                console.error(e);
            }
        }).bind(this));
    }

    public stop(): void {
        this.record = false;
    }

    public isRecording(): boolean {
        return this.record;
    }
}
