import {InfluxDB} from 'influx';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import {Connection} from 'typeorm';
import {qaRoutes} from '../test/web/routes';
import {loadConfig} from './config';
import MQTTTopicClient from './mqtt/client';
import {influxConn, pgConn} from './persistence/database';
import {routes} from './routes';
import CoffeeDetector from './service/coffeeDetector';
import DataRecorder from './service/dataRecorder';

async function bootstrap(samples: boolean) {
    try {
        const config = loadConfig();

        // Initialize the database
        const influx: InfluxDB = await influxConn(config.flux);
        const pg: Connection = await pgConn(config.postgres);

        // Connect to MQTT broker
        const mqtt = new MQTTTopicClient();
        await mqtt.connect(config.mqtt);

        await CoffeeDetector.createForAllMachines(config.mqtt.accelerationTopic, mqtt);

        const dataRecorder: DataRecorder = new DataRecorder(config.mqtt, mqtt, influx);
        // dataRecorder.start(DataRecorder.topicDefinitions.thingy1.gravity);

        // Initialize the Koa application
        // tslint:disable-next-line:no-shadowed-variable
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
        if (samples) {
            app.use(qaRoutes);
        }

        // Bind DB connections to context
        app.context.influx = influx;
        app.context.pg = pg;
        app.context.mqtt = mqtt;

        // Startup app
        app.use(bodyParser());
        app.use(routes);
        app.listen(config.port);

        console.log(`Server running on http://localhost:${config.port} 🚀`);

        return app;

    } catch (err) {
        console.error(`Error occurred during startup. \n\t${err}`);
        process.exit(1);
    }
}

export const app = bootstrap(true);
