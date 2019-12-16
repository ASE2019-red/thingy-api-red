import { ParameterizedContext } from 'koa';

export default class AuthenticationController {
    public static async requireLogin( ctx: ParameterizedContext, next: () => Promise<any>) {
        if (ctx.isAuthenticated()) {
            await next();
          } else {
            ctx.status = 401;
            ctx.body = {
              errors: [{ title: 'Login required', status: 401 }],
            };
          }
    }
}
