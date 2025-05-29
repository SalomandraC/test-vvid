import { Request, Response } from 'express';
import sql from '../config/db';

interface IPreviewData {
  title: string;
  description: string;
}

export const getPreviewData = async (req: Request, res: Response) => {
  try {
    const rows = await sql<IPreviewData[]>`
      SELECT title, description FROM previewdata LIMIT 1
    `;

    if (rows.length === 0) {
      const [newRow] = await sql<IPreviewData[]>`
        INSERT INTO previewdata (title, description)
        VALUES (${'Default Title'}, ${'Default Description'})
        RETURNING title, description
      `;
      return res.json(newRow);
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Database error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updatePreviewData = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    
    // Валидация входных данных
    if (!title && !description) {
      return res.status(400).json({ error: 'Title or description required' });
    }

    await sql.begin(async (sql) => {
      const [current] = await sql<IPreviewData[]>`
        SELECT title, description FROM previewdata LIMIT 1 FOR UPDATE
      `;

      const newTitle = title ?? current?.title ?? 'Default Title';
      const newDescription = description ?? current?.description ?? 'Default Description';

      if (!current) {
        const [result] = await sql<IPreviewData[]>`
          INSERT INTO previewdata (title, description)
          VALUES (${newTitle}, ${newDescription})
          RETURNING title, description
        `;
        return res.json(result);
      }

      const [result] = await sql<IPreviewData[]>`
        UPDATE previewdata
        SET title = ${newTitle}, description = ${newDescription}
        WHERE ctid IN (
          SELECT ctid FROM previewdata LIMIT 1
        )
        RETURNING title, description
      `;

      res.json(result);
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      error: 'Database error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};