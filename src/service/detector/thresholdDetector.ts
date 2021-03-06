import MQTTTopicClient from '../../mqtt/client';
import Vector from '../stats/vector';
import { DetectFn, Detector } from './detector';

// Observed acceleration when there is no motion (only gravity)
const NO_ADDITIONAL_ACCELERATION = new Vector(0, 0, 1000);

// number of sensor ticks over which we average the acceleration
const AVERAGE_WINDOW = 25;
// acceleration speed above which we consider a coffee is being produced
// if it is hold up for longer than
// COFFE_PRODUCED_MINIMAL_DURATION_THRESHOLD * AVERAGE_WINDOW sensor ticks
const COFFE_PRODUCED_ACCELERATION_THRESHOLD = 38;
// minimum number of average windows over which the acceleration must be higher
// than COFFE_PRODUCED_ACCELERATION_THRESHOLD such that we assumed a coffee is being produced
const COFFE_PRODUCED_MINIMAL_DURATION_THRESHOLD = 4;
// minimum number of average windows over which the acceleration must be lower
// than COFFE_PRODUCED_ACCELERATION_THRESHOLD such that we assumed the coffee is finished
const COFFE_PRODUCED_STOP_THRESHOLD = 4;

class ThresholdDetector extends Detector {

    private averageWindow: number[] = [];
    private consecutiveWindowsAboveThreshold: number = 0;
    private coffeInProduction: boolean = false;
    // only added while a coffe is in production
    private windowsBelowThresholdAfterStart: number = 0;

    /**
     * @param accelerationSensorTopic: full string of the raw motion data topic
     *        for ONE specific thingy device
     * @param onCoffeeProduced function which should be called after the CoffeeDetector
     *        has registered that the coffee machine has finished producing a coffee
     * @param mqttClient
     */
    constructor(machineId: string,
                sensorId: string,
                mqtt: MQTTTopicClient,
                onDetect: DetectFn) {
        super(machineId, sensorId, mqtt, onDetect);
        this.mqtt.onTopicMessage(this.definitions.acceleration, this.receiveMotionData);
    }

    public stop(): void {
        this.mqtt.removeListener(this.definitions.acceleration, this.receiveMotionData);
    }

    public receiveMotionData = (rawData: Buffer) => {
        // todo: find out how we can get numbers from mqtt, instead of a string...
        const numbers = rawData.toString().trim().split(',');
        const accelerationX = parseInt(numbers[0]);
        const accelerationY = parseInt(numbers[1]);
        const accelerationZ = parseInt(numbers[2]);
        const accelerationVector = new Vector(accelerationX, accelerationY, accelerationZ);
        const effectiveAccelerationVector = accelerationVector.minus(NO_ADDITIONAL_ACCELERATION);
        const effectiveAcceleration = effectiveAccelerationVector.norm();
        this.averageWindow.push(effectiveAcceleration);
        if (this.averageWindow.length >= AVERAGE_WINDOW) {
            const averageWindowAcceleration = this.currentAverage();
            this.detectIsProducingCoffee(averageWindowAcceleration);
            this.averageWindow = [];
        }

    }

    private currentAverage() {
        return this.averageWindow.reduce((sum, current) => sum + current) / this.averageWindow.length;
    }

    private stoppedProducingCoffee() {
        return this.windowsBelowThresholdAfterStart >= COFFE_PRODUCED_STOP_THRESHOLD;
    }

    private detectIsProducingCoffee(averageWindowAcceleration: number) {
        if (averageWindowAcceleration < COFFE_PRODUCED_ACCELERATION_THRESHOLD) {
            // acceleration goes below threshold, after a long window over the threshold
            if (this.coffeInProduction) {
                this.windowsBelowThresholdAfterStart += 1;
                // below threshold for a longer time
                // => coffee production is finished
                if (this.stoppedProducingCoffee) {
                    this.onDetect(this.machineId);
                    this.coffeInProduction = false;
                    this.windowsBelowThresholdAfterStart = 0;
                }
            }
            // reset the amount of windows above threshold, since its no longer the case
            this.consecutiveWindowsAboveThreshold = 0;
        } else {
            // case above threshold:
            this.consecutiveWindowsAboveThreshold += 1;
            if (this.consecutiveWindowsAboveThreshold >= COFFE_PRODUCED_MINIMAL_DURATION_THRESHOLD) {
                this.coffeInProduction = true;
            }
        }

    }
}

export default ThresholdDetector;
