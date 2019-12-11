import { Server } from 'http';
import * as supertest from 'supertest';
import { Coffee } from '../../../src/models/coffee';
import { Machine } from '../../../src/models/machine';
import { server } from '../../../src/server';
import CoffeeDetector from '../../../src/service/coffeeDetector';
import { cleanAllTables, cleanTable, createTestCoffees, createTestData, createTestMachine } from '../integrationTestHelper';

describe('/machine without data', () => {
    let requestHelper: any;
    let testServer: Server;
    let mockCreateCoffeeDetector: any;

    beforeAll(async () => {
        testServer = await server;
        // important: Call after server to assure connection is up
        await cleanAllTables();
        requestHelper = supertest(testServer);
        mockCreateCoffeeDetector = jest.spyOn(CoffeeDetector, 'createForMachine').mockImplementation(
            () => { return; },
        );
    });

    afterAll(async () => {
        testServer.close();
    });

    test('GET /machine', async () => {
        const response = await requestHelper.get('/machine');
        expect(response.status).toEqual(200);
        expect(response.body).toEqual([]);
    });

    test('POST /machine', async () => {
        const response = await requestHelper.post('/machine').send({
            name: 'Test',
            sensorIdentifier: 'd1:d9:9f:36:cf:93',
        });
        expect(response.status).toEqual(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name', 'Test');
        expect(response.body).toHaveProperty('sensorIdentifier', 'd1:d9:9f:36:cf:93');
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body).toHaveProperty('active');
        expect(mockCreateCoffeeDetector).toBeCalledTimes(1);
        await cleanTable(Machine, 'machine');
    });

    test('POST /machine with invalid data', async () => {
        const response = await requestHelper.post('/machine').send({
            something: 'Test',
        });
        expect(response.status).toEqual(422);
    });

    test('GET /machine/:id with inexistant id', async () => {
        const response = await requestHelper.get('/machine/550e8400-e29b-11d4-a716-446655440000');
        expect(response.status).toEqual(400);
    });

    test('GET /machine/:id with inexistant id', async () => {
        const response = await requestHelper.get('/machine/550e8400-e29b-11d4-a716-446655440000/coffee');
        expect(response.status).toEqual(400);
    });

    describe('with existing machine and coffees', () => {
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

        test('GET /machine/:id with existing id', async () => {
            const response = await requestHelper.get(`/machine/${machine.id}`);
            expect(response.status).toEqual(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('sensorIdentifier');
            expect(response.body).toHaveProperty('active');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('createdAt');
            expect(response.body).not.toHaveProperty('coffees');
        });

        test('GET /machine/:id/coffee', async () => {
            const response = await requestHelper.get(`/machine/${machine.id}/coffee`);
            expect(response.status).toEqual(200);
            expect(response.body.length).toEqual(COFFEE_COUNT);
        });

    });
});
