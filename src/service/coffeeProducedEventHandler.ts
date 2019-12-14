import { getManager, Repository } from 'typeorm';
import { Coffee } from '../models/coffee';
import { Machine } from '../models/machine';
import { Websocket } from '../websocket';

export function createOnCoffeeProduced(machine: Machine,
                                       notificationChannel: Websocket) {

    const onCoffeeProduced = async () => {
        const coffeeRepo: Repository<Coffee> = getManager().getRepository(Coffee);
        const newCoffee = new Coffee();
        newCoffee.machine = machine;
        const savedCoffee = await coffeeRepo.save(newCoffee);
        notificationChannel.broadcast(() => JSON.stringify(savedCoffee));
    };

    return onCoffeeProduced;
}
