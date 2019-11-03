import * as Router from 'koa-router';
import CoffeeEventController from './controllers/coffeeEvent';
import measurementController from './controllers/measurement';
import userController from './controllers/user';

const router = new Router();
router.get('/measurements/:name', measurementController.getByName);
router.get('/coffee_events', CoffeeEventController.getCoffeeEvents);
router.get('/users/:id', userController.getUser);

export const routes = router.routes();
