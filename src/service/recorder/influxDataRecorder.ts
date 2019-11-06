import { InfluxDB } from 'influx';
import MQTTTopicClient from '../../mqtt/client';
import { TransformerFn } from '../thingy';
import { DataRecorder } from './dataRecorder';

export class InfluxDataRecorder extends DataRecorder {
    private record = false;
    // simple limit for db writes
    private frameCount = 0;
    private nthFrame = 50;

    constructor(config: any, mqttClient: MQTTTopicClient, private influxClient: InfluxDB) {
        super(config, mqttClient);
    }

    public start(topic: string, measurement: string, tags: any = {}, transformer: TransformerFn) {
        this.record = true;
        this.mqttClient.onTopicMessage(topic, async (message: Buffer) => {
            this.frameCount++;
            if (!this.isRecording() || this.frameCount % this.nthFrame != 0) {
                return;
            }
            try {
                const data = transformer(message);
                const fields = {x: data[0], y: data[1], z: data[2]};
                await this.influxClient.writePoints([{measurement, tags, fields}]);
            } catch (e) {
                console.error('Cannot write to InfluxDB');
                console.error(e);
            }
        });
    }

    public stop(topic: string, measurement: string): void {
        this.record = false;
    }

    public isRecording(): boolean {
        return this.record;
    }
}
