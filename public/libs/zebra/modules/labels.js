/**
 * Genera un bloque ZPL (Zebra Programming Language) para imprimir una etiqueta con uno o más elementos.
 *
 * @param {Array<Object>} elements - Lista de objetos que representan los elementos a imprimir (texto o DataMatrix).
 * @param {Object} labelSizeMM - Dimensiones de la etiqueta en milímetros.
 * @param {number} labelSizeMM.width - Ancho de la etiqueta en mm.
 * @param {number} labelSizeMM.height - Alto de la etiqueta en mm.
 * @returns {string} Cadena ZPL lista para enviarse a la impresora.
 *
 * Cada elemento puede tener las siguientes propiedades:
 * @param {("text"|"datamatrix")} element.type - Tipo de elemento (texto o código DataMatrix).
 * @param {string} element.text - Contenido del texto o del código.
 * @param {number} element.position_x - Posición horizontal.
 * @param {number} element.position_y - Posición vertical.
 * @param {("milimeters"|"dots")} [element.unit="milimeters"] - Unidad de medida de las posiciones.
 * @param {number} [element.module_size=6] - Tamaño del módulo para códigos DataMatrix (solo para `datamatrix`). **Unidad: dots**
 * @param {number} [element.font_height=20] - Altura de fuente para texto. **Unidad: dots**
 * @param {number} [element.font_width=20] - Ancho de fuente para texto. **Unidad: dots**
 *
 * @example
 * // Ejemplo de elemento de texto con tamaño personalizado en dots:
 * {
 *   type: "text",
 *   text: "Producto XYZ",
 *   position_x: 30,
 *   position_y: 12,
 *   unit: "milimeters",
 *   font_height: 30, // 30 dots ≈ 3.75 mm (en impresora de 203 dpi)
 *   font_width: 30   // 30 dots ≈ 3.75 mm
 * }
 *
 * @example
 * // Ejemplo de código DataMatrix con tamaño de módulo:
 * {
 *   type: "datamatrix",
 *   text: "ABC123456",
 *   module_size: 10,  // 10 dots ≈ 1.25 mm
 *   unit: "milimeters",
 *   position_x: 5,
 *   position_y: 5
 * }
 *
 * // Conversión útil para 203 dpi:
 * // mm × (203 / 25.4) = dots
 * // Ej: 5 mm ≈ 40 dots
 */

export const generateLabelCode = (elements, labelSizeMM = { width: 80, height: 25.4 }) => {
    const DPI = 203;
    const mmToDots = mm => Math.round((mm * DPI) / 25.4);

    const widthDots = mmToDots(labelSizeMM.width);
    const heightDots = mmToDots(labelSizeMM.height);

    let zpl = `^XA\n^PW${widthDots}\n^LL${heightDots}\n`;

    for (const element of elements) {
        const {
            type,
            text,
            position_x,
            position_y,
            module_size = 6,
            font_height = 20,
            font_width = 20,
            unit = 'milimeters'
        } = element;

        const posX = unit === 'milimeters' ? mmToDots(position_x) : position_x;
        const posY = unit === 'milimeters' ? mmToDots(position_y) : position_y;

        if (type === 'datamatrix') {
            zpl += `^FO${posX},${posY}\n^BXN,${module_size},200\n^FD${text}^FS\n`;
        }

        if (type === 'text') {
            zpl += `^FO${posX},${posY}\n^A0N,${font_height},${font_width}\n^FD${text}^FS\n`;
        }
    }

    zpl += '^XZ';
    return zpl;
};
