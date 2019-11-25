import {BaseContext, ParameterizedContext} from 'koa';
import {getConnection} from 'typeorm';
import {User} from '../../../src/models/user';
import {sleep} from '../../../src/util/util';

export default class MockData {

    public static async insertTestMeasurements(ctx: ParameterizedContext) {
        const measurement = 'test_m';
        await ctx.influx.query(`DROP MEASUREMENT ${measurement}`);
        await sleep(1000);
        await ctx.influx.writePoints([{measurement, tags: {name: 'asdf'}, fields: {x: 0, y: 6, z: 4}}]);
        await sleep(1000);
        await ctx.influx.writePoints([{measurement, tags: {name: 'asdf'}, fields: {x: 1, y: 8, z: 3}}]);
        await sleep(1000);
        await ctx.influx.writePoints([{measurement, tags: {name: 'asdf'}, fields: {x: 2, y: 1, z: 2}}]);
        await sleep(1000);
        await ctx.influx.writePoints([{measurement, tags: {name: 'asdf'}, fields: {x: 3, y: 7, z: 1}}]);
        ctx.status = 200;
    }

    public static async createTestUsers(ctx: BaseContext) {
        try {
            await getConnection().createQueryBuilder()
                .delete().from(User)
                .execute();

            await getConnection().createQueryBuilder()
                .insert().into(User)
                .values([
                    {name: 'Pascal', email: 'pascal.zingg@students.unibe.ch', hashedPassword: 'pass123'},
                    {name: 'Simon', email: 'simon.curty@students.unibe.ch', hashedPassword: 'pass123'},
                    {name: 'Guillaume', email: 'guillaume.corsini@students.unibe.ch', hashedPassword: 'pass123'},
                    {name: 'Patrick', email: 'patrick.frischknecht@students.unibe.ch', hashedPassword: 'pass123'},
                ])
                .execute();

            ctx.body = 'Test users created successfully';

        } catch (err) {
            ctx.status = err.statusCode || err.status || 500;
            ctx.body = {
                message: err.message,
            };
        }
    }
}
