import {InfluxDB} from 'influx';
import * as moment from 'moment';
import {Connection, getConnection, getRepository} from 'typeorm';
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
    newMachine.calibrated = false;
    return await getRepository(Machine).save(newMachine);
}

async function createCoffees(machine: Machine, count: number) {
    const coffees: Coffee[] = [];
    for (let i = 0; i < count; i++) {
        const newCoffee = new Coffee();
        newCoffee.machine = machine;
        newCoffee.createdAt = moment().subtract(1, 'month').toDate();
        coffees.push(newCoffee);
    }

    const coffeesAfterSave = await getRepository(Coffee).save(coffees);
    const updatePromises = coffeesAfterSave.map(c => {
        const randomDate = moment().subtract(Math.floor(Math.random() * 20), 'days').toISOString();
        return getConnection().query(
            `UPDATE coffee SET "createdAt" = '${randomDate}' WHERE id='${c.id}'`,
        );
    });
    return await Promise.all(updatePromises);
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

        await createCoffees(machine1, 36);
        await createCoffees(machine2, 24);

        await insertTestMeasurements(influx);

        await pg.close();

    } catch (err) {
        console.log(err);
        console.error(`Error occurred during seeding. \n\t${err}`);
        process.exit(1);
    }
}

seed();
