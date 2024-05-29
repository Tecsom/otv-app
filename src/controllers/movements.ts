import supabase from '@/config/supabase';
import { Movement } from '@/types/inventory';
import { QueryTable } from '@/types/types';
import {
  checkProductStock,
  deleteIndividualProduct,
  deleteMovement,
  getMovementsByIndividual,
  getRemaining,
  hasUngeneratedOutputMovements,
  restRemaining,
  upsertMovements
} from '@/utils/inventory';
import { Request, Response } from 'express';

export const upsertMovementsController = async (req: Request, res: Response) => {
  const movements = req.body as Movement[];

  try {
    for (const movement of movements) {
      if (!movement.individual_id) throw new Error('El movimiento debe tener un individual_id');

      await checkProductStock(String(movement.individual_id), movement.consumed);
    }

    const new_movements = await upsertMovements(movements);

    res.status(200).json(new_movements);
  } catch (error) {
    console.log({ error });
    res.status(400).json({ error: 'Error creando el movimiento' });
  }
};

export const getMovements = async (req: Request, res: Response) => {
  const { individual_id } = req.params;

  try {
    const movements = await getMovementsByIndividual(individual_id);

    res.status(200).json(movements);
  } catch (error) {
    console.log({ error });
    res.status(400).json({ error: 'Error obteniendo los movimientos' });
  }
};

export const deleteMovementController = async (req: Request, res: Response) => {
  const { movement_id } = req.params;

  try {
    await deleteMovement(movement_id);

    res.status(200).json(movement_id);
  } catch (error) {
    console.log({ error });
    res.status(400).json({ error: 'Error eliminando el movimiento' });
  }
};

export const generateOutputMovement = async (req: Request, res: Response) => {
  const movement = req.body as Movement;

  try {
    if (!movement.individual_id) throw new Error('El movimiento debe tener un individual_id');

    const has_ungenerated = await hasUngeneratedOutputMovements(String(movement.individual_id));

    if (has_ungenerated) throw new Error('Ya el producto está en una órden de compra.');
    await checkProductStock(String(movement.individual_id), movement.consumed);

    const remaining = await restRemaining(String(movement.individual_id), movement.consumed);
    if (remaining <= 0) {
      await deleteIndividualProduct(String(movement.individual_id));
    }

    const new_movement = await upsertMovements([movement]);

    res.status(200).json(new_movement);
  } catch (error) {
    console.log({ error });
    res.status(400).json({ error: 'Error creando el movimiento' });
  }
};
