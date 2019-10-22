import * as Router from 'koa-router';
import { influx } from './database';

const router = new Router();

router.get('/', async (ctx) => {
    ctx.body = `Hello world!`;
});

router.get('/:id', async (ctx) => {
    ctx.body = `Hello ${ctx.params.id}!`;
});

router.get('/measurements/:name', async (ctx, next) => {
    let name = ctx.params.name;

    await influx.query(`SELECT * FROM ${name}`).then(results => {
        ctx.status = 200;
        ctx.body = results;
    });
});

export const routes = router.routes();
