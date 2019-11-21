import { ParameterizedContext } from 'koa';
import { getManager } from 'typeorm';
import { Coffee } from '../models/coffee';
import { Machine } from '../models/machine';
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

            ctx.status = 200;
            ctx.body = savedMachine;
        } catch {
            ctx.status = 500;
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
            ctx.body = coffees.length;
        } else {
            ctx.status = 400;
            ctx.body = 'The machine you are trying to retrieve coffees for does not exist!';
        }
    }

}
