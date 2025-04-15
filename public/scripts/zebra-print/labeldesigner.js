const DPI = 203;
const mmToPx = mm => (mm * DPI) / 25.4;
const pxToMm = px => (px * 25.4) / DPI;

let titleCounter = 0;
let textCounter = 0;
let codeCounter = 0;

const canvas = new fabric.Canvas('label-canvas');

// ---- SET CANVAS SIZE ----
function setLabelSize() {
    const wmm = parseFloat(document.getElementById('label-width').value);
    const hmm = parseFloat(document.getElementById('label-height').value);
    canvas.setWidth(mmToPx(wmm));
    canvas.setHeight(mmToPx(hmm));
    canvas.renderAll();
}

// ---- ADD ELEMENTS ----
function addText() {
    const text = new fabric.Textbox('Texto aquí', {
        left: 50,
        top: 50,
        fontSize: mmToPx(4),
        objectCaching: false,
        editable: true,
        fontFamily: 'Arial',
        width: mmToPx(40) // puedes ajustar este valor si quieres
    });

    // Evitar que se escale (solo se cambiará el ancho real)
    text.set({
        lockScalingX: false,
        lockScalingY: true
    });

    // Mostrar solo los controladores izquierdo y derecho
    text.setControlsVisibility({
        mt: false,
        mb: false,
        ml: true,
        mr: true,
        tl: false,
        tr: false,
        bl: false,
        br: false,
        mtr: false
    });
    text.customId = 'text_' + crypto.randomUUID();
    canvas.add(text).setActiveObject(text);
}

function addCode() {
    const codeText = 'qr-demo-' + Date.now();
    if (!codeText) return;
    const qr = new QRious({ value: codeText, size: 120 });
    fabric.Image.fromURL(qr.toDataURL(), function (img) {
        img.set({ left: 100, top: 50, scaleX: 1, scaleY: 1 });
        img.customId = 'qr_' + crypto.randomUUID();
        img.codeText = codeText;
        canvas.add(img).setActiveObject(img);
    });
}

function addTitle() {
    const title = new fabric.Textbox('Título', {
        left: 50,
        top: 100,
        fontSize: mmToPx(4),
        objectCaching: false,
        fontWeight: 'bold',
        fontFamily: 'Arial'
    });
    title.isTitle = true;
    title.customId = 'title_' + crypto.randomUUID();
    canvas.add(title).setActiveObject(title);
}

// ---- EXPORT JSON ----
export const getLabelJson = () => {
    canvas.discardActiveObject(); // 🔧 esto descarta la selección múltiple temporal
    canvas.requestRenderAll(); // 🔁 asegura que los objetos vuelvan a su escala real

    const wmm = parseFloat(document.getElementById('label-width').value);
    const hmm = parseFloat(document.getElementById('label-height').value);

    const items = canvas.getObjects().map(obj => {
        const leftMM = pxToMm(obj.left);
        const topMM = pxToMm(obj.top);
        let sizeMM = 0;
        let value = '';
        let type = '';
        let id = '';
        let widthMM = 0;
        let heightMM = 0;

        if (obj.isTitle) {
            id = obj.customId || '';
            type = 'title';
            value = obj.text;
            sizeMM = pxToMm(obj.fontSize);
            widthMM = pxToMm(obj.width * obj.scaleX);
            heightMM = sizeMM;
        } else if (obj.type === 'textbox') {
            type = 'text';
            id = obj.customId || '';
            value = obj.text;
            sizeMM = pxToMm(obj.fontSize);
            widthMM = pxToMm(obj.width * obj.scaleX);
            heightMM = sizeMM;
        } else if (obj.type === 'image' && obj.codeText) {
            type = 'code';
            id = obj.customId || '';
            value = obj.codeText;
            widthMM = pxToMm(obj.getScaledWidth());
            heightMM = pxToMm(obj.getScaledHeight());
            sizeMM = (widthMM + heightMM) / 2;
        }

        const result = {
            type,
            id,
            value,
            minX: parseFloat(leftMM.toFixed(2)),
            maxX: parseFloat((leftMM + widthMM).toFixed(2)),
            minY: parseFloat(topMM.toFixed(2)),
            maxY: parseFloat((topMM + heightMM).toFixed(2)),
            units: 'milimeters'
        };

        if (type === 'text' || type === 'title') {
            result.fontsize = parseFloat(sizeMM.toFixed(2));
        }

        return result;
    });

    const result = {
        width: String(wmm),
        height: String(hmm),
        unit: 'milimeters',
        items
    };

    return result;
};

