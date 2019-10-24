import { BaseContext } from 'koa';
import { getConnection } from "typeorm";
import { User } from '../src/models/user';


export default class MockData {

    public static async createTestUsers(ctx: BaseContext) {
        try {
            await getConnection().createQueryBuilder()
                .delete().from(User)
                .execute();

            await getConnection().createQueryBuilder()
                .insert().into(User)
                .values([
                    { name: "Pascal", email: "pascal.zingg@students.unibe.ch", hashedPassword: "pass123" },
                    { name: "Simon", email: "simon.curty@students.unibe.ch", hashedPassword: "pass123" },
                    { name: "Guillaume", email: "guillaume.corsini@students.unibe.ch", hashedPassword: "pass123" },
                    { name: "Patrick", email: "patrick.frischknecht@students.unibe.ch", hashedPassword: "pass123" },
                ])
                .execute();

            ctx.body = "Test users created successfully"

        } catch (err) {
            ctx.status = err.statusCode || err.status || 500;
            ctx.body = {
                message: err.message
            };
        }
    }
};
