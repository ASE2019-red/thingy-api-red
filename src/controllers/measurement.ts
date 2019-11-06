import { InfluxDB } from 'influx';
import {ParameterizedContext} from 'koa';

export default class MeasurementController {

    public static async getAll(ctx: ParameterizedContext) {
        try {
            ctx.status = 200;
            ctx.body = await ctx.influx.query(`SHOW MEASUREMENTS`);

        } catch (err) {
            ctx.status = 400;
            ctx.body = `The measurement ${name} cannot be found`;
        }
    }

    public static async getById(ctx: ParameterizedContext) {
        const id = ctx.params.id;
        const influx: InfluxDB = ctx.influx;

        try {
            const results = await influx.query(`SELECT * FROM ${id} GROUP BY * ORDER BY DESC LIMIT 10`);
            ctx.status = 200;
            ctx.body = results;

        } catch (err) {
            ctx.status = 400;
            ctx.body = `The measurement ${name} cannot be found`;
        }
    }

    public static async getByIdRange(ctx: ParameterizedContext) {
        const id = ctx.params.id;
        const from = ctx.query.from;
        const to = ctx.query.to;

        try {
            const results = await ctx.influx.query(`SELECT * FROM ${id} WHERE time >='${from}' AND time <='${to}'`);
            ctx.status = 200;
            ctx.body = results;

        } catch (err) {
            ctx.status = 400;
            ctx.body = `The measurement ${name} cannot be found`;
        }
    }
}