function alignVertically() {
    const selectedObject = canvas.getActiveObject();
    if (!selectedObject) return;

    // Align the object vertically in the canvas container
    const canvasHeight = canvas.getHeight();
    selectedObject.top = (canvasHeight - selectedObject.getScaledHeight()) / 2;

    selectedObject.setCoords();
    canvas.requestRenderAll();
}

function alignHorizontally() {
    const selectedObject = canvas.getActiveObject();
    if (!selectedObject) return;
    // Align the object horizontally in the canvas container
    const canvasWidth = canvas.getWidth();
    selectedObject.left = (canvasWidth - selectedObject.getScaledWidth()) / 2;
    selectedObject.setCoords();
    canvas.requestRenderAll();
}

// ---- SIDEBAR PROPERTIES ----
function updatePropertiesPanel(obj) {
    if (!obj) return;
    document.getElementById('prop-id').value = obj.customId || '';
    document.getElementById('prop-left').value = parseFloat(pxToMm(obj.left).toFixed(2));
    document.getElementById('prop-top').value = parseFloat(pxToMm(obj.top).toFixed(2));

    if (obj.type === 'textbox' || obj.isTitle) {
        document.getElementById('prop-size').value = parseFloat(pxToMm(obj.fontSize).toFixed(2));
        document.getElementById('prop-text').value = obj.text;
    } else if (obj.type === 'image') {
        document.getElementById('prop-size').value = parseFloat(pxToMm(obj.getScaledWidth()).toFixed(2));
        document.getElementById('prop-text').value = obj.codeText || '';
    }
}

function applyChanges() {
    const obj = canvas.getActiveObject();
    if (!obj) return;

    const left = mmToPx(parseFloat(document.getElementById('prop-left').value));
    const top = mmToPx(parseFloat(document.getElementById('prop-top').value));
    const sizeMM = parseFloat(document.getElementById('prop-size').value);
    const value = document.getElementById('prop-text').value;

    obj.left = left;
    obj.top = top;

    if (obj.type === 'textbox') {
        obj.customId = document.getElementById('prop-id').value;
        obj.text = value;
        obj.fontSize = mmToPx(sizeMM);
    } else if (obj.type === 'image' && obj.codeText) {
        obj.customId = document.getElementById('prop-id').value;
        obj.codeText = value;
        const sizePx = mmToPx(sizeMM);
        const scale = sizePx / obj.width;
        obj.scaleX = obj.scaleY = scale;

        const qr = new QRious({ value: obj.codeText, size: 120 });
        obj._element.src = qr.toDataURL();
    }

    obj.setCoords();
    canvas.requestRenderAll();
}

function clearPropertiesPanel() {
    updatePropertiesPanel(null);
    //clear input values
    document.getElementById('prop-id').value = '';
    document.getElementById('prop-left').value = '';
    document.getElementById('prop-top').value = '';
    document.getElementById('prop-size').value = '';
    document.getElementById('prop-text').value = '';

    //clear output
    document.getElementById('output').textContent = '';
}

function removeSelectedItems() {
    const selectedObjects = canvas.getActiveObjects();
    selectedObjects.forEach(obj => {
        canvas.remove(obj);
    });
    canvas.discardActiveObject();
    canvas.renderAll();
    clearPropertiesPanel();
}

// ---- EVENTS ----
canvas.on('selection:created', e => updatePropertiesPanel(e.selected[0]));
canvas.on('selection:updated', e => updatePropertiesPanel(e.selected[0]));
canvas.on('selection:cleared', () => updatePropertiesPanel(null));

