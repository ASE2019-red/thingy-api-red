import { ParameterizedContext } from 'koa';
import passport = require('passport');

const authenticate = passport.authenticate('jwt', { session: false });

export const authenticationMiddleware = (skipAuth: boolean) =>
  async (ctx: ParameterizedContext, next: () => Promise<any>) => {
    if (skipAuth) {
      await next();
      return;
    }
    await authenticate(ctx, next);
  };
