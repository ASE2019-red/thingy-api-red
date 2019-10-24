import * as Koa from 'koa';
import { config } from './config';
import { routes } from './routes';
import { qa_routes } from '../test/routes';
import { pg_conn, influx_conn } from './persistence/database';
import { mqtt_conn } from './persistence/mqtt';

async function bootstrap(samples: boolean) {
    try {
        // Initialize the database
        let influx = await influx_conn();
        let pg = await pg_conn();
        let mqtt = await mqtt_conn();

        // Initialize the Koa application
        const app = new Koa();

        // Logger
        app.use(async (ctx, next) => {
            await next();
            const rt = ctx.response.get('X-Response-Time');
            console.log(`${ctx.method} ${ctx.url} - ${rt}`);
        });

        // Set x-response-time to context
        app.use(async (ctx, next) => {
            const start = Date.now();
            await next();
            const ms = Date.now() - start;
            ctx.set('X-Response-Time', `${ms}ms`);
        });

        // Only registry testdata routes if flag is set
        if (samples)
            app.use(qa_routes);

        // Bind DB connections to context
        app.context.influx = influx;
        app.context.pg = pg;
        app.context.mqtt = mqtt;

        // Startup app
        app.use(routes);
        app.listen(config.port);

        console.log(`Server running on http://localhost:${config.port} 🚀`);

        return app;

    } catch (err) {
        console.error(`Error occured during startup. \n\t${err}`);
        process.exit(1);
    }
};

export const app = bootstrap(true);
