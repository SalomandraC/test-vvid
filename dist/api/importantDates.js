"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderImportantDates = exports.deleteImportantDate = exports.updateImportantDate = exports.addImportantDate = exports.getImportantDates = void 0;
const db_1 = __importDefault(require("../config/db"));
const getImportantDates = async (req, res) => {
    try {
        const rows = await (0, db_1.default) `
            SELECT id, cur_data, description, position 
            FROM importantdates
            ORDER BY position ASC
        `;
        res.json(rows);
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getImportantDates = getImportantDates;
const addImportantDate = async (req, res) => {
    const { cur_data, description } = req.body;
    if (!cur_data || !description) {
        return res.status(400).json({ error: 'Both date and description are required' });
    }
    try {
        // Получаем максимальную текущую позицию
        const maxPositionResult = await (0, db_1.default) `
            SELECT COALESCE(MAX(position), 0) as max FROM importantdates
        `;
        const nextPosition = maxPositionResult[0].max + 1;
        const [newDate] = await (0, db_1.default) `
            INSERT INTO importantdates (cur_data, description, position)
            VALUES (${cur_data}, ${description}, ${nextPosition})
            RETURNING id, cur_data, description, position
        `;
        res.status(201).json(newDate);
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.addImportantDate = addImportantDate;
const updateImportantDate = async (req, res) => {
    const { id } = req.params;
    const { cur_data, description, position } = req.body;
    if (!cur_data || !description) {
        return res.status(400).json({ error: 'Both date and description are required' });
    }
    try {
        const [updatedDate] = await (0, db_1.default) `
            UPDATE importantdates
            SET 
                cur_data = ${cur_data},
                description = ${description},
                ${position !== undefined ? (0, db_1.default) `position = ${position}` : (0, db_1.default) ``}
            WHERE id = ${id}
            RETURNING id, cur_data, description, position
        `;
        if (!updatedDate) {
            return res.status(404).json({ error: 'Date not found' });
        }
        res.json(updatedDate);
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateImportantDate = updateImportantDate;
const deleteImportantDate = async (req, res) => {
    const { id } = req.params;
    try {
        // Получаем позицию удаляемого элемента
        const [targetDate] = await (0, db_1.default) `
            SELECT position FROM importantdates WHERE id = ${id}
        `;
        if (!targetDate) {
            return res.status(404).json({ error: 'Date not found' });
        }
        // Удаляем запись
        const [deletedDate] = await (0, db_1.default) `
            DELETE FROM importantdates
            WHERE id = ${id}
            RETURNING id, cur_data, description, position
        `;
        // Обновляем позиции оставшихся элементов
        await (0, db_1.default) `
            UPDATE importantdates
            SET position = position - 1
            WHERE position > ${targetDate.position}
        `;
        res.json({
            message: 'Date deleted successfully',
            deletedDate
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteImportantDate = deleteImportantDate;
const reorderImportantDates = async (req, res) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return res.status(400).json({ error: 'Ordered IDs array is required' });
    }
    try {
        await db_1.default.begin(async (sql) => {
            for (let i = 0; i < orderedIds.length; i++) {
                await sql `
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
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error',
        });
    }
};
exports.reorderImportantDates = reorderImportantDates;
