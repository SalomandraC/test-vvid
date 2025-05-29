"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreviewData = exports.getPreviewData = void 0;
const db_1 = __importDefault(require("../config/db"));
const getPreviewData = async (req, res) => {
    try {
        const rows = await (0, db_1.default) `
      SELECT title, description FROM previewdata LIMIT 1
    `;
        if (rows.length === 0) {
            const [newRow] = await (0, db_1.default) `
        INSERT INTO previewdata (title, description)
        VALUES (${'Default Title'}, ${'Default Description'})
        RETURNING title, description
      `;
            return res.json(newRow);
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
const updatePreviewData = async (req, res) => {
    try {
        const { title, description } = req.body;
        // Валидация входных данных
        if (!title && !description) {
            return res.status(400).json({ error: 'Title or description required' });
        }
        await db_1.default.begin(async (sql) => {
            const [current] = await sql `
        SELECT title, description FROM previewdata LIMIT 1 FOR UPDATE
      `;
            const newTitle = title ?? current?.title ?? 'Default Title';
            const newDescription = description ?? current?.description ?? 'Default Description';
            if (!current) {
                const [result] = await sql `
          INSERT INTO previewdata (title, description)
          VALUES (${newTitle}, ${newDescription})
          RETURNING title, description
        `;
                return res.json(result);
            }
            const [result] = await sql `
        UPDATE previewdata
        SET title = ${newTitle}, description = ${newDescription}
        WHERE ctid IN (
          SELECT ctid FROM previewdata LIMIT 1
        )
        RETURNING title, description
      `;
            res.json(result);
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
