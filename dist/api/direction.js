"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDirection = exports.updateDirection = exports.addDirection = exports.getDirection = void 0;
const db_1 = __importDefault(require("../config/db"));
/**
 * Получает текущие данные из таблицы direction.
 */
const getDirection = async (req, res) => {
    try {
        const rows = await (0, db_1.default) `
        SELECT pk_direction_id, ui_direction_name 
        FROM direction
        `;
        res.json(rows);
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getDirection = getDirection;
/**
 * Добавляет новую запись в таблицу direction.
 */
const addDirection = async (req, res) => {
    const { ui_direction_name } = req.body;
    if (!ui_direction_name) {
        return res.status(400).json({ error: 'ui_direction_name is required' });
    }
    try {
        const [newDirection] = await (0, db_1.default) `
            INSERT INTO direction (ui_direction_name)
            VALUES (${ui_direction_name})
            RETURNING pk_direction_id, ui_direction_name
        `;
        res.status(201).json(newDirection);
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.addDirection = addDirection;
/**
 * Обновляет существующую запись в таблице direction.
 */
const updateDirection = async (req, res) => {
    const { id } = req.params;
    const { ui_direction_name } = req.body;
    if (!ui_direction_name) {
        return res.status(400).json({ error: 'ui_direction_name is required' });
    }
    try {
        const [updatedDirection] = await (0, db_1.default) `
            UPDATE direction
            SET ui_direction_name = ${ui_direction_name}
            WHERE pk_direction_id = ${id}
            RETURNING pk_direction_id, ui_direction_name
        `;
        if (!updatedDirection) {
            return res.status(404).json({ error: 'Direction not found' });
        }
        res.json(updatedDirection);
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateDirection = updateDirection;
/**
 * Удаляет запись из таблицы direction.
 */
const deleteDirection = async (req, res) => {
    const { id } = req.params;
    try {
        const [deletedDirection] = await (0, db_1.default) `
            DELETE FROM direction
            WHERE pk_direction_id = ${id}
            RETURNING pk_direction_id, ui_direction_name
        `;
        if (!deletedDirection) {
            return res.status(404).json({ error: 'Direction not found' });
        }
        res.json({ message: 'Direction deleted successfully', deletedDirection });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteDirection = deleteDirection;
