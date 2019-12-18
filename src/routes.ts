import * as passport from 'koa-passport';
import * as Router from 'koa-router';
import CoffeeController from './controllers/coffee';
import MachineController from './controllers/machine';
import MeasurementController from './controllers/measurement';
import UserController from './controllers/user';
import { authenticationMiddleware } from './middlewares/authentication';

const router = new Router();
const isTestEnv = process.env.NODE_ENV === 'test';

router.get('/ping', (context) => {
    context.status = 200;
    context.body = 'pong';
});

// Coffee endpoint
router.get('/coffee', authenticationMiddleware(isTestEnv), CoffeeController.getCoffees);
router.get('/coffee/:id', authenticationMiddleware(isTestEnv), CoffeeController.getCoffee);

// Machine endpoint
router.get('/machine/:id/coffee',
           authenticationMiddleware(isTestEnv),
           MachineController.getMachineCoffees);
router.get('/machine', authenticationMiddleware(isTestEnv), MachineController.getMachines);
router.get('/machine/:id', authenticationMiddleware(isTestEnv), MachineController.getMachine);
router.put('/machine', authenticationMiddleware(isTestEnv), MachineController.updateMachine);
router.post('/machine', authenticationMiddleware(isTestEnv), MachineController.createMachine);

if (process.env.NODE_ENV !== 'production') {
    router.post('/machine/:id/coffee',
                authenticationMiddleware(isTestEnv),
                MachineController.postMachineCoffee);
}

// User endpoint
router.get('/user', authenticationMiddleware(isTestEnv), UserController.getUsers);
router.get('/user/:id', authenticationMiddleware(isTestEnv), UserController.getUser);
router.post('/user', UserController.registerUser);
router.put('/user/:id', authenticationMiddleware(isTestEnv), UserController.updateUser);
router.post('/login', UserController.login);
router.delete('/user/:id', authenticationMiddleware(isTestEnv), UserController.deleteUser);

// Measurement endpoint
router.get('/measurements', authenticationMiddleware(isTestEnv), MeasurementController.getAll);
router.get('/measurements/:id', authenticationMiddleware(isTestEnv), MeasurementController.getById);

export const routes = router.routes();
