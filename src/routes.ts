import * as Router from 'koa-router';
import CoffeeController from './controllers/coffee';
import MachineController from './controllers/machine';
import MeasurementController from './controllers/measurement';
import userController from './controllers/user';

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
console.log('ENV is ' + process.env.NODE_ENV);
if (process.env.NODE_ENV !== 'production') {
    router.post('/machine/:id/coffee', MachineController.postMachineCoffee);
}

// User endpoint
router.get('/users/:id', userController.getUser);

// Measurement endpoint
router.get('/measurements', MeasurementController.getAll);
router.get('/measurements/:id', MeasurementController.getById);

export const routes = router.routes();
