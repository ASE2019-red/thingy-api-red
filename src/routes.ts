import * as passport from 'koa-passport';
import * as Router from 'koa-router';
import CoffeeController from './controllers/coffee';
import MachineController from './controllers/machine';
import MeasurementController from './controllers/measurement';
import UserController from './controllers/user';
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
router.put('/machine', MachineController.updateMachine);
router.post('/machine', MachineController.createMachine);

console.log('ENV is ' + process.env.NODE_ENV);
if (process.env.NODE_ENV !== 'production') {
    router.post('/machine/:id/coffee', MachineController.postMachineCoffee);
}

// User endpoint
router.get('/user', passport.authenticate('jwt', {session: false}), UserController.getUsers);
router.get('/user/:id', passport.authenticate('jwt', {session: false}), UserController.getUser);
router.post('/user', UserController.registerUser);
router.post('/user/:id', passport.authenticate('jwt', {session: false}), UserController.updateUser);
router.post('/login', UserController.login);
router.delete('/user/:id', passport.authenticate('jwt', {session: false}), UserController.deleteUser);

// Measurement endpoint
router.get('/measurements', MeasurementController.getAll);
router.get('/measurements/:id', MeasurementController.getById);

export const routes = router.routes();
