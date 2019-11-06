import * as Router from 'koa-router';
import TestData from '../persistence/mockdata';

const router = new Router();

router.get('/qa/users/bootstrap', TestData.createTestUsers);
router.get('/qa/measurements/bootstrap', TestData.insertTestMeasurements);


export const qa_routes = router.routes();
