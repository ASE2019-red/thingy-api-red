import * as Router from 'koa-router';
import userController from './controllers/user';
import measurementController from './controllers/measurement';
import CoffeeEventController from './controllers/coffeeEvent';

const router = new Router();


router.get('/measurements/:name', measurementController.getByName);
//router.get('/users', userController.getUsers);
router.get('/coffee_events', CoffeeEventController.getCoffeeEvents);
router.get('/users/:id', userController.getUser);

export const routes = router.routes();
