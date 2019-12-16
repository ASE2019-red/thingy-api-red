import * as Router from 'koa-router';
import CoffeeController from './controllers/coffee';
import MachineController from './controllers/machine';
import MeasurementController from './controllers/measurement';
import UserController from './controllers/user';
import AuthenticationController from './middlewares/authentication';
import * as passport from "koa-passport";
import NotificationController from './controllers/notification';

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
router.put('/machine', MachineController.updateMachine);

// User endpoint
router.get('/user', passport.authenticate("jwt", {session: false}), UserController.getUsers);
router.get('/user/:id', passport.authenticate("jwt", {session: false}), UserController.getUser);
router.post('/user', UserController.registerUser);
router.post('/user/:id', passport.authenticate("jwt", {session: false}), UserController.updateUser);
router.post('/login', UserController.login);
router.delete('/user/:id', passport.authenticate("jwt", {session: false}), UserController.deleteUser);

// Measurement endpoint
router.get('/measurements', MeasurementController.getAll);
router.get('/measurements/:id', MeasurementController.getById);

// notification endpoint
router.get('/notifications/notifiers', NotificationController.getNotifiers);

export const routes = router.routes();
