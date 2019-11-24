import * as Router from 'koa-router';
import CoffeeController from './controllers/coffee';
import MachineController from './controllers/machine';
import MeasurementController from './controllers/measurement';
import UserController from './controllers/user';
import { jwt } from './middlewares/jwt';
import AuthenticationController from './middlewares/authentication';

const router = new Router();

router.get('/ping', AuthenticationController.requireLogin, (context) => {
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
router.get('/user', UserController.getUsers);
router.get('/user/:id', UserController.getUser);
router.post('/user', UserController.registerUser);
router.post('/user/:id', UserController.updateUser);
router.post('/login', UserController.login);
router.post('/logout/:id', UserController.logout);
router.delete('/user/:id', UserController.deleteUser)

// Measurement endpoint
router.get('/measurements', MeasurementController.getAll);
router.get('/measurements/:id', MeasurementController.getById);

export const routes = router.routes();
