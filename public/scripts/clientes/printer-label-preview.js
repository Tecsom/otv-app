import { fetchData } from '/public/scripts/helpers.js';

const DPI = 203;
const mmToPx = mm => (mm * DPI) / 25.4;

let currentCodeType = 'QR';
let canvas = null;
let selectedObject = null;
const asignVariableBtn = document.getElementById('assign-variable-btn');

const relationsContainer = $('#label-values-map');

export const renderLabelFromJson = label => {
    const canvasEl = document.getElementById('label-preview');

    relationsContainer.empty();

    canvasEl.dataset.label = JSON.stringify(label);

    const canvasWidth = mmToPx(parseFloat(label.width));
    const canvasHeight = mmToPx(parseFloat(label.height));

    // Reutilizar canvas si ya existe, si no, crearlo
    if (!canvas) {
        canvas = new fabric.Canvas(canvasEl, {
            backgroundColor: 'white',
            selection: true
        });

        canvas.on('mouse:down', function (event) {
            selectedObject = event.target;
            $(asignVariableBtn).prop('disabled', true);
            if (selectedObject) {
                $(asignVariableBtn).prop('disabled', false);

                console.log({
                    type: selectedObject.type,
                    data: selectedObject.data
                });
            }
        });
    }

    // Ajustar tamaño y limpiar contenido anterior
    canvas.setWidth(canvasWidth);
    canvas.setHeight(canvasHeight);
    canvas.clear();
    canvas.setBackgroundColor('white', canvas.renderAll.bind(canvas));

    // Renderizar elementos de la etiqueta
    label.items.forEach(item => {
        const x = mmToPx(item.minX);
        const y = mmToPx(item.minY);
        const width = mmToPx(item.maxX - item.minX);
        const height = mmToPx(item.maxY - item.minY);

        if (item.type === 'text' || item.type === 'title') {
            const text = new fabric.Text(item.value, {
                left: x,
                top: y,
                fontSize: mmToPx(item.fontsize || 3),
                fontWeight: item.type === 'title' ? 'bold' : 'normal',
                fontFamily: 'Arial',
                fill: 'black',
                selectable: true,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true
            });
            text.data = item; // Add data label to object
            canvas.add(text);
        }

        if (item.type === 'code') {
            const bwipCanvas = document.createElement('canvas');
            bwipCanvas.width = 300;
            bwipCanvas.height = 300;

            try {
                bwipjs.toCanvas(bwipCanvas, {
                    bcid: currentCodeType === 'QR' ? 'qrcode' : 'datamatrix',
                    text: item.value,
                    scale: 3,
                    includetext: false
                });

                fabric.Image.fromURL(bwipCanvas.toDataURL(), img => {
                    img.set({
                        left: x,
                        top: y,
                        scaleX: width / bwipCanvas.width,
                        scaleY: height / bwipCanvas.height,
                        selectable: true,
                        lockMovementX: true,
                        lockMovementY: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        lockRotation: true
                    });
                    img.data = item; // Add data label to object
                    canvas.add(img);
                });
            } catch (e) {
                console.error('Error generando código:', e);
            }
        }
    });
};
async function PrintCanvasZPL() {
    try {
        const canvasElement = document.getElementById('label-preview');
        const label = JSON.parse(canvasElement.dataset.label);

        const DPI = 203;
        const mmToPx = mm => (mm * DPI) / 25.4;

        const expectedWidthPx = mmToPx(parseFloat(label.width) + 5);
        const expectedHeightPx = mmToPx(parseFloat(label.height) + 5);

        const canvas = await html2canvas(canvasElement, {
            backgroundColor: null,
            useCORS: true,
            width: expectedWidthPx,
            height: expectedHeightPx,
            scale: 1
        });

        // Crear un canvas nuevo con tamaño deseado
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = expectedWidthPx;
        resizedCanvas.height = expectedHeightPx;

        const ctx = resizedCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, expectedWidthPx, expectedHeightPx);

        // Convertir a ZPL
        const res = imageToZ64(resizedCanvas);

        // Calcular márgenes para centrar horizontalmente
        const labelWidthMM = parseFloat(label.width);
        const imageWidthDots = res.rowlen * 8;
        const labelWidthDots = mmToPx(labelWidthMM);
        const leftMarginDots = 120; //Math.max(0, Math.floor((labelWidthDots - imageWidthDots) / 2));

        const zpl = `
        ^XA
        ^LH0,0
        ^FO${leftMarginDots},20
        ^GFA,${res.length},${res.length},${res.rowlen},${res.z64}
        ^XZ`;

        await selectedDevice.send(
            zpl,
            () => toastr.success('Imagen enviada a la impresora'),
            error => {
                throw new Error('Error al enviar la imagen: ' + error);
            }
        );
    } catch (err) {
        console.error('Error:', err);
        toastr.error('Ocurrió un error al procesar la imagen');
    }
}

