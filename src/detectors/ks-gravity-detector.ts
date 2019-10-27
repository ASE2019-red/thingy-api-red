import MQTTTopicClient from '../mqtt/mqtt';
import Vector from '../mqtt/vector';
import { readFileSync, createReadStream } from 'fs';
import { createInterface } from 'readline';

export class KSGravityDetector {
    private reference: number[][];

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
        // console.log(x, y, z);
        // console.log(rawData);
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
        readInterface.on('close', () => console.log(this.reference));
    }

}
