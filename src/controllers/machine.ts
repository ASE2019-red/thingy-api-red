import {ParameterizedContext} from 'koa';
import {getManager} from 'typeorm';
import {Coffee} from '../models/coffee';
import {Machine} from '../models/machine';
import CoffeeDetector from '../service/coffeeDetector';

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
            CoffeeDetector.createForMachine(savedMachine, ctx.mqtt);

            ctx.status = 201;
            ctx.body = savedMachine;
        } catch {
            ctx.status = 422;
            ctx.body = 'Saving the machine failed';
        }

    }

    public static async updateMachine(ctx: ParameterizedContext) {
        const body = ctx.request.body;
        if (!body.id) {
            ctx.status = 400;
            ctx.body = 'Invalid ID supplied';
            return;
        }
        const machine = await MachineController.repository.findOne(body.id);
        if (!machine) {
            ctx.status = 404;
            ctx.body = 'Machine not found';
            return;
        }
        const partial = new Machine();
        if (body.maintenanceThreshold) partial.maintenanceThreshold = body.maintenanceThreshold;
        if (body.name) partial.name = body.name;
        if (body.active === true) partial.active = true;
        else if (body.active === false) partial.active = false;
        if (body.calibrated === false) partial.calibrated = false;
        if (body.calibrated === true) {
            ctx.status = 400;
            ctx.body = 'Cannot enable calibration.';
            return;
        }
        try {
            await MachineController.repository.update(body.id, partial);
            const savedMachine = await MachineController.repository.findOne(body.id);
            // TODO: update detectors (other branch)
            ctx.status = 200;
            ctx.body = savedMachine;
        } catch {
            ctx.status = 422;
            ctx.body = 'Updating the machine failed';
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
                .where('coffee.machine_id = :id', {id: ctx.params.id});

            if (ctx.query.after) {
                query = query.where('coffee.createdAt >= :date', {date: ctx.query.after});
            }

            if (ctx.query.before) {
                query = query.where('coffee.createdAt <= :date', {date: ctx.query.before});
            }

            const coffees = await query.getMany();
            ctx.status = 200;
            ctx.body = coffees;
        } else {
            ctx.status = 400;
            ctx.body = 'The machine you are trying to retrieve coffees for does not exist!';
        }
    }

}
