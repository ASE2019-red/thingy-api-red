import * as Koa from 'koa';

import { config } from './config';
import { logger } from './logging';
import { routes } from './routes';

const app = new Koa();
app.use(logger);
app.use(routes);

app.listen(config.port);
console.log(`Server running on http://localhost:${config.port} 🚀`);

export { app };
