import * as cors from '@koa/cors';
import * as http from 'http';
import {InfluxDB} from 'influx';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import {KoaSwaggerUiOptions} from 'koa2-swagger-ui';
import {Connection} from 'typeorm';
import {loadConfig} from './config';
import CalibrationController from './controllers/calibration';
import MeasurementController from './controllers/measurement';
import NotificationController from './controllers/notification';
import MQTTTopicClient from './mqtt/client';
import {influxConn, pgConn} from './persistence/database';
import {routes} from './routes';
import CoffeeDetector from './service/detector/thresholdDetector';
import {Websocket, WebsocketFactory} from './websocket';
import DetectorManager from './service/detector/manager';

type koa2SwaggerUiFunc = (config: Partial<KoaSwaggerUiOptions>) => Koa.Middleware;
// tslint:disable-next-line: no-var-requires // We actually have to use require for koa2-swagger-ui
const koaSwagger = require('koa2-swagger-ui') as koa2SwaggerUiFunc;

async function bootstrap() {
    try {
        const config = loadConfig();

        // Initialize the database
        const influx: InfluxDB = await influxConn(config.flux);
        const pg: Connection = await pgConn(config.postgres);

        // Connect to MQTT broker
        const mqtt = new MQTTTopicClient();
        await mqtt.connect(config.mqtt);

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

        // Startup app
        app.use(bodyParser());
        app.use(routes);

        const newServer: http.Server = http.createServer(app.callback());

        const wsFactory: WebsocketFactory = WebsocketFactory.getInstance(newServer, app.context);
        const liveGravityWs: Websocket = wsFactory.newSocket('/measurements/live/gravity');
        liveGravityWs.broadcastInterval(MeasurementController.wsGetByTimeSlot, 1000);

        const notificationsWs: Websocket = wsFactory.newSocket('/notifications');
        // notificationsWs.broadcastInterval(NotificationController.wsNotify, 10000);

        // Initialize detectors for machines
        const manager = new DetectorManager(mqtt, notificationsWs);
        console.log('Successfully initialized detectors');

        const calibrationWs: Websocket = wsFactory.newSocket('/machine/calibration');
        const calibrationController: CalibrationController = new CalibrationController(mqtt, influx, manager);
        calibrationWs.wire(calibrationController);

        // Deliver swagger user interface
        app.use(
            koaSwagger({
                routePrefix: '/',
                swaggerOptions: {url: config.swaggerApiUrl},
            }),
        );

        // Bind DB connections to context
        app.context.influx = influx;
        app.context.pg = pg;
        app.context.mqtt = mqtt;
        app.context.detectors = manager;

        newServer.on('close', async () => {
            pg.close();
            mqtt.disconnect();
            console.log(`Server closed`);
        });

        newServer.listen(config.port, () => {
            console.log(`Server running on http://localhost:${config.port} 🚀`);
        });

        return newServer;

    } catch (err) {
        console.log(err);
        console.error(`Error occurred during startup. \n\t${err}`);
        process.exit(1);
    }
}

export const server = bootstrap();
