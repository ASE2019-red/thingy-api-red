import {InfluxDB} from 'influx';
import {ParameterizedContext} from 'koa';
import {sleep} from '../util/util';

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

    public static async wsGetByTimeSlot(ctx: ParameterizedContext) {
        // await ctx.influx.writePoints([{measurement: 'gravity', tags: {name: 'ff-office'},
        //      fields: {x: 1, y: 2, z: 3}}]);
        // await sleep(1000);
        // await ctx.influx.writePoints([{measurement: 'gravity', tags: {name: 'ff-office'},
        //      fields: {x: 2, y: 6, z: 2}}]);
        // await sleep(1000);
        // await ctx.influx.writePoints([{measurement: 'gravity', tags: {name: 'ff-office'},
        //      fields: {x: 3, y: 2, z: 1}}]);

        // TODO: Time range selection
        const result = await ctx.influx.query(`SELECT SUM(*) FROM gravity WHERE time > now() - 5m GROUP BY time(1m) fill(0)`);
        return JSON.stringify(result);
    }
}
