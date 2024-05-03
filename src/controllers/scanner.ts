import { Request, Response } from 'express';
import { Scanner } from '../utils/scanner';
import io from 'socket.io';
import { getOrdenByCodeProd } from '@/utils/ordenes_compra';
import { session } from 'electron';
declare global {
  var socket_io: io.Server;
}

export const listPorts = async (req: Request, res: Response) => {
  try {
    const ports = await Scanner.getPorts();
    res.status(200).json(ports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const readScanner = async (req: Request, res: Response) => {
  try {
    const port = '/dev/tty.usbmodem22177B12511';
    const scanner = new Scanner();

    await scanner.connect(port);
    await scanner.open();
    const data = await scanner.read();
    await scanner.close();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const initScanner = async () => {
  try {
    const port = await Scanner.getSelectedPort();
    if (!port) {
      console.error('No port selected');
      return;
    }
    const scanner = new Scanner();

    await scanner.connect(port);
    await scanner.open();

    scanner.scan(onScanner);
  } catch (error: any) {
    console.error('Error initializing scanner: ', error.message);
  }
};

const onScanner = async (data: Buffer) => {
  const dataString = data.toString();

  const current_url = globalThis.globalWindow?.webContents.getURL();
  if (current_url.includes('verificador') && !current_url.includes('ordenes')) {
    const orden_res = await getOrdenByCodeProd(data.toString());
    const orden = orden_res && orden_res.length > 0 ? orden_res[0] : null;
    if (!orden?.id) {
      console.log('Orden no encontrada');
      return;
    }

    globalThis.globalWindow?.loadURL('http://localhost:3000/verificador/ordenes/' + orden.order_id);
    return;
  }
  console.log('redirected to localhost:3000');

  global.socket_io.emit('scanner', dataString);
};
