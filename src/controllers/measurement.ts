import {InfluxDB} from 'influx';
import {ParameterizedContext} from 'koa';

export default class MeasurementController {

    public static async getAll(ctx: ParameterizedContext) {
        try {
            ctx.status = 200;
            ctx.body = await ctx.influx.query(`SHOW MEASUREMENTS`);

        } catch (err) {
            ctx.status = 500;
            ctx.body = `Cannot query measurements`;
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
            ctx.body = `The measurement ${id} cannot be found`;
        }
    }
}
