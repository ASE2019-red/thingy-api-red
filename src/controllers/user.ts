import * as bcrypt from 'bcrypt';
import * as jsonwebtoken from 'jsonwebtoken';
import { ParameterizedContext } from 'koa';
import * as passport from 'koa-passport';
import { getManager } from 'typeorm';
import { loadConfig } from '../config';
import { User } from '../models/user';

passport.serializeUser((user: User, done) => {
    done(null, { id: user.id });
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default class UserController {

    private static get repository() {
        return getManager().getRepository(User);
    }

    public static async deserialize(userId: any) {
        const user: User = await UserController.repository.findOne(userId);
        return user;
    }

    public static async getUsers(ctx: ParameterizedContext) {
        const users: User[] = await UserController.repository.find();

        ctx.status = 200;
        ctx.body = users;
    }

    public static async getUser(ctx: ParameterizedContext) {
        // TODO: Pass ID via parameter set
        // const user: User = await UserController.repository.findOne(ctx.params.id);
        const user: User = await UserController.deserialize(ctx.params.id);

        if (user) {
            ctx.status = 200;
            ctx.body = user;
        } else {
            ctx.status = 400;
            ctx.body = 'The user you are trying to retrieve does not exist!';
        }
    }

    public static async registerUser(ctx: ParameterizedContext) {
        const newUser = new User();
        const body = ctx.request.body;
        console.log('Body: ', body);
        newUser.name = body.name;
        newUser.email = body.email;
        newUser.hashedPassword = await bcrypt.hash(body.psw, UserController.hashRounds);
        newUser.active = true;
        try {
            const savedUser = await UserController.repository.save(newUser);

            ctx.status = 200;
            ctx.body = UserController.serialize(savedUser);
            ctx.body.token = jsonwebtoken.sign(UserController.serialize(savedUser),
                                               UserController.config.auth.jwtSecret);
        } catch (err) {
            ctx.status = 500;
            ctx.body = 'Saving the user failed';
        }
    }

    public static async updateUser(ctx: ParameterizedContext) {
        // ToDo
        const user: User = await UserController.deserialize(ctx.params.id);
        try {
            const updatedUser = await UserController.repository.save(user);
            ctx.status = 200;
            ctx.body = updatedUser;
        } catch {
            ctx.status = 500;
            ctx.body = 'Updating the user failed';
        }
    }

    public static async deleteUser(ctx: ParameterizedContext) {
        // TODO
        const user: User = await UserController.deserialize(ctx.params.id);
        if (user.active) {
            user.active = false;
            try {
                const updatedUser = await UserController.repository.save(user);
                ctx.status = 200;
                ctx.body = updatedUser;
            } catch {
                ctx.status = 500;
                ctx.body = 'Deleting the user failed';
            }
        } else {
            ctx.status = 200;
            ctx.body = 'User alredy deleted';
        }
    }

    public static async login(ctx: ParameterizedContext) {
        if (ctx.isAuthenticated())
            return ctx.redirect('/');
        const body = ctx.request.body;
        console.log(body);
        const user: User = await UserController.repository.findOne({ email: body.email });
        console.log(user);
        if (user == null) {
            ctx.status = 401;
            ctx.body = {
                message: 'Authentication failed',
            };
            return ctx;
        }
        const correctLoginData = await bcrypt.compare(body.psw, user.hashedPassword);
        if (user.active && correctLoginData) {
            ctx.status = 200;
            ctx.body = UserController.serialize(user);
            ctx.body.token = jsonwebtoken.sign(UserController.serialize(user), UserController.config.auth.jwtSecret);
            await ctx.login(user);
            console.log(ctx.state.user);
        } else {
            ctx.status = 401;
            ctx.body = {
                message: 'Authentication failed',
            };
        }
    }

    private static config = loadConfig();
    private static hashRounds = 4;

    private static serialize(user: User) {
        return {
            data: {
                id: user.id,
            },
        };
    }
}
