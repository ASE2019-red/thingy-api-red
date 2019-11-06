import { ParameterizedContext } from 'koa';


export default class MeasurementController {

    public static async getByName(ctx: ParameterizedContext) {
        const name = ctx.params.name;

        try {
            const results = await ctx.influx.query(`SELECT * FROM ${name}`)
            ctx.status = 200;
            ctx.body = results;

        } catch (err) {
            ctx.status = 400;
            ctx.body = `The measurement ${name} cannot be found`;
        }
    }
}