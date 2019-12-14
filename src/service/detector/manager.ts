import { getManager, Repository } from 'typeorm';
import { Websocket } from '../../websocket';
import { Coffee } from './../../models/coffee';
import { Machine } from './../../models/machine';
import { MQTTTopicClient } from './../../mqtt/client';
import { Detector } from './detector';
import ThresholdDetector from './thresholdDetector';
import { VarianceGravityDetector } from './varianceDetector';

// number of seconds signals from detectors are ignored
// when multiple detectors are attached to a machine.
const IGNORE_SIGNALS_TIME = 15;

export default class DetectorManager {

    private readonly detectors: Map<string, Attachment>;

    constructor(private mqtt: MQTTTopicClient, private notificationWebsocket: Websocket) {
        this.detectors = new Map<string, Attachment>();
        this.createForAllMachines();
    }

    public create(machine: Machine, ctor: new(...args: any) => Detector, ...more: any) {

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

        const detector = new ctor(machine.id, machine.sensorIdentifier, this.mqtt, onCoffeeProduced, more);
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
        this.create(machine, ThresholdDetector);
        if (machine.calibrated) {
            this.create(machine, VarianceGravityDetector);
        }
    }

    public remove(machine: Machine, detector: typeof Detector) {
        const machineDetectors = this.detectors.get(machine.id);
        if (!!machineDetectors) {
            machineDetectors.detach(detector);
        }
    }

    public removeAll(machine: Machine) {
        this.remove(machine, ThresholdDetector);
        this.remove(machine, VarianceGravityDetector);
    }

    private createForAllMachines() {
        getManager().getRepository(Machine).find().then((machines: Machine[]) => {
            machines.forEach((machine: Machine) => {
                this.create(machine, ThresholdDetector);
                if (machine.calibrated) {
                    this.create(machine, VarianceGravityDetector);
                }
            });
        });
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

    public detach(detector: typeof Detector) {
        const attached = this.detectors.get(detector.name);
        if (attached) attached.stop();
        this.detectors.delete(detector.name);
    }

    public hasMany(): boolean {
        return this.detectors.size > 1;
    }
}
