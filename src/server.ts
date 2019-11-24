import * as cors from '@koa/cors';
import * as http from 'http';
import {InfluxDB} from 'influx';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import {Connection} from 'typeorm';
import {qaRoutes} from '../test/integration/routes';
import {loadConfig} from './config';
import MQTTTopicClient from './mqtt/client';
import {influxConn, pgConn} from './persistence/database';
import {routes} from './routes';
import CoffeeDetector from './service/coffeeDetector';
import {randomInt} from './util/util';
import Websocket from './websocket';

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

        // const dataRecorder: DataRecorder = new InfluxDataRecorder(mqtt, influx, config.mqtt.macThingy1);
        // dataRecorder.start('gravity', {location: 'test'}, gravityTransformerTagged);

        // Initialize the Koa application
        // tslint:disable-next-line:no-shadowed-variable
        const app: Koa = new Koa();

        // cors
        app.use(cors());

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

        // Startup app
        app.use(bodyParser());
        app.use(routes);

        const server: http.Server = http.createServer(app.callback());

        const liveGravityWs: Websocket = new Websocket(server, '/measurements/live/gravity');
        await liveGravityWs.broadcastInterval(async () => {
            const result = await influx.query(`SELECT SUM(*) FROM gravity GROUP BY time(1m) LIMIT 10`);
            return JSON.stringify(result);
        }, 100);

        const notificationsWs: Websocket = new Websocket(server, '/notifications');
        await notificationsWs.broadcastInterval(async () => {
            return randomInt(1, 100);
        }, 1000);

        // Bind DB connections to context
        app.context.influx = influx;
        app.context.pg = pg;
        app.context.mqtt = mqtt;

        server.listen(config.port, () => {
            console.log(`Server running on http://localhost:${config.port} 🚀`);
        });

        return app;

    } catch (err) {
        console.error(`Error occurred during startup. \n\t${err}`);
        process.exit(1);
    }
}

export const app = bootstrap(true);
