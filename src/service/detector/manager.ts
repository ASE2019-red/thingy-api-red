import { InfluxDB } from 'influx';
import { getManager, Repository } from 'typeorm';
import { Websocket } from '../../websocket';
import { Coffee } from './../../models/coffee';
import { Machine } from './../../models/machine';
import { MQTTTopicClient } from './../../mqtt/client';
import { DetectFn, Detector } from './detector';
import ThresholdDetector from './thresholdDetector';
import { VarianceGravityDetector } from './varianceDetector';

// number of seconds signals from detectors are ignored
// when multiple detectors are attached to a machine.
const IGNORE_SIGNALS_TIME = 15;

export default class DetectorManager {

    private readonly detectors: Map<string, Attachment>;

    constructor(private mqtt: MQTTTopicClient, private influx: InfluxDB,
                private notificationWebsocket: Websocket) {
        this.detectors = new Map<string, Attachment>();
        this.createForAllMachines();
    }

    public create(machine: Machine, type: string) {

        const onCoffeeProduced = (machineId: string) => {
            const attachment = this.detectors.get(machineId);
            if (attachment.ignoreSignals) return;

            // save coffee in db
            const coffeeRepo: Repository<Coffee> = getManager().getRepository(Coffee);
            const newCoffee = new Coffee();
            newCoffee.machine = machine;
            coffeeRepo.save(newCoffee);

            // notify clients through websocket
            this.notificationWebsocket.broadcast(() => {
                const data = { coffeeProduced: machine.id };
                return JSON.stringify(data);
            });

            if (attachment.hasMany()) {
                attachment.ignoreSignals = true;
                setTimeout(() => {
                    attachment.ignoreSignals = false;
                }, IGNORE_SIGNALS_TIME * 1000);
            }

        };

        const detector = this.factory(machine, onCoffeeProduced, type);
        const machineDetectors = this.detectors.get(machine.id);
        if (!!machineDetectors) {
            machineDetectors.attach(detector);
        } else {
            const attachment = new Attachment();
            attachment.attach(detector);
            this.detectors.set(machine.id, attachment);
        }

    }

    public createAll(machine: Machine) {
        this.create(machine, ThresholdDetector.name);
        if (machine.calibrated) {
            this.create(machine, VarianceGravityDetector.name);
        }
    }

    public remove(machine: Machine, detector: string) {
        const machineDetectors = this.detectors.get(machine.id);
        if (!!machineDetectors) {
            machineDetectors.detach(detector);
        }
    }

    public removeAll(machine: Machine) {
        this.remove(machine, ThresholdDetector.name);
        this.remove(machine, VarianceGravityDetector.name);
    }

    private createForAllMachines() {
        getManager().getRepository(Machine).find().then((machines: Machine[]) => {
            machines.forEach((machine: Machine) => {
                this.create(machine, ThresholdDetector.name);
                if (machine.calibrated) {
                    this.create(machine, VarianceGravityDetector.name);
                }
            });
        });
    }

    private factory(machine: Machine, onDetect: DetectFn, type: string): Detector {
        if (type === VarianceGravityDetector.name) {
            return new VarianceGravityDetector(machine.id, machine.sensorIdentifier, this.mqtt, onDetect, this.influx);
        } else {
            return new ThresholdDetector(machine.id, machine.sensorIdentifier, this.mqtt, onDetect);
        }
    }
}

// tslint:disable-next-line: max-classes-per-file
class Attachment {
    public ignoreSignals = false;
    private detectors: Map<string, Detector>;

    constructor() {
        this.detectors = new Map<string, Detector>();
    }

    public attach(detector: Detector) {
        if (this.detectors.has(detector.constructor.name)) {
            this.detectors.get(detector.constructor.name).stop();
        }
        this.detectors.set(detector.constructor.name, detector);
    }

    public detach(detector: string) {
        const attached = this.detectors.get(detector);
        if (attached) attached.stop();
        this.detectors.delete(detector);
    }

    public hasMany(): boolean {
        return this.detectors.size > 1;
    }
}
