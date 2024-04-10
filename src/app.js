import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import middleware from './middleware.js';
import { apiRoutes, viewsRoutes } from './routes/index.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const appExpress = express();

appExpress.set('view engine', 'ejs');
appExpress.set('layout', path.resolve(__dirname, 'layouts/main.ejs'));
appExpress.set('views', path.resolve(__dirname, 'views'));
appExpress.use('/', express.static('public'));

appExpress.use(expressLayouts);
appExpress.use(cookieParser());
appExpress.use(express.static(__dirname));
appExpress.use(bodyParser.json({ limit: '50mb' }));
appExpress.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

appExpress.use(middleware);
appExpress.use('/', viewsRoutes);
// appExpress.use('/api', apiRoutes);

const PORT = 3000;
const server = appExpress.listen(PORT, async () => {
  console.log('Server up running in:', PORT);
});
