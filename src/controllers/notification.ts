import {ParameterizedContext} from 'koa';
import {randomInt} from '../util/util';

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

    public static async wsNotify(ctx: ParameterizedContext, params: any) {
        // TODO: Detect new coffee consumption
        return randomInt(1, 100);
    }
}
