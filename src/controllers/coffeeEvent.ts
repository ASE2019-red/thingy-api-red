import {ParameterizedContext} from 'koa';
import {getManager, Repository} from 'typeorm';
import {CoffeeEvent} from '../models/coffeeEvent';

export default class CoffeeEventController {

    public static async getCoffeeEvents(ctx: ParameterizedContext) {
        console.log('here');
        const coffeeEventRepo: Repository<CoffeeEvent> = getManager().getRepository(CoffeeEvent);
        const coffeeEvents: CoffeeEvent[] = await coffeeEventRepo.find();

        ctx.status = 200;
        ctx.body = coffeeEvents;
    }
}
