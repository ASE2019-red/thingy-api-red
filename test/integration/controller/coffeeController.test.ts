import { Server } from 'http';
import * as supertest from 'supertest';
import { Coffee } from '../../../src/models/coffee';
import { Machine } from '../../../src/models/machine';
import { server } from '../../../src/server';
import { cleanAllTables, cleanTable, createTestCoffees, createTestData, createTestMachine } from '../integrationTestHelper';

describe('/coffee without data', () => {
    let st: any;
    let testServer: Server;

    beforeAll(async () => {
        testServer = await server;
        // important: Call after server to assure connection is up
        await cleanAllTables();
        st = supertest(testServer);
    });

    afterAll(async () => {
        testServer.close();
    });

    test('GET /coffee', async () => {
        const response = await st.get('/coffee');
        expect(response.status).toEqual(200);
        expect(response.body).toEqual([]);
    });

    test('GET /coffee/:id with inexistant id', async () => {
        const response = await st.get('/coffee/550e8400-e29b-11d4-a716-446655440000');
        expect(response.status).toEqual(400);
    });

    describe('with existing coffees', () => {
        const COFFEE_COUNT = 5;
        let machine: Machine;

        beforeEach(async () => {
            machine = await createTestMachine();
            await createTestCoffees(machine, COFFEE_COUNT);
        });

        afterEach(async () => {
            await cleanTable(Coffee, 'coffee');
            await cleanTable(Machine, 'machine');
        });

        test('GET /coffee', async () => {
            const response = await st.get('/coffee');
            expect(response.status).toEqual(200);
            expect(response.body.length).toEqual(COFFEE_COUNT);
        });

        test('GET /coffee/:id with existing id', async () => {
            const knownCoffee = (await createTestCoffees(machine, COFFEE_COUNT))[0];
            const response = await st.get(`/coffee/${knownCoffee.id}`);
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('createdAt');
            expect(response.body).toHaveProperty('machine');
        });
    });
});