canvas.on('object:moving', e => {
    const selectedObjects = canvas.getActiveObjects();
    if (selectedObjects.length > 1) {
        disablePropertiesPanel();
        return;
    }

    const obj = e.target;
    if (obj) {
        document.getElementById('prop-left').value = parseFloat(pxToMm(obj.left).toFixed(2));
        document.getElementById('prop-top').value = parseFloat(pxToMm(obj.top).toFixed(2));
    }
});

canvas.on('object:scaling', e => {
    const obj = e.target;
    if (obj) {
        if (obj.type === 'textbox' || obj.isTitle) {
            document.getElementById('prop-size').value = parseFloat(pxToMm(obj.fontSize * obj.scaleY).toFixed(2));
        } else if (obj.type === 'image') {
            document.getElementById('prop-size').value = parseFloat(pxToMm(obj.getScaledWidth()).toFixed(2));
        }
    }
});

canvas.on('selection:created', e => {
    if (e.selected.length > 1) {
        disablePropertiesPanel();
    } else {
        updatePropertiesPanel(e.selected[0]);
    }
});

canvas.on('selection:updated', e => {
    if (e.selected.length > 1) {
        disablePropertiesPanel();
    } else {
        updatePropertiesPanel(e.selected[0]);
    }
});

canvas.on('selection:cleared', () => {
    clearPropertiesPanel();
});

canvas.on('selection:created', e => {
    const obj = e.selected[0];
    if (obj && obj.type === 'image' && obj.codeText) {
        document.getElementById('prop-size').parentElement.style.display = 'none';
    } else {
        document.getElementById('prop-size').parentElement.style.display = '';
    }
    updatePropertiesPanel(obj);
});

canvas.on('selection:updated', e => {
    const obj = e.selected[0];
    if (obj && obj.type === 'image' && obj.codeText) {
        document.getElementById('prop-size').parentElement.style.display = 'none';
    } else {
        document.getElementById('prop-size').parentElement.style.display = '';
    }
    updatePropertiesPanel(obj);
});

canvas.on('selection:cleared', () => {
    document.getElementById('prop-size').parentElement.style.display = '';
    clearPropertiesPanel();
});

// ---- INPUT VALIDATION ----
document.getElementById('label-width').addEventListener('input', e => {
    const value = e.target.value;
    if (!/^\d*\.?\d*$/.test(value)) {
        e.target.value = value.slice(0, -1); // Remove the last invalid character
    } else {
        setLabelSize(); // Update canvas size if the input is valid
    }
});

document.getElementById('label-height').addEventListener('input', e => {
    const value = e.target.value;
    if (!/^\d*\.?\d*$/.test(value)) {
        e.target.value = value.slice(0, -1); // Remove the last invalid character
    } else {
        setLabelSize(); // Update canvas size if the input is valid
    }
});

document.getElementsByClassName('prop-input').forEach(input => {
    //get attribute x-label

    const prop_input = input.getAttribute('x-label'); //id of input property

    input.addEventListener('input', e => {
        applyChanges();
    });
});

function disablePropertiesPanel() {
    document.getElementById('prop-id').value = '';
    document.getElementById('prop-left').value = '';
    document.getElementById('prop-top').value = '';
    document.getElementById('prop-size').value = '';
    document.getElementById('prop-text').value = '';
    document.getElementById('prop-id').disabled = true;
    document.getElementById('prop-left').disabled = true;
    document.getElementById('prop-top').disabled = true;
    document.getElementById('prop-size').disabled = true;
    document.getElementById('prop-text').disabled = true;
}

function enablePropertiesPanel() {
    document.getElementById('prop-id').disabled = false;
    document.getElementById('prop-left').disabled = false;
    document.getElementById('prop-top').disabled = false;
    document.getElementById('prop-size').disabled = false;
    document.getElementById('prop-text').disabled = false;
}

canvas.on('selection:cleared', () => {
    updatePropertiesPanel(null);
    enablePropertiesPanel();
});

// ---- GLOBAL ----
window.setLabelSize = setLabelSize;
window.addText = addText;
window.addCode = addCode;
window.addTitle = addTitle;
window.getLabelJson = getLabelJson;
window.removeSelectedItems = removeSelectedItems;
window.alignVertically = alignVertically;
window.alignHorizontally = alignHorizontally;

// ---- INIT ----
setLabelSize();
