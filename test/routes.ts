import * as Router from 'koa-router';
import TestData from './mockdata';

const router = new Router();

router.get('/qa/users/bootstrap', TestData.createTestUsers);

export const qaRoutes = router.routes();