// const datacanvas = {
//     width: '75',
//     height: '25.4',
//     unit: 'milimeters',
//     items: [
//         {
//             type: 'code',
//             id: 'qr_c73b3f4a-9d86-4e9d-a660-52f798ee13b0',
//             value: 'qr-demo-1744748822891',
//             minX: 1.13,
//             maxX: 24.49,
//             minY: 1.13,
//             maxY: 24.49,
//             units: 'milimeters'
//         },
//         {
//             type: 'title',
//             id: 'title_8fb3b2df-ea9c-40d1-88a0-b3db630ef361',
//             value: 'Pieza',
//             minX: 26.76,
//             maxX: 37.64,
//             minY: 2.13,
//             maxY: 6.13,
//             units: 'milimeters',
//             fontsize: 4
//         },
//         {
//             type: 'text',
//             id: 'text_3549c6ba-f6e1-468a-a2a9-ddbc199d178e',
//             value: 'ABS50000000000000001',
//             minX: 26.64,
//             maxX: 73.78,
//             minY: 6.88,
//             maxY: 10.88,
//             units: 'milimeters',
//             fontsize: 4
//         }
//     ]
// };

// renderLabelFromJson(datacanvas);

//----------------------------------------------------

const $labelSelect = $('#label-select');
let allLabels = [];

async function fetchLabels() {
    const res = await fetchData('/printer/label');

    if (res.error) {
        toastr.error(res.error);
        return [];
    }

    return res.data;
}

$labelSelect.select2({
    width: '100%',
    placeholder: 'Seleccione una etiqueta',
    allowClear: true
});

fetchLabels().then(labels => {
    console.log({ labels });
    allLabels = labels;
    labels.forEach(label => {
        $labelSelect.append(new Option(label.name, label.id));
    });

    if (labels.length > 0) {
        $labelSelect.val(labels[0].id).trigger('change');
    }
});

$labelSelect.on('change', async function () {
    const labelId = $(this).val();
    if (!labelId) {
        return;
    }

    const labelSelected = allLabels.find(label => `${label.id}` === labelId);

    console.log({ labelSelected });
    renderLabelFromJson(labelSelected);
});

const $offcanvas = $('#assignVariable');

