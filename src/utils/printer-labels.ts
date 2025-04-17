import supabase from '@/config/supabase';
import { PrinterLabel, PrinterLabelTable } from '@/types/printer_labels.types';
import { ApiResult } from '@/types/types';

export const createNewPrinterLabel = async (label: PrinterLabel): Promise<ApiResult> => {
    const { data, error } = await supabase()
        .from('printer_labels')
        .insert([
            {
                name: label.name,
                width: label.width,
                height: label.height,
                unit: label.unit,
                items: label.items
            }
        ])
        .select('*')
        .single();

    if (error) {
        return {
            data: null,
            message: error.message,
            status: false
        };
    }

    return {
        data: data,
        message: 'Printer label created successfully',
        status: true
    };
};

export const getPrinterLabels = async (): Promise<ApiResult> => {
    const { data, error } = await supabase().from('printer_labels').select('*');

    if (error) {
        return {
            data: null,
            message: error.message,
            status: false
        };
    }

    return {
        data: data as PrinterLabelTable[],
        message: 'Printer labels fetched successfully',
        status: true
    };
};
