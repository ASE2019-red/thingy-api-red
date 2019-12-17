import * as passport from 'koa-passport';
import * as Router from 'koa-router';
import CoffeeController from './controllers/coffee';
import MachineController from './controllers/machine';
import MeasurementController from './controllers/measurement';
import UserController from './controllers/user';

const router = new Router();

router.get('/ping', (context) => {
    context.status = 200;
    context.body = 'pong';
});

// Coffee endpoint
router.get('/coffee', passport.authenticate('jwt', { session: false }), CoffeeController.getCoffees);
router.get('/coffee/:id', passport.authenticate('jwt', { session: false }), CoffeeController.getCoffee);

// Machine endpoint
router.get('/machine/:id/coffee',
           passport.authenticate('jwt', { session: false }),
           MachineController.getMachineCoffees);
router.get('/machine', passport.authenticate('jwt', { session: false }), MachineController.getMachines);
router.get('/machine/:id', passport.authenticate('jwt', { session: false }), MachineController.getMachine);
router.put('/machine', passport.authenticate('jwt', { session: false }), MachineController.updateMachine);
router.post('/machine', passport.authenticate('jwt', { session: false }), MachineController.createMachine);

if (process.env.NODE_ENV !== 'production') {
    router.post('/machine/:id/coffee',
                passport.authenticate('jwt', { session: false }),
                MachineController.postMachineCoffee);
}

// User endpoint
router.get('/user', passport.authenticate('jwt', { session: false }), UserController.getUsers);
router.get('/user/:id', passport.authenticate('jwt', { session: false }), UserController.getUser);
router.post('/user', UserController.registerUser);
router.post('/user/:id', passport.authenticate('jwt', { session: false }), UserController.updateUser);
router.post('/login', UserController.login);
router.delete('/user/:id', passport.authenticate('jwt', { session: false }), UserController.deleteUser);

// Measurement endpoint
router.get('/measurements', passport.authenticate('jwt', { session: false }), MeasurementController.getAll);
router.get('/measurements/:id', passport.authenticate('jwt', { session: false }), MeasurementController.getById);

export const routes = router.routes();
