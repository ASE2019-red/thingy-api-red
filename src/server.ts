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
import CoffeeDetector from './service/coffeeDetector';
import DataRecorder from './service/recorder/dataRecorder';
import {InfluxDataRecorder} from './service/recorder/influxDataRecorder';
import { gravityTransformerTagged } from './service/thingy';
import * as passport from 'koa-passport';
import UserController from './controllers/user';
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
import {Websocket, WebsocketFactory} from './websocket';

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

        await CoffeeDetector.createForAllMachines(config.mqtt.accelerationTopic, mqtt);

        // const dataRecorder: DataRecorder = new InfluxDataRecorder(mqtt, influx, config.mqtt.macThingy1);
        // dataRecorder.start('gravity', {location: 'test'}, gravityTransformerTagged);

        // Initialize the Koa application
        // tslint:disable-next-line:no-shadowed-variable
        const app: Koa = new Koa();

        // cors
        app.use(cors());

        const JWT_SECRET = "mysecret";
        // passport
        let passport_options = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JWT_SECRET
        }
        passport.use(
            "jwt",
            new JwtStrategy(passport_options, (jwt_payload: any, done: any) => {
                console.log("payload received", jwt_payload);
                // CHECK IF THE USER IN THE JWT IS VALID
                UserController.deserialize(jwt_payload.data.id)
                    .then(user => {
                        console.log("User:", user);
                        if (user)
                            return done(null, user);
                        else
                            return done(null, false);
                    }).catch(error => {
                        console.log(error);
                    })
            })
        )
        app.use(passport.initialize());

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
        notificationsWs.broadcastInterval(NotificationController.wsNotify, 10000);

        const calibrationWs: Websocket = wsFactory.newSocket('/machine/calibration');
        const calibrationController: CalibrationController = new CalibrationController(mqtt, influx);
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
