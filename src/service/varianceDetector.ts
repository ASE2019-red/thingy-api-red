import { createReadStream } from 'fs';
//@ts-ignore
import * as jstat from 'jstat';
import { createInterface } from 'readline';
import MQTTTopicClient from '../mqtt/client';
import { MovingWindow } from './stats/movingWindow';
import { gravityTransformer, TopicDefinitions, topicDefinitionsForDevice } from './thingy';

export class VarianceGravityDetector {
    private definitions: TopicDefinitions;
    private reference: MovingWindow;
    private window: MovingWindow;
    private ready: boolean = false;
    private yieldCnt: number = 0;
    private probabilityLimit = 0.55;

    constructor(private device: string,
                private mqttClient: MQTTTopicClient) {
        this.definitions = topicDefinitionsForDevice(device);
        this.mqttClient.onTopicMessage(this.definitions.gravity, this.onDataFrame);
        this.reference = new MovingWindow(-1, 1.0);
        this.loadReference();
    }

    private onDataFrame = (rawData: Buffer) => {
        const vector = gravityTransformer(rawData);
        if (this.ready) {
            this.window.push(vector);
            if (this.yieldCnt <= 0) {
                this.test();
            } else {
                this.yieldCnt--;
            }
        }
    }

    private loadReference(): void {
        const readInterface = createInterface(
            createReadStream('reference.csv'));
        readInterface.on('line', (line) => {
            const arr = line.split(', ');
            const x = parseFloat(arr[0]);
            const y = parseFloat(arr[1]);
            const z = parseFloat(arr[2]);
            this.reference.push([x, y, z]);
        });
        readInterface.on('close', () => {
            console.log('file read');
            this.ready = true;
            const frameSize = this.reference.size();
            this.yieldCnt = frameSize;
            this.window = new MovingWindow(frameSize);
        });
    }

    /**
     * Perform a Analysis of variance (ANOVA) test of the captured window and the reference.
     * Each dimension is tested separately. If the average of the results exceeds the specified
     * probability, a coffee is detected.
     */
    private test(): void {
        const p_x = jstat.anovaftest(this.reference.x, this.window.x);
        const p_y = jstat.anovaftest(this.reference.y, this.window.y);
        const p_z = jstat.anovaftest(this.reference.z, this.window.z);
        const p_avg = (p_x + p_y + p_z) / 3;
        console.log(`p_x: ${p_x} p_y: ${p_y} p_z: ${p_z} mean: ${p_avg}`);
        if (p_avg >= this.probabilityLimit) {
            console.log('coffee produced!');
            this.yieldCnt = Math.round(this.reference.size() * 0.75);
        }
    }

}
