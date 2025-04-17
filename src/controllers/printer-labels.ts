import { Request, Response } from 'express';
import { PrinterLabel } from '@/types/printer_labels.types';
import { createNewPrinterLabel, getPrinterLabels } from '@/utils/printer-labels';

export const newPrinterLabelReq = async (req: Request, res: Response) => {
    const { name, width, height, unit, items } = req.body;

    if (!name || !width || !height || !unit || !items) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const printerLabel: PrinterLabel = {
        name,
        width,
        height,
        unit,
        items
    };

    try {
        const resutl = await createNewPrinterLabel(printerLabel);
        console.log(resutl);
        if (!resutl.status) {
            return res.status(500).json({ error: resutl.message });
        }

        return res.status(201).json(resutl.data);
    } catch (e) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPrinterLabelsReq = async (_: Request, res: Response) => {
    try {
        const result = await getPrinterLabels();
        if (!result.status) {
            return res.status(500).json({ error: result.message });
        }

        return res.status(200).json(result.data);
    } catch (e) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};
