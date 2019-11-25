import * as Router from 'koa-router';
import CoffeeController from './controllers/coffee';
import MachineController from './controllers/machine';
import MeasurementController from './controllers/measurement';
import NotificationController from './controllers/notification';
import userController from './controllers/user';
import {randomInt, sleep} from './util/util';
import Websocket from './websocket';

const router = new Router();

router.get('/ping', (context) => {
    context.status = 200;
    context.body = 'pong';
});

// Coffee endpoint
router.get('/coffee', CoffeeController.getCoffees);
router.get('/coffee/:id', CoffeeController.getCoffee);

// Machine endpoint
router.get('/machine/:id/coffee', MachineController.getMachineCoffees);
router.get('/machine', MachineController.getMachines);
router.get('/machine/:id', MachineController.getMachine);
router.post('/machine', MachineController.createMachine);

// User endpoint
router.get('/users/:id', userController.getUser);

// Measurement endpoint
router.get('/measurements', MeasurementController.getAll);
router.get('/measurements/:id', MeasurementController.getById);

// notification endpoint
router.get('/notifications/notifiers', NotificationController.getNotifiers);

export const routes = router.routes();
