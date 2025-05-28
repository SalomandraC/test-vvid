// server/api/direction.ts
import { Request, Response } from "express";
import sql from "../config/db";

interface IDirection {
    pk_direction_id: number;
    ui_direction_name: string;
}

/**
 * Получает текущие данные из таблицы direction.
 */
export const getDirection = async (req: Request, res: Response) => {
    try {
        const rows = await sql<IDirection[]>`
        SELECT pk_direction_id, ui_direction_name 
        FROM direction
        `;
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Добавляет новую запись в таблицу direction.
 */
export const addDirection = async (req: Request, res: Response) => {
    const { ui_direction_name } = req.body;
    if (!ui_direction_name) {
        return res.status(400).json({ error: 'ui_direction_name is required' });
    }
    try {
        const [newDirection] = await sql<IDirection[]>`
            INSERT INTO direction (ui_direction_name)
            VALUES (${ui_direction_name})
            RETURNING pk_direction_id, ui_direction_name
        `;
        res.status(201).json(newDirection);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Обновляет существующую запись в таблице direction.
 */
export const updateDirection = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { ui_direction_name } = req.body;
    if (!ui_direction_name) {
        return res.status(400).json({ error: 'ui_direction_name is required' });
    }
    try {
        const [updatedDirection] = await sql<IDirection[]>`
            UPDATE direction
            SET ui_direction_name = ${ui_direction_name}
            WHERE pk_direction_id = ${id}
            RETURNING pk_direction_id, ui_direction_name
        `;
        if (!updatedDirection) {
            return res.status(404).json({ error: 'Direction not found' });
        }

        res.json(updatedDirection);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Удаляет запись из таблицы direction.
 */
export const deleteDirection = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [deletedDirection] = await sql<IDirection[]>`
            DELETE FROM direction
            WHERE pk_direction_id = ${id}
            RETURNING pk_direction_id, ui_direction_name
        `;

        if (!deletedDirection) {
            return res.status(404).json({ error: 'Direction not found' });
        }

        res.json({ message: 'Direction deleted successfully', deletedDirection });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};