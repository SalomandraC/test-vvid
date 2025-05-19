"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCurrentPlace = exports.getCurrentPlace = void 0;
const db_1 = __importDefault(require("../config/db"));
/**
 * Получает текущее значение place из таблицы currentplace.
 * Если таблицы или записи нет — создаёт запись со значением 1.
 */
const getCurrentPlace = async (req, res) => {
    try {
        // Получаем текущее место
        const rows = await (0, db_1.default) `
      SELECT place FROM currentplace LIMIT 1
    `;
        if (rows.length === 0) {
            const newRows = await (0, db_1.default) `
        INSERT INTO currentplace (place)
        VALUES (1)
        RETURNING place
      `;
            return res.json({ place: newRows[0].place });
        }
        res.json({ place: rows[0].place });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Database error',
            details: error instanceof Error ? error.message : String(error),
        });
    }
};
exports.getCurrentPlace = getCurrentPlace;
/**
 * Обновляет значение place в таблице currentplace.
 * Поддерживает транзакции.
 */
const updateCurrentPlace = async (req, res) => {
    try {
        // Начинаем транзакцию
        await db_1.default.begin(async (sql) => {
            const { place } = req.body;
            // Получаем текущую запись с блокировкой для обновления
            const current = await sql `
        SELECT place FROM currentplace LIMIT 1 FOR UPDATE
      `;
            const placeToUpdate = place ?? 1;
            let result;
            if (current.length === 0) {
                // Если записей нет — создаём новую
                result = await sql `
          INSERT INTO currentplace (place)
          VALUES (${placeToUpdate})
          RETURNING place
        `;
            }
            else {
                // Иначе — обновляем существующую
                result = await sql `
          UPDATE currentplace
          SET place = ${placeToUpdate}
          WHERE ctid IN (
            SELECT ctid FROM currentplace LIMIT 1
          )
          RETURNING place
        `;
            }
            res.json({ place: result[0].place });
        });
    }
    catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            error: 'Database error',
            details: error instanceof Error ? error.message : String(error),
        });
    }
};
exports.updateCurrentPlace = updateCurrentPlace;
