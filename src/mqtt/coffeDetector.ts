import MQTTTopicClient from "./mqtt";
import Vector from "./vector";
import { Machine } from "../models/machine";
import { Repository, getManager } from "typeorm";
import { Coffee } from "../models/coffee";

// Constants: We should probably fine tune them based on the
// sensor and the coffee machine (maybe within some setup process for a new machine?)

// Observed acceleration when there is no motion (only gravity)
const NO_ADDITIONAL_ACCELERATION = new Vector(0, 0, 1000)

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

class CoffeeDetector {
    private mqttClient: MQTTTopicClient;
    private static accelerationTopic: string;
    private averageWindow: number[] = [];
    private consecutiveWindowsAboveThreshold: number = 0;
    private coffeInProduction: boolean = false;
    // only added while a coffe is in production
    private windowsBelowThresholdAfterStart: number = 0;
    private onCoffeeProduced: () => void;

    static async createForAllMachines(accelerationTopic: string, mqttClient: MQTTTopicClient) {
        CoffeeDetector.accelerationTopic = accelerationTopic;
        getManager().getRepository(Machine).find().then(machines => {
            machines.forEach(machine => {
                CoffeeDetector.createForMachine(machine, mqttClient)
            })
        })
    }
    
    static createForMachine(machine: Machine,
                            mqttClient: MQTTTopicClient) {

        const onCoffeeProduced = () => {
            const coffeeRepo: Repository<Coffee> = getManager().getRepository(Coffee);
            const newCoffee = new Coffee();
            newCoffee.machine = machine;
            coffeeRepo.save(newCoffee);
        }

        new CoffeeDetector(
            `${machine.sensorIdentifier}/${CoffeeDetector.accelerationTopic}`,
            onCoffeeProduced,
            mqttClient
        )
    }

    /** 
     * @param accelerationSensorTopic: full string of the raw motion data topic
     *        for ONE specific thingy device
     * @param onCoffeeProduced function which should be called after the CoffeeDetector
     *        has registered that the coffee machine has finished producing a coffee
     * @param mqttClient
     */
    constructor(accelerationSensorTopic: string,
        onCoffeeProduced: () => void,
        mqttClient: MQTTTopicClient) {
        this.onCoffeeProduced = onCoffeeProduced;
        this.mqttClient = mqttClient;
        this.mqttClient.onTopicMessage(accelerationSensorTopic, this.receiveMotionData);
    }

    receiveMotionData = (rawData: Buffer) => {
        // todo: find out how we can get numbers from mqtt, instead of a string...
        const numbers = rawData.toString().trim().split(',');
        const accelerationX = parseInt(numbers[0]);
        const accelerationY = parseInt(numbers[1]);
        const accelerationZ = parseInt(numbers[2]);
        const accelerationVector = new Vector(accelerationX, accelerationY, accelerationZ)
        const effectiveAccelerationVector = accelerationVector.minus(NO_ADDITIONAL_ACCELERATION);
        const effectiveAcceleration = effectiveAccelerationVector.norm()
        this.averageWindow.push(effectiveAcceleration);
        if (this.averageWindow.length >= AVERAGE_WINDOW) {
            const averageWindowAcceleration = this.currentAverage();
            this.detectIsProducingCoffee(averageWindowAcceleration);
            this.averageWindow = []
            console.log("window")
        }
    }

    currentAverage() {
        return this.averageWindow.reduce((sum, current) => sum + current) / this.averageWindow.length;
    }

    stoppedProducingCoffee() {
        return this.windowsBelowThresholdAfterStart >= COFFE_PRODUCED_STOP_THRESHOLD;
    }

    detectIsProducingCoffee(averageWindowAcceleration: number) {
        if (averageWindowAcceleration < COFFE_PRODUCED_ACCELERATION_THRESHOLD) {
            // acceleration goes below threshold, after a long window over the threshold
            if (this.coffeInProduction) {
                this.windowsBelowThresholdAfterStart += 1;
                // below threshold for a longer time 
                // => coffee production is finished
                if (this.stoppedProducingCoffee) {
                    this.onCoffeeProduced();
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

export default CoffeeDetector;