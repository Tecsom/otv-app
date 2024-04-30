import { AddressInfo } from 'net';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import serverHttp from 'http';
import { Server } from 'socket.io';
import expressLayouts from 'express-ejs-layouts';
import middleware from './middleware';
import { viewsRoutes, apiRoutes } from './routes/index';
import { initScanner } from './controllers/scanner';
import { BrowserWindow, app, session } from 'electron';

declare global {
  var globalWindow: BrowserWindow;
}

const appExpress = express();

appExpress.set('view engine', 'ejs');
appExpress.set('layout', path.resolve(__dirname, 'layouts/main.ejs'));
appExpress.set('views', path.resolve(__dirname, 'views'));
appExpress.use(express.static(path.join(__dirname, '../')));

appExpress.use(expressLayouts);
appExpress.use(cookieParser());
appExpress.use(express.static(__dirname));
appExpress.use(bodyParser.json({ limit: '50mb' }));
appExpress.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

appExpress.use(middleware);
appExpress.use('/', viewsRoutes);
appExpress.use('/api', apiRoutes);

const PORT = 3000;
const server = appExpress.listen(PORT, async () => {
  console.log('Server up running in p:', PORT);
});

if (process.env.NODE_ENV !== 'test') {
  const io = new Server(server);

  globalThis.socket_io = io;

  function createWindow() {
    // Create the browser window.
    console.log('createWindow');
    const mainWindow = new BrowserWindow({
      autoHideMenuBar: true,
      height: 600,
      width: 800,
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js')
        //devTools: !app.isPackaged,
      },
      useContentSize: true,
      show: false,
      icon: path.resolve(__dirname, './assets/img/', 'logo_tpj.ico')
    });

    const { port } = server.address() as AddressInfo;

    const url = `http://localhost:${port}/`;

    mainWindow.loadURL(url);

    mainWindow.show();
    mainWindow.maximize();

    globalThis.globalWindow = mainWindow;
    initScanner();
  }

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}
