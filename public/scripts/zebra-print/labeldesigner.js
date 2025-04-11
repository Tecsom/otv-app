const DPI = 203;
const mmToPx = mm => (mm * DPI) / 25.4;
const pxToMm = px => (px * 25.4) / DPI;

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
        objectCaching: false
    });
    text.customId = 'text_' + Date.now();
    canvas.add(text).setActiveObject(text);
}

function addQR() {
    const qrText = prompt('Texto para el QR:', 'https://example.com');
    if (!qrText) return;
    const qr = new QRious({ value: qrText, size: 120 });
    fabric.Image.fromURL(qr.toDataURL(), function (img) {
        img.set({ left: 100, top: 50, scaleX: 1, scaleY: 1 });
        img.customId = 'qr_' + Date.now();
        img.qrText = qrText;
        canvas.add(img).setActiveObject(img);
    });
}

function addStaticLabel() {
    const label = new fabric.Textbox('Label estático', {
        left: 50,
        top: 100,
        fontSize: mmToPx(4),
        objectCaching: false
    });
    label.isStaticLabel = true;
    canvas.add(label).setActiveObject(label);
}

// ---- EXPORT JSON ----
function getLabelJson() {
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

        if (obj.isStaticLabel) {
            type = 'label';
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
        } else if (obj.type === 'image' && obj.qrText) {
            type = 'qr';
            id = obj.customId || '';
            value = obj.qrText;
            widthMM = pxToMm(obj.getScaledWidth());
            heightMM = pxToMm(obj.getScaledHeight());
            sizeMM = (widthMM + heightMM) / 2;
        }

        return {
            type,
            ...(id && { id }),
            value,
            left: parseFloat(leftMM.toFixed(2)),
            top: parseFloat(topMM.toFixed(2)),
            size: parseFloat(sizeMM.toFixed(2)),
            minX: parseFloat(leftMM.toFixed(2)),
            maxX: parseFloat((leftMM + widthMM).toFixed(2)),
            minY: parseFloat(topMM.toFixed(2)),
            maxY: parseFloat((topMM + heightMM).toFixed(2))
        };
    });

    const result = {
        width: String(wmm),
        height: String(hmm),
        items
    };

    document.getElementById('output').textContent = JSON.stringify(result, null, 2);
}

// ---- SIDEBAR PROPERTIES ----
function updatePropertiesPanel(obj) {
    if (!obj) return;
    document.getElementById('prop-id').value = obj.customId || '';
    document.getElementById('prop-left').value = parseFloat(pxToMm(obj.left).toFixed(2));
    document.getElementById('prop-top').value = parseFloat(pxToMm(obj.top).toFixed(2));

    if (obj.type === 'textbox' || obj.isStaticLabel) {
        document.getElementById('prop-size').value = parseFloat(pxToMm(obj.fontSize).toFixed(2));
        document.getElementById('prop-text').value = obj.text;
    } else if (obj.type === 'image') {
        document.getElementById('prop-size').value = parseFloat(pxToMm(obj.getScaledWidth()).toFixed(2));
        document.getElementById('prop-text').value = obj.qrText || '';
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
        if (!obj.isStaticLabel) {
            obj.customId = document.getElementById('prop-id').value;
        }
        obj.text = value;
        obj.fontSize = mmToPx(sizeMM);
    } else if (obj.type === 'image' && obj.qrText) {
        obj.customId = document.getElementById('prop-id').value;
        obj.qrText = value;
        const sizePx = mmToPx(sizeMM);
        const scale = sizePx / obj.width;
        obj.scaleX = obj.scaleY = scale;

        const qr = new QRious({ value: obj.qrText, size: 120 });
        obj._element.src = qr.toDataURL();
    }

    obj.setCoords();
    canvas.requestRenderAll();
}

// ---- EVENTS ----
canvas.on('selection:created', e => updatePropertiesPanel(e.selected[0]));
canvas.on('selection:updated', e => updatePropertiesPanel(e.selected[0]));
canvas.on('selection:cleared', () => updatePropertiesPanel(null));

// ---- GLOBAL ----
window.setLabelSize = setLabelSize;
window.addText = addText;
window.addQR = addQR;
window.addStaticLabel = addStaticLabel;
window.getLabelJson = getLabelJson;
window.applyChanges = applyChanges;

// ---- INIT ----
setLabelSize();
