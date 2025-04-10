import { generateLabelCode } from '/public/libs/zebra/modules/labels.js';

export const getDefaultDevice = async () => {
    return new Promise((resolve, reject) => {
        BrowserPrint.getDefaultDevice(
            'printer',
            function (device) {
                resolve(device);
            },
            function (error) {
                reject(error);
            }
        );
    });
};

export const getDevices = async () => {
    return new Promise((resolve, reject) => {
        BrowserPrint.getLocalDevices(
            function (device_list) {
                resolve(device_list);
            },
            function (error) {
                reject(error);
            },
            'printer'
        );
    });
};

export const testConnection = async selectedDevice => {
    console.log({ selectedDevice });
    if (!selectedDevice) {
        return {
            status: false,
            message: 'No device selected'
        };
    }

    //send a zpl command to the printer

    const zpl = `^XA^FO50,50^ADN,36,20^FDHello World!^FS^XZ`;
    return new Promise((resolve, reject) => {
        selectedDevice.send(
            zpl,
            function (device) {
                resolve({
                    status: true,
                    message: 'Connection successful'
                });
            },
            function (error) {
                console.error('Error sending data to printer:', error);
                resolve({
                    status: false,
                    message: 'Connection failed'
                });
            }
        );
    });
};

export const printLabel = async (selectedDevice, data, labelSize = { width: 80, height: 25.4 }) => {
    console.log({ selectedDevice });
    if (!selectedDevice) {
        return {
            status: false,
            message: 'No device selected'
        };
    }

    //data is an array of objects with the label objects
    const labelsZPLS = []; //store the zpl codes of the labels
    for (const label of data) {
        const zplLabel = generateLabelCode(label, labelSize);
        labelsZPLS.push(zplLabel);
    }
    console.log({ labelsZPLS });
    const zpl = labelsZPLS.join('\n');

    return new Promise((resolve, reject) => {
        selectedDevice.send(
            zpl,
            function (device) {
                resolve({
                    status: true,
                    message: 'Label sent successfully'
                });
            },
            function (error) {
                console.error('Error sending data to printer:', error);
                resolve({
                    status: false,
                    message: 'Connection failed'
                });
            }
        );
    });
};
