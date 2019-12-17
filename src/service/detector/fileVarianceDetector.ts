import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import MQTTTopicClient from '../../mqtt/client';
import { MovingWindow3d } from '../stats/movingWindow3d';
import { DetectFn } from './detector';
import { VarianceGravityDetector } from './varianceDetector';

export class FileVarianceGravityDetector extends VarianceGravityDetector {

    constructor(machineId: string,
                sensorId: string,
                mqtt: MQTTTopicClient,
                onDetect: DetectFn) {
        super(machineId, sensorId, mqtt, onDetect, null);
    }

    protected loadReference(): void {
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
            this.window = new MovingWindow3d(frameSize);
        });
    }

}
