import { Request, Response } from 'express';
import { Scanner } from '../utils/scanner';
import io from 'socket.io';
import { getOrdenByCodeProd } from '@/utils/ordenes_compra';
import { session } from 'electron';
declare global {
  var socket_io: io.Server;
  var globalScanner: Scanner;
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

export const initScanner = async (req?: Request, res?: Response) => {
  //try to init scanner max 4 attempts
  let attempts = 0;
  let success = false;
  while (attempts < 4 && !success) {
    try {
      success = (await initscanner()) ?? false;
    } catch (error) {}
    attempts++;
  }

  if (success && res) {
    res.status(200).json({ result: 'OK' });
  } else if (res) {
    res.status(500).json({ error: 'No scanner found' });
  }
};

const initscanner = async () => {
  let port;

  port = await Scanner.getSelectedPort();
  if (!port) return;

  if (!globalThis.globalScanner) {
    globalThis.globalScanner = new Scanner();
  }
  await globalThis.globalScanner.disconnect();

  await globalThis.globalScanner.connect(port);

  await globalThis.globalScanner.open();

  globalThis.globalScanner.scan(onScanner);
  console.log('initScanner');

  return true;
};

const onScanner = async (data: Buffer) => {
  const dataString = data.toString();

  console.log(dataString)

  console.log('redirected to localhost:3000');

  global.socket_io.emit('scanner', dataString);
};
