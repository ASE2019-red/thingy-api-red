import {ParameterizedContext} from 'koa';
import {getManager} from 'typeorm';
import {Coffee} from '../models/coffee';
import {Machine} from '../models/machine';
import { createOnCoffeeProduced } from '../service/coffeeProducedEventHandler';
import DetectorManager from '../service/detector/manager';
import ThresholdDetector from '../service/detector/thresholdDetector';

export default class MachineController {

    private static get repository() {
        return getManager().getRepository(Machine);
    }

    public static async getMachines(ctx: ParameterizedContext) {
        const machines: Machine[] = await MachineController.repository.find();

        ctx.status = 200;
        ctx.body = machines;
    }

    public static async createMachine(ctx: ParameterizedContext) {
        const newMachine = new Machine();
        const body = ctx.request.body;
        console.log(body);
        newMachine.name = body.name;
        newMachine.sensorIdentifier = body.sensorIdentifier;
        newMachine.maintenanceThreshold = body.maintenanceThreshold;
        newMachine.active = true;
        newMachine.calibrated = false;
        try {
            const savedMachine = await MachineController.repository.save(newMachine);
            const detectors: DetectorManager = ctx.detectors;
            detectors.create(savedMachine, ThresholdDetector.name);

            ctx.status = 201;
            ctx.body = savedMachine;
        } catch {
            ctx.status = 422;
            ctx.body = 'Saving the machine failed';
        }

    }

    public static async getMachine(ctx: ParameterizedContext) {
        const machine = await MachineController.repository.findOne(ctx.params.id);

        if (machine) {
            ctx.status = 200;
            ctx.body = machine;
        } else {
            ctx.status = 400;
            ctx.body = 'The machine you are trying to retrieve does not exist!';
        }
    }

    public static async getMachineCoffees(ctx: ParameterizedContext) {
        const machine = await MachineController.repository.findOne();

        if (machine) {
            let query = getManager().createQueryBuilder(Coffee, 'coffee')
                .where('coffee.machine_id = :id', { id: ctx.params.id });

            if (ctx.query.after) {
                query = query.where('coffee.createdAt >= :date', { date: ctx.query.after });
            }

            if (ctx.query.before) {
                query = query.where('coffee.createdAt <= :date', { date: ctx.query.before });
            }

            const coffees = await query.getMany();
            ctx.status = 200;
            ctx.body = coffees;
        } else {
            ctx.status = 400;
            ctx.body = 'The machine you are trying to produce a test coffee for does not exist!';
        }
    }

    // only for testing!
    public static async postMachineCoffee(ctx: ParameterizedContext) {
        const machine = await MachineController.repository.findOne();

        if (machine) {
            const onCoffeeProduced = createOnCoffeeProduced(machine, getManager().getRepository(Coffee),
                                                            ctx.notificationsWs);

            await onCoffeeProduced();
            ctx.status = 200;
            ctx.body = {};
        } else {
            ctx.status = 400;
            ctx.body = 'The machine you are trying to retrieve coffees for does not exist!';
        }
    }

}
