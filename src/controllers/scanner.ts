import { Request, Response } from 'express';
import { Scanner } from '../utils/scanner';
import io from 'socket.io';

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
    console.log('init');
    const port = '/dev/tty.usbmodem22177B12511';
    const scanner = new Scanner();

    await scanner.connect(port);
    await scanner.open();

    scanner.scan(onScanner);
    console.log('Scanner initialized');
  } catch (error: any) {
    console.error('Error initializing scanner: ', error.message);
  }
};

const onScanner = async (data: Buffer) => {
  const dataString = data.toString();
  global.socket_io.emit('scanner', dataString);
};
