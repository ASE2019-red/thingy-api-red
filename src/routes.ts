import * as Router from 'koa-router';
import CoffeeController from './controllers/coffee';
import MachineController from './controllers/machine';
import userController from './controllers/user';

const router = new Router();

router.get('/coffee', CoffeeController.getCoffees);
router.get('/coffee/:id', CoffeeController.getCoffee);

router.get('/machine/:id/coffee', MachineController.getMachineCoffees);
router.get('/machine', MachineController.getMachines);
router.get('/machine/:id', MachineController.getMachine);
router.post('/machine', MachineController.createMachine);

router.get('/users/:id', userController.getUser);

export const routes = router.routes();
