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

        try {
            const results = await ctx.influx.query(`SELECT * FROM ${id}`);
            ctx.status = 200;
            ctx.body = results;

        } catch (err) {
            ctx.status = 400;
            ctx.body = `The measurement ${name} cannot be found`;
        }
    }
}
