import {ParameterizedContext} from 'koa';
import {getManager} from 'typeorm';
import {Coffee} from '../models/coffee';

export default class CoffeeController {

    private static get repository() {
        return getManager().getRepository(Coffee);
    }

    public static async getCoffees(ctx: ParameterizedContext) {
        const coffees: Coffee[] = await CoffeeController.repository.find({relations: ['machine']});

        ctx.status = 200;
        ctx.body = coffees;
    }

    public static async getCoffee(ctx: ParameterizedContext) {
        const coffee = await CoffeeController.repository.findOne(ctx.params.id, {relations: ['machine']});

        if (coffee) {
            ctx.status = 200;
            ctx.body = coffee;
        } else {
            ctx.status = 400;
            ctx.body = 'The coffee you are trying to retrieve does not exist!';
        }
    }
}