$(asignVariableBtn).on('click', function () {
    const labelSelected = allLabels.find(label => `${label.id}` === $labelSelect.val());
    const itemSelected = selectedObject;

    const $offcanvasBody = $offcanvas.find('.offcanvas-body').first();

    if (!itemSelected) {
        toastr.error('Seleccione un item de la etiqueta');
        return;
    }

    if (!labelSelected) {
        toastr.error('Seleccione una etiqueta');
        return;
    }

    const itemSelectedData = itemSelected.data;

    console.log({ labelSelected });
    console.log({ selectedData: itemSelectedData });

    const typeMap = {
        code: 'Código',
        title: 'Título',
        text: 'Texto'
    };

    const type = typeMap[itemSelectedData.type] || itemSelectedData.type;

    const $itemInputName = `
        <div class="border border-primary p-2 mb-3 rounded">  
            <div>
                <strong class="text-dark">Tipo:</strong> <small>${type}</small>
            </div>
            <input type="text" class="form-control" id="item-name" placeholder="Nombre de la variable" value="${itemSelectedData.id}" disabled>
        </div>
        <div class="mb-3">
            <strong class="text-primary">
                Sustituir con
            </strong>
        </div>
        <div>
            <select class="form-select">
                <option value="">Selecciona una opción</option>
                <option value="computed_code">Código de scanner</option>
                <option value="numero_parte">Número de parte</option>
                <option value="revision_parte">Revisión de parte</option>
                <option value="cliente_id">ID de cliente</option>
                <option value="orden_compra_id">ID orden de compra</option>
                <option value="semana_ano">Semana del año (Fecha de entrega - WW)</option>
                <option value="ano_YYYY">Año (Fecha de entrega - YYYY)</option>
                <option value="ano_YY">Año (Fecha de entrega - YY)</option>
                <option value="proveedor_id">Identificador de proveedor</option>
                <option value="consecutivo"># Consecutivo de la pieza por OC</option>
            </select>
        </div>
        <div class="mt-3">
            <button class="btn btn-primary w-100" id="save-variable-btn">Aceptar</button>
        </div>
    `;

    $offcanvasBody.empty();
    $offcanvasBody.append($itemInputName);

    $offcanvas.offcanvas('show');
});

$offcanvas.on('click', '#save-variable-btn', async function () {
    const itemSelected = selectedObject;
    const itemSelectedData = itemSelected?.data;
    const $select = $offcanvas.find('select.form-select');
    const selectedValue = $select.val();

    const variableMap = {
        computed_code: 'Código de scanner',
        numero_parte: 'Número de parte',
        revision_parte: 'Revisión de parte',
        cliente_id: 'ID de cliente',
        orden_compra_id: 'ID orden de compra',
        semana_ano: 'Semana del año (Fecha de entrega - WW)',
        ano_YYYY: 'Año (Fecha de entrega - YYYY)',
        ano_YY: 'Año (Fecha de entrega - YY)',
        proveedor_id: 'Identificador de proveedor',
        consecutivo: '# Consecutivo de la pieza por OC'
    };

    // Si no seleccionó variable, mostrar "Sin asignar"
    const variableText = selectedValue ? variableMap[selectedValue] : 'Sin asignar';

    // Determinar la clase de badge para la variable
    const variableBadgeClass = variableText === 'Sin asignar' ? 'bg-secondary' : 'bg-primary';

    // Eliminar relación previa de este item si existe
    relationsContainer.find(`.labelmap[data-item-id="${itemSelectedData.id}"]`).remove();

    const html = `
        <div class="labelmap d-flex mb-2 gap-3" data-item-id="${itemSelectedData.id}">
            <span class="badge bg-primary">${itemSelectedData.type.charAt(0).toUpperCase() + itemSelectedData.type.slice(1)}: (${itemSelectedData.id})</span>
            <span><i class="ti ti-arrow-right"></i></span>
            <span class="badge ${variableBadgeClass}">${variableText}</span>
        </div>
    `;

    //add data { itemId: itemSelectedData.id, variable: selectedValue }

    const $labelMap = $(html);
    $labelMap.data('labelmap', {
        type: itemSelectedData.type,
        item_id: itemSelectedData.id,
        replace_with: selectedValue
    });
    relationsContainer.append($labelMap);

    const a = getLabelVariableAssignments();
    console.log({ a });

    $offcanvas.offcanvas('hide');
});

export const getLabelVariableAssignments = () => {
    const relationsContainer = $('#label-values-map');
    const labelSelected = allLabels.find(label => `${label.id}` === $labelSelect.val());

    console.log({ labelSelected });

    const variables = [];

    const label_selected_id = labelSelected.id;

    relationsContainer.find('.labelmap').each(function () {
        const labelData = $(this).data('labelmap');

        variables.push({
            ...labelData,
            label_id: label_selected_id
        });
    });

    return variables;
};
