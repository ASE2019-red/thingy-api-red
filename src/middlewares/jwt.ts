// based on https://blog.theodo.com/2016/11/securize-a-koa-api-with-a-jwt-token/
import * as koaJwt from 'koa-jwt';

export const jwt = koaJwt({
                        // ToDo: Remove hardcoded && based on each user
                        secret: 'A very secret key',
                    });

