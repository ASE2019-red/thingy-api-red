import { ParameterizedContext } from 'koa';
import { Repository } from 'typeorm';
import { Coffee } from '../models/coffee';
import { Machine } from '../models/machine';
import { Websocket } from '../websocket';

export function createOnCoffeeProduced(machine: Machine,
                                       coffeeRepo: Repository<Coffee>,
                                       notificationChannel: Websocket) {

    const onCoffeeProduced = async () => {
        const newCoffee = new Coffee();
        newCoffee.machine = machine;
        const savedCoffee = await coffeeRepo.save(newCoffee);
        const notify = async (ctx: ParameterizedContext, params: any) => {
            return JSON.stringify(savedCoffee);
        };
        notificationChannel.broadcast(notify);
    };

    return onCoffeeProduced;
}
