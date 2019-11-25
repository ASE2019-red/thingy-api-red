import {ParameterizedContext} from 'koa';
import {getManager} from 'typeorm';
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
        newMachine.active = true;
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
        const machine = await MachineController.repository.findOne(ctx.params.id, {relations: ['coffees']});

        if (machine) {
            ctx.status = 200;
            ctx.body = machine.coffees.length;
        } else {
            ctx.status = 400;
            ctx.body = 'The machine you are trying to retrieve coffees for does not exist!';
        }
    }
}
