import * as Router from 'koa-router';
import TestData from '../unit/persistence/mockdata';

const router = new Router();

router.get('/qa/users/bootstrap', TestData.createTestUsers);
router.get('/qa/measurements/bootstrap', TestData.insertTestMeasurements);

export const qaRoutes = router.routes();