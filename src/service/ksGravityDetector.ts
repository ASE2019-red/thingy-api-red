import { createReadStream } from 'fs';
//@ts-ignore
import * as jerzy from 'jerzy';
import { createInterface } from 'readline';
import MQTTTopicClient from '../mqtt/client';
import { gravityTransformer, TopicDefinitions, topicDefinitionsForDevice } from './thingy';
import Vector from './vector';
//@ts-ignore
import * as jstat from 'jstat';

// declare var jerzy: any;

export class KSGravityDetector {
    private definitions: TopicDefinitions;
    private reference: number[][];
    private frameSize: number;
    private frame: any[] = [];
    private ready: boolean = false;
    private yieldCnt: number = 0;
    private currYeld: number;

    constructor(private device: string,
                private mqttClient: MQTTTopicClient) {
        this.definitions = topicDefinitionsForDevice(device);
        this.mqttClient.onTopicMessage(this.definitions.gravity, this.onDataFrame);
        this.reference = new Array();
        this.loadReference();
    }

    private onDataFrame = (rawData: Buffer) => {
        const vector = gravityTransformer(rawData);
        if (this.ready) {
            if (this.frame.length == this.frameSize) {
                this.frame.shift();
            }
            this.frame.push(vector);
            if (this.yieldCnt <= 0) {
                console.log('do test');
                // this.ksTest();
                this.tTest();
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
            this.frameSize = this.reference.length;
            this.yieldCnt = this.frameSize / 2;
        });
    }

    private ksTest(): void {
        const ref = new jerzy.Vector(this.reference);
        const sample = new jerzy.Vector(this.frame);
        const ksTest = new jerzy.Nonparametric.kolmogorovSmirnov(ref, sample);
        if (ksTest.d <= 0.5) {
            this.currYeld = this.yieldCnt;
        }
        console.log(ksTest);

    }

    private tTest(): void {
        let rows = jstat.rows(this.reference);
        console.log(rows);
    }

}
