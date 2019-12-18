import { Connection, getConnection, getRepository } from 'typeorm';
import {getManager} from 'typeorm';
import { Coffee } from '../../src/models/coffee';
import { Machine } from '../../src/models/machine';
import { User } from '../../src/models/user';

// important: Call after 'await server' to assure db connection is up
export async function cleanAllTables() {
    try {
        await Promise.all(getConnection().entityMetadatas.map(async (entityData) => {
            await cleanTable(entityData.name, entityData.tableName);
        }));
    } catch (error) {
        throw new Error(`Could not clean databases; Error: ${error}`);
    }
}

export async function cleanTable(entityClass: string | (new () => {}), tableName: string) {
    const repository = await getRepository(entityClass);
    await repository.query(`DELETE FROM "${tableName}";`);
}

export async function createTestData(entityClass: string | (new () => {}), values: object[]) {
    await getConnection().createQueryBuilder()
                .insert().into(entityClass)
                .values(values)
                .execute();
}

export async function createTestMachine() {
    const newMachine = new Machine();
    newMachine.name = 'Test Machine';
    newMachine.sensorIdentifier = 'd1:d9:9f:36:cf:93';
    newMachine.active = true;
    return await getRepository(Machine).save(newMachine);
}

export async function createTestCoffees(machine: Machine, count: number) {
    const coffees: Coffee[] = [];
    for (let i = 0; i < count; i++) {
        const newCoffee = new Coffee();
        newCoffee.machine = machine;
        coffees.push(newCoffee);
    }

    return await getRepository(Coffee).save(coffees);
}

export async function createTestUser() {
    const newUser = new User();
    newUser.name = 'Test User';
    newUser.email = 'user@test.ch';
    newUser.hashedPassword = 'Password';
    newUser.active = true;
    return await getRepository(User).save(newUser);
}
