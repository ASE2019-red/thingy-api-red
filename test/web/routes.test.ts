import * as supertest from 'supertest';
import {app} from '../../src/server';

describe('Koa route testing', () => {
    let st: any;

    beforeAll(async () => {
        st = supertest((await app).callback());
    });

    // FIXME: Tear down server properly (using --forceExit flag for jest tests by now)
    // afterAll(async () => {
    // });

    test('GET /ping', async () => {
        const response = await st.get('/ping');
        expect(response.status).toEqual(200);
        expect(response.type).toEqual('text/plain');
        expect(response.text).toEqual('pong');
    });

    test('GET /coffee', async () => {
        const response = await st.get('/coffee');
        expect(response.status).toEqual(200);
    });

    test('GET /machine', async () => {
        const response = await st.get('/machine');
        expect(response.status).toEqual(200);
    });

    test('GET /measurements', async () => {
        await st.get('/qa/measurements/bootstrap');

        const response = await st.get('/measurements');
        expect(response.status).toEqual(200);
        expect(response.type).toEqual('application/json');

        const body: any[] = response.body;
        expect(body.map((v) => v.name).includes('test_m')).toBeTruthy();
    });
});
