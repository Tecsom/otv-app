import {
    getDevices,
    getDefaultDevice,
    testConnection,
    printLabel
    // printLabelImage
} from '/public/libs/zebra/zebra-setup.js';
import { formToJson } from '/public/scripts/helpers.js';

const $devicesSelect = document.querySelector('#selected_device');

let selectedDevice = null;

let devicesList = [];

async function setup() {
    const devices = await getDevices();
    devicesList = devices;
    console.log(devices);

    if (devices.length === 0) {
        console.log('No devices found');
        return;
    }

    const defaultDevice = await getDefaultDevice();

    let devicesHtml = `<option value="${defaultDevice.uid}">${defaultDevice.name}</option>`;

    devices.forEach(device => {
        if (device.uid === defaultDevice.uid) return;
        devicesHtml += `<option value="${device.uid}">${device.name}</option>`;
    });
    $devicesSelect.innerHTML = devicesHtml;

    if (devices.length === 1) {
        console.log('Only one device found');
        selectedDevice = devices[0];
    }
}

setup();
//---------

$devicesSelect.addEventListener('change', async e => {
    console.log('Selected device:', e.target.value);
    const value = e.target.value;
    const device = devicesList.find(device => device.uid === value);
    if (!device) {
        console.log('Device not found');
        return;
    }
    console.log('Selected device:', device);
    selectedDevice = device;
});

$('#btn-test-connection').on('click', async () => {
    if (!selectedDevice) {
        toastr.error('No device selected');
        return;
    }

    const result = await testConnection(selectedDevice);
    console.log({ result });
    if (result.status) {
        toastr.success('Connection successful');
    } else {
        toastr.error(result.message);
    }
});

$('#labelForm').on('submit', async e => {
    e.preventDefault();
    const formData = formToJson(e.target);
    console.log('Form data:', formData);

    const { datamatrix, label1, label2 } = formData;
    /**{
      type: "datamatrix",
      text: "test1",
      module_size: 10, //tamaño del datamatrix
      unit: "milimeters", //unidad de medida de la posicion
      position_x: 5,
      position_y: 5,
    },
    {
      type: "text",
      text: "test1",
      position_x: 30,
      position_y: 5,
      unit: "milimeters", //unidad de medida de la posicion
      font_height: 30,
      font_width: 30,
    },
    {
      type: "text",
      text: "Prueba de etiqueta 1",
      position_x: 30,
      position_y: 12,
      unit: "milimeters", //unidad de medida de la posicion
      font_height: 25,
      font_width: 25,
    }, */

    const elements = [LabelDataMatrix(datamatrix, 5, 5), LabelText(label1, 30, 5, 30), LabelText(label2, 30, 12, 25)];

    await printLabel(selectedDevice, [elements], { width: 80, height: 25.4 });
});

function calculateModuleSize(text) {
    const baseSize = 9; // Default module size
    const maxLength = 14; // Maximum text length for base size
    const minSize = 5; // Minimum module size

    if (text.length <= maxLength) {
        return baseSize;
    }

    const scaleFactor = Math.sqrt(maxLength / text.length); // Slower reduction of scale factor
    const calculatedSize = baseSize * scaleFactor;

    return Math.max(calculatedSize, minSize);
}

function LabelDataMatrix(labelText, positionX, positionY) {
    return {
        type: 'datamatrix',
        text: labelText,
        module_size: calculateModuleSize(labelText),
        unit: 'milimeters',
        position_x: positionX,
        position_y: positionY
    };
}

function LabelText(labelText, positionX, positionY, fontSize) {
    return {
        type: 'text',
        text: labelText,
        position_x: positionX,
        position_y: positionY,
        unit: 'milimeters',
        font_height: fontSize,
        font_width: fontSize
    };
}

function capturar(selectedDevice, capture_wrapper_dom) {
    const elemento = capture_wrapper_dom;

    html2canvas(elemento, {
        scale: 203 / 96
    }).then(async canvas => {
        const imgData = canvas.toDataURL('image/png');

        const zpl = canvasToZPL_GFA(canvas, 'R:LOGO.GRF');

        selectedDevice.send(
            zpl,
            function (device) {
                console.log('Image sent to printer');
                toastr.success('Image sent to printer');
            },
            function (error) {
                console.error('Error sending image to printer:', error);
                toastr.error('Error sending image to printer');
            }
        );
    });
}

$('#printQR').on('click', async () => {
    const capture_wrapper_dom = document.getElementById('capture-qr');
    capturar(selectedDevice, capture_wrapper_dom);
});

$('#printDatamatrix').on('click', async () => {
    const capture_wrapper_dom = document.getElementById('capture-datamatrix');
    capturar(selectedDevice, capture_wrapper_dom);
});

function canvasToZPL_GFA(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height).data;

    const threshold = 127;
    const binaryData = [];

    for (let y = 0; y < height; y++) {
        let row = '';
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const grayscale = 0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2];
            row += grayscale < threshold ? '1' : '0';
        }

        while (row.length % 8 !== 0) row += '0';

        for (let i = 0; i < row.length; i += 8) {
            const byte = row.substr(i, 8);
            const hex = parseInt(byte, 2).toString(16).padStart(2, '0').toUpperCase();
            binaryData.push(hex);
        }
    }

    const bytesPerRow = Math.ceil(width / 8);
    const totalBytes = binaryData.length;

    // ^GFA,a,b,c,data
    // a = total bytes
    // b = total bytes
    // c = bytes per row
    let zpl = `^XA\n^FO0,0\n^GFA,${totalBytes},${totalBytes},${bytesPerRow},`;

    for (let i = 0; i < binaryData.length; i++) {
        zpl += binaryData[i];
        if ((i + 1) % bytesPerRow === 0) zpl += '\n';
    }

    zpl += '^XZ';

    return zpl;
}
