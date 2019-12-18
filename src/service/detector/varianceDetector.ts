import { InfluxDB } from 'influx';
// @ts-ignore
import * as jstat from 'jstat';
import CalibrationController from '../../controllers/calibration';
import MQTTTopicClient from '../../mqtt/client';
import { gravityTransformer } from '../thingy';
import { MovingWindow1d } from './../stats/movingWindow1d';
import { MovingWindow3d } from './../stats/movingWindow3d';
import { DetectFn, Detector } from './detector';

export class VarianceGravityDetector extends Detector {
    // the reference window
    protected reference: MovingWindow3d;
    // size of the moving window capturing frames
    protected windowSize = 25;
    protected window: MovingWindow3d;
    protected ready: boolean = false;
    // seconds to backoff
    protected backoffTime = 35;
    protected wait = false;
    // mean probability to be reached for a detection event to trigger
    protected probabilityLimit = 0.60;
    // size of the consecutive tests window
    protected numTests = 5;
    protected consecutiveTests: MovingWindow1d;
    // test all stepSize frames
    protected stepSize = 10;
    protected frameCounter = 0;

    constructor(machineId: string,
                sensorId: string,
                mqtt: MQTTTopicClient,
                onDetect: DetectFn,
                private influx: InfluxDB) {
        super(machineId, sensorId, mqtt, onDetect);
        this.mqtt.onTopicMessage(this.definitions.gravity, this.onDataFrame);
        this.reference = new MovingWindow3d(-1);
        this.consecutiveTests = new MovingWindow1d(this.numTests);
        this.loadReference();
    }

    public stop(): void {
        this.mqtt.removeListener(this.definitions.gravity, this.onDataFrame);
    }

    protected loadReference(): void {
        const query = CalibrationController.calibrationQuery(this.machineId);
        this.influx.query(query).then((results) => {
            results.forEach((r: any) => {
                const x = r.x;
                const y = r.y;
                const z = r.z;
                this.reference.push([x, y, z]);
            });
            console.log(`Reference for ${this.machineId} loaded.`);
            this.ready = true;
            this.window = new MovingWindow3d(this.windowSize);
        });
    }

    private onDataFrame = (rawData: Buffer) => {
        const vector = gravityTransformer(rawData);
        if (this.ready) {
            this.window.push(vector);
            if (!this.limiter()) {
                this.test();
            }
        }
    }

    private limiter(): boolean {
        this.frameCounter++;
        const doLimit = this.frameCounter % this.stepSize != 0
            || this.wait
            || this.window.size() < this.window.maxSize;
        if (!doLimit) this.frameCounter = 0;
        return doLimit;
    }

    private backoff(): void {
        this.wait = true;
        setTimeout(() => {
            this.wait = false;
        }, this.backoffTime * 1000);
    }

    /**
     * Perform a Analysis of variance (ANOVA) test of the captured window and the reference.
     * Each dimension is tested separately. If the average of the results exceeds the specified
     * probability, a coffee is detected.
     */
    private test(): void {
        const px = jstat.anovaftest(this.reference.x, this.window.x);
        const py = jstat.anovaftest(this.reference.y, this.window.y);
        const pz = jstat.anovaftest(this.reference.z, this.window.z);
        const pavg = (px + py + pz) / 3;
        // console.log(`p_x: ${p_x} p_y: ${p_y} p_z: ${p_z} mean: ${p_avg}`);
        this.consecutiveTests.push(pavg);
        let windowSum = 0;
        this.consecutiveTests.elements.forEach(num => {
            windowSum += num;
        });
        const mean = windowSum / this.consecutiveTests.maxSize;
        // console.log(`Mean of last ${this.numTests} tests: ${mean}`);
        if (mean >= this.probabilityLimit) {
            this.consecutiveTests.reset();
            console.log(`Coffee produced! Detector: ${this.constructor.name}`);
            this.onDetect(this.machineId);
            this.backoff();
        }
    }

}
