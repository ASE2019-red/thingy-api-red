import { BaseContext } from 'koa';
import { getManager, Repository } from 'typeorm';
import { User } from '../models/user';


export default class UserController {

    public static async getUsers(ctx: BaseContext) {
        const userRepository: Repository<User> = getManager().getRepository(User);
        const users: User[] = await userRepository.find();

        ctx.status = 200;
        ctx.body = users;
    }

    public static async getUser(ctx: BaseContext) {
        const userRepository: Repository<User> = getManager().getRepository(User);

        // TODO: Pass ID via parameter set
        const user: User = await userRepository.findOne(ctx.params.id);

        if (user) {
            ctx.status = 200;
            ctx.body = user;
        } else {
            ctx.status = 400;
            ctx.body = 'The user you are trying to retrieve does not exist!';
        }
    }
}