export interface PrinterLabelTable {
    id: number;
    created_at: string;
    name: string;
    width: string;
    height: string;
    unit: string;
    items: PrinterLabelItem[];
}

export type PrinterLabel = Omit<PrinterLabelTable, 'id' | 'created_at'>;

export interface PrinterLabelItem {
    type: string;
    id: string;
    value: string;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    units: string;
    fontsize?: number;
}
