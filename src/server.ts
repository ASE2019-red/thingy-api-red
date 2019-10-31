import * as Koa from 'koa';
import { loadConfig } from './config';
import { routes } from './routes';
import { qa_routes } from '../test/routes';
import { pg_conn, influx_conn } from './persistence/database';
import { InfluxDB } from 'influx';
import { Connection, getManager, Repository } from 'typeorm';
import MQTTTopicClient from './mqtt/mqtt';
import CoffeeDetector from './mqtt/coffeDetector';
import { CoffeeEvent } from './models/coffeeEvent';

async function bootstrap(samples: boolean) {
    try {
        const config = loadConfig();
        // Initialize the database
        const influx: InfluxDB = await influx_conn(config.flux);
        const pg: Connection = await pg_conn(config.postgres);
        const mqtt = new MQTTTopicClient();
        await mqtt.connect(config.mqtt);

        new CoffeeDetector(config.mqtt.accelerationSensorTopic, () => {
            const coffeeEventRepo: Repository<CoffeeEvent> = getManager().getRepository(CoffeeEvent);
            const newEvent = new CoffeeEvent();
            coffeeEventRepo.save(newEvent);
        }, mqtt)

        // Initialize the Koa application
        const app: Koa = new Koa();

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

        // Startup app
        app.use(routes);
        app.listen(config.port);

        console.log(`Server running on http://localhost:${config.port} 🚀`);

        return app;

    } catch (err) {
        console.error(`Error occurred during startup. \n\t${err}`);
        process.exit(1);
    }
};

export const app = bootstrap(true);
