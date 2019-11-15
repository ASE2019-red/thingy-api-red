import { createReadStream } from 'fs';
import * as jerzy from 'jerzy';
import { createInterface } from 'readline';
import MQTTTopicClient from '../mqtt/client';
import Vector from './vector';

// declare var jerzy: any;

export class KSGravityDetector {
    private reference: number[][];
    private frameSize: number;
    private frame: any[] = [];
    private ready: boolean = false;
    private yieldCnt: number = 0;
    private currYeld: number;

    constructor(private topic: string,
                private onCoffeeProduced: () => void,
                private mqttClient: MQTTTopicClient) {
        this.mqttClient.onTopicMessage(topic, this.onDataFrame);
        this.reference = new Array();
        this.loadReference();
    }

    private onDataFrame = (rawData: Buffer) => {
        // const numbers = rawData.toString().trim().split(',');
        const x = rawData.readFloatLE(0);
        const y = rawData.readFloatLE(4);
        const z = rawData.readFloatLE(8);
        const vector = [x, y, z];
        if (this.ready) {
            if (this.frame.length == this.frameSize) {
                this.frame.shift();
            }
            this.frame.push(vector);
            if (this.yieldCnt <= 0) {
                this.ksTest();
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
            this.ready = true;
            this.frameSize = this.reference.length;
            this.yieldCnt = this.frameSize / 2;
        });
    }

    private ksTest(): void {
        const k = new jerzy.Kolomogorov();
        const ref = new jerzy.Vector(this.reference);
        const sample = new jerzy.Vector(this.frame);
        const ksTest = new jerzy.Nonparametric.kolmogorovSmirnov(ref, this.frame);
        if (ksTest.d <= 0.5) {
            this.currYeld = this.yieldCnt;
        }

    }

}
