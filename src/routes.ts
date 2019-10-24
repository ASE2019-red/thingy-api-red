import * as Router from 'koa-router';
import userController from './controllers/user';
import measurementController from './controllers/measurement';

const router = new Router();


router.get('/measurements/:name', measurementController.getByName);
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUser);

export const routes = router.routes();
