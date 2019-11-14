import {InfluxDB} from 'influx';
import MQTTTopicClient from '../../mqtt/client';
import {TransformerFn} from '../thingy';
import {DataRecorder} from './dataRecorder';

export class InfluxDataRecorder extends DataRecorder {
    private record = false;

    // simple limit for db writes
    private frameCount = 0;
    private nthFrame = 50;

    constructor(mqttClient: MQTTTopicClient, private influxClient: InfluxDB, protected device: any) {
        super(mqttClient, device);
    }

    public start(measurement: string, tags: any = {}, transformer: TransformerFn) {
        this.record = true;
        this.mqttClient.onTopicMessage(this.topicDefinitions.gravity, (async (message: Buffer) => {
            // FIXME: THIS is not accessible at callback execution time
            // this.frameCount++;
            // if (!this.isRecording() || this.frameCount % this.nthFrame != 0) {
            //     return;
            // }
            try {
                const fields = transformer(message);
                await this.influxClient.writePoints([{measurement, tags, fields}]);
            } catch (e) {
                console.error('Cannot write to InfluxDB');
                console.error(e);
            }
        }));
    }

    public stop(measurement: string): void {
        this.record = false;
    }

    public isRecording(): boolean {
        return this.record;
    }
}
