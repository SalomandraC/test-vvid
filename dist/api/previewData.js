"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreviewData = exports.getPreviewData = void 0;
const db_1 = __importDefault(require("../config/db")); // ✅ Используем sql вместо Pool
/**
 * Получает текущие данные из таблицы previewdata.
 * Если таблицы или записи нет — создаёт запись со значениями по умолчанию.
 */
const getPreviewData = async (req, res) => {
    try {
        // Получаем текущую запись
        const rows = await (0, db_1.default) `
      SELECT title, description FROM previewdata LIMIT 1
    `;
        if (rows.length === 0) {
            // Если записей нет — создаём новую
            await (0, db_1.default) `
        INSERT INTO previewdata (title, description)
        VALUES ('Default Title', 'Default Description')
      `;
            return res.json({ title: 'Default Title', description: 'Default Description' });
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Database error',
            details: error instanceof Error ? error.message : String(error),
        });
    }
};
exports.getPreviewData = getPreviewData;
/**
 * Обновляет данные в таблице previewdata.
 * Поддерживает транзакции.
 */
const updatePreviewData = async (req, res) => {
    try {
        await db_1.default.begin(async (sql) => {
            const { title, description } = req.body;
            // Получаем текущую запись с блокировкой
            const currentData = await sql `
        SELECT title, description FROM previewdata LIMIT 1 FOR UPDATE
      `;
            if (currentData.length === 0) {
                // Если записей нет — создаём новую
                const newTitle = title ?? 'Default Title';
                const newDescription = description ?? 'Default Description';
                const result = await sql `
          INSERT INTO previewdata (title, description)
          VALUES (${newTitle}, ${newDescription})
          RETURNING title, description
        `;
                return res.json(result[0]);
            }
            // Обновляем существующую запись
            const newTitle = title !== undefined ? title : currentData[0].title;
            const newDescription = description !== undefined ? description : currentData[0].description;
            const result = await sql `
        UPDATE previewdata
        SET title = ${newTitle}, description = ${newDescription}
        WHERE ctid IN (
          SELECT ctid FROM previewdata LIMIT 1
        )
        RETURNING title, description
      `;
            res.json(result[0]);
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
exports.updatePreviewData = updatePreviewData;
