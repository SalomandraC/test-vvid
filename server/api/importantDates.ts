import { Request, Response } from "express";
import sql from "../config/db";

interface IImportantDates {
    id?: number;
    cur_data: string;
    description: string;
    position?: number;
}

export const getImportantDates = async (req: Request, res: Response) => {
    try {
        const rows = await sql<IImportantDates[]>`
            SELECT id, cur_data, description, position 
            FROM importantdates
            ORDER BY position ASC
        `;
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addImportantDate = async (req: Request, res: Response) => {
    const { cur_data, description } = req.body;
    if (!cur_data || !description) {
        return res.status(400).json({ error: 'Both date and description are required' });
    }
    try {
        // Получаем максимальную текущую позицию
        const maxPositionResult = await sql<{ max: number }[]>`
            SELECT COALESCE(MAX(position), 0) as max FROM importantdates
        `;
        const nextPosition = maxPositionResult[0].max + 1;

        const [newDate] = await sql<IImportantDates[]>`
            INSERT INTO importantdates (cur_data, description, position)
            VALUES (${cur_data}, ${description}, ${nextPosition})
            RETURNING id, cur_data, description, position
        `;
        res.status(201).json(newDate);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateImportantDate = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { cur_data, description, position } = req.body;
    
    if (!cur_data || !description) {
        return res.status(400).json({ error: 'Both date and description are required' });
    }
    
    try {
        const [updatedDate] = await sql<IImportantDates[]>`
            UPDATE importantdates
            SET 
                cur_data = ${cur_data},
                description = ${description},
                ${position !== undefined ? sql`position = ${position}` : sql``}
            WHERE id = ${id}
            RETURNING id, cur_data, description, position
        `;
        
        if (!updatedDate) {
            return res.status(404).json({ error: 'Date not found' });
        }

        res.json(updatedDate);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteImportantDate = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Получаем позицию удаляемого элемента
        const [targetDate] = await sql<{ position: number }[]>`
            SELECT position FROM importantdates WHERE id = ${id}
        `;

        if (!targetDate) {
            return res.status(404).json({ error: 'Date not found' });
        }

        // Удаляем запись
        const [deletedDate] = await sql<IImportantDates[]>`
            DELETE FROM importantdates
            WHERE id = ${id}
            RETURNING id, cur_data, description, position
        `;

        // Обновляем позиции оставшихся элементов
        await sql`
            UPDATE importantdates
            SET position = position - 1
            WHERE position > ${targetDate.position}
        `;

        res.json({ 
            message: 'Date deleted successfully', 
            deletedDate 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const reorderImportantDates = async (req: Request, res: Response) => {
    const { orderedIds } = req.body;
    
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return res.status(400).json({ error: 'Ordered IDs array is required' });
    }
    
    try {
        await sql.begin(async sql => {
            for (let i = 0; i < orderedIds.length; i++) {
                await sql`
                    UPDATE importantdates
                    SET position = ${i + 1}
                    WHERE id = ${orderedIds[i]}
                `;
            }
        });
        
        res.json({ 
            success: true,
            message: 'Dates reordered successfully' 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
        });
    }
};