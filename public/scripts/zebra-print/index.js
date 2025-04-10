import { getDevices, getDefaultDevice, testConnection, printLabel } from '/public/libs/zebra/zebra-setup.js';
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
