import { SerialPort } from 'serialport';
import { PortInfo } from '@serialport/bindings-interface';

export class Scanner {
  private port: SerialPort | null = null;

  async connect(path: string) {
    if (this.port) throw new Error('Port already connected');
    this.port = new SerialPort({
      baudRate: 9600,
      path
    });

    return this.port;
  }

  async open() {
    if (!this.port) throw new Error('Port not connected');
    await this.port.open();

    return this.port;
  }

  async close() {
    if (!this.port) throw new Error('Port not connected');
    await this.port.close();

    this.port = null;
  }

  async write(data: string) {
    if (!this.port) throw new Error('Port not connected');
    await this.port.write(data);

    return this.port;
  }

  scan(callback: (data: string) => void): void {
    if (!this.port) throw new Error('Port not connected');

    this.port.on('data', data => {
      callback(data);
    });
  }

  public static async getPorts(): Promise<PortInfo[]> {
    return SerialPort.list();
  }
}
