import {InfluxDB} from 'influx';
import {Connection, getRepository} from 'typeorm';
import {loadConfig} from '../config';
import { Coffee } from '../models/coffee';
import { Machine } from '../models/machine';
import { User } from '../models/user';
import {influxConn, pgConn} from '../persistence/database';

async function createMachine(name: string, sensorIdentifier: string) {
    const newMachine = new Machine();
    newMachine.name = name;
    newMachine.sensorIdentifier = sensorIdentifier;
    newMachine.active = true;
    return await getRepository(Machine).save(newMachine);
}

async function createCoffees(machine: Machine, count: number) {
    const coffees: Coffee[] = [];
    for (let i = 0; i < count; i++) {
        const newCoffee = new Coffee();
        newCoffee.machine = machine;
        coffees.push(newCoffee);
    }

    return await getRepository(Coffee).save(coffees);
}

async function createUser(name: string, email: string) {
    const user = new User();
    user.email = email;
    user.name = name;
    // unused currently
    user.hashedPassword = '';

    return await getRepository(User).save(user);
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function insertTestMeasurements(influx: InfluxDB) {
    const measurement = 'test_m';
    await influx.query(`DROP MEASUREMENT ${measurement}`);
    await sleep(1000);
    await influx.writePoints([{measurement, tags: {name: 'asdf'}, fields: {x: 0, y: 6, z: 4}}]);
    await sleep(1000);
    await influx.writePoints([{measurement, tags: {name: 'asdf'}, fields: {x: 1, y: 8, z: 3}}]);
    await sleep(1000);
    await influx.writePoints([{measurement, tags: {name: 'asdf'}, fields: {x: 2, y: 1, z: 2}}]);
    await sleep(1000);
    await influx.writePoints([{measurement, tags: {name: 'asdf'}, fields: {x: 3, y: 7, z: 1}}]);
}

async function seed() {
    try {
        const config = loadConfig();

        // Open database connection
        const influx: InfluxDB = await influxConn(config.flux);
        const pg: Connection = await pgConn(config.postgres);

        const machine1 = await createMachine('Machine 1', config.mqtt.macThingy1);
        const machine2 = await createMachine('Machine 2', config.mqtt.macThingy2);

        await createCoffees(machine1, 6);
        await createCoffees(machine2, 4);

        await createUser('User 1', 'user1@testemail.test');
        await createUser('User 2', 'user2@testemail.test');
        await createUser('User 3', 'user3@testemail.test');

        await insertTestMeasurements(influx);

        await pg.close();

    } catch (err) {
        console.log(err);
        console.error(`Error occurred during seeding. \n\t${err}`);
        process.exit(1);
    }
}

seed();
