import {ParameterizedContext} from 'koa';

export default class NotificationController {

    public static async getNotifiers(ctx: ParameterizedContext) {
        try {
            ctx.status = 200;
            ctx.body = [
                {name: 'notifier1'},
                {name: 'notifier2'},
            ];

        } catch (err) {
            ctx.status = 500;
            ctx.body = `Cannot query notifiers`;
        }
    }
}
