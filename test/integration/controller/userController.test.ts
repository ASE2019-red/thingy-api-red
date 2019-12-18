import { Server } from 'http';
import * as supertest from 'supertest';
import { User } from '../../../src/models/user';
import { server } from '../../../src/server';
import { cleanAllTables, cleanTable, createTestUser } from '../integrationTestHelper';

describe('/user without data', () => {
    let requestHelper: any;
    let testServer: Server;

    beforeAll(async () => {
        testServer = await server;
        // important: Call after server to assure connection is up
        await cleanAllTables();
        requestHelper = supertest(testServer);
    });

    afterAll(async () => {
        testServer.close();
    });

    test('GET /user', async () => {
        const response = await requestHelper.get('/user');
        expect(response.status).toEqual(200);
        expect(response.body).toEqual([]);
    });

    test('POST /user', async () => {
        const response = await requestHelper.post('/user').send({
            name: 'Test User',
            email: 'user@test.ch',
            psw: 'Password'
        });
        expect(response.status).toEqual(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('token');
        await cleanTable(User, 'user');
    });

    test('POST /user with invalid data', async () => {
        const response = await requestHelper.post('/user').send({
            something: 'Test',
        });
        expect(response.status).toEqual(422);
    });

    test('PATCH /user/:id with inexistant id', async () => {
        const response = await requestHelper.patch('/user/550e8400-e29b-11d4-a716-446655440000').send({
            name: 'Patched User',
        });
        expect(response.status).toEqual(422);
    });

    test('GET /user/:id with inexisting id', async () => {
        const response = await requestHelper.get('/user/550e8400-e29b-11d4-a716-446655440000');
        expect(response.status).toEqual(400);
    });

    test('DELETE /user/:id with inexisting id', async () => {
        const response = await requestHelper.delete('/user/550e8400-e29b-11d4-a716-446655440000');
        expect(response.status).toEqual(200);
    });

    test('POST /login with invalid data', async () => {
        const response = await requestHelper.post('/login').send({
            something: 'Test',
        });
        expect(response.status).toEqual(401);
    });

    test('POST /login with inexisting user', async () => {
        const response = await requestHelper.post('/login').send({
            email: 'notCorrectMail@test.ch',
            psw: 'wrongPass'
        });
        expect(response.status).toEqual(401);
    });

    describe('with existing user', () => {
        let user: User;

        beforeEach(async () => {
            user = await createTestUser();
        });

        afterEach(async () => {
            await cleanTable(User, 'user');
        });

        test('PATCH /user/:id with invalid data', async () => {
            const response = await requestHelper.patch(`/user/${user.id}`).send({
                something: 'Test',
            });
            expect(response.status).toEqual(422);
        });

        test('PATCH /user/:id with existing id', async () => {
            const response = await requestHelper.patch(`/user/${user.id}`).send({
                name: 'Patched User',
            });
            expect(response.status).toEqual(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name', 'Patched User');
            expect(response.body).toHaveProperty('email', 'user@test.ch');
            expect(response.body).toHaveProperty('hashedPassword');
            expect(response.body).toHaveProperty('active', true);
        });

        test('GET /user/:id with existing id', async () => {
            const response = await requestHelper.get(`/user/${user.id}`);
            expect(response.status).toEqual(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name', 'Test User');
            expect(response.body).toHaveProperty('email', 'user@test.ch');
            expect(response.body).toHaveProperty('hashedPassword');
            expect(response.body).toHaveProperty('active', true);

            //expect(response.body).not.toHaveProperty('coffees');
        });

        test('DELETE /user/:id with existing id', async () => {
            const response = await requestHelper.delete(`/user/${user.id}`);
            expect(response.status).toEqual(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name', 'Test User');
            expect(response.body).toHaveProperty('email', 'user@test.ch');
            expect(response.body).toHaveProperty('hashedPassword');
            expect(response.body).toHaveProperty('active', false);
        });

        test('POST /login with incorrect password', async () => {
            const response = await requestHelper.post('/login').send({
                email: 'user@test.ch',
                psw: 'wrongPass'
            });
            expect(response.status).toEqual(401);
        });

        test('POST /login with correct password', async () => {
            const response = await requestHelper.post('/login').send({
                email: 'user@test.ch',
                psw: 'Password'
            });
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('token');

        });

    });
});
