import { Request, Response } from 'express';
import sql from '../config/db'; 

/**
 * Получает текущее значение year_data из таблицы importantdata.
 * Если таблицы или записи нет — создаёт запись со значением 2025.
 */
export const getImportantData = async (req: Request, res: Response) => {
  try {
    
    // Получаем текущее значение year_data
    const rows = await sql<{ year_data: number }[]>`
      SELECT year_data FROM importantdata LIMIT 1
    `;

    if (rows.length === 0) {
      const newRows = await sql<{ year_data: number }[]>`
        INSERT INTO importantdata (year_data)
        VALUES (2025)
        RETURNING year_data
      `;
      return res.json({ year_data: newRows[0].year_data });
    }

    res.json({ year_data: rows[0].year_data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Database error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Обновляет значение year_data в таблице importantdata.
 * Поддерживает транзакции.
 */
export const updateImportantData = async (req: Request, res: Response) => {
  try {
    const { year_data } = req.body;
    
    // Валидация входных данных
    if (year_data === undefined || year_data === null) {
      return res.status(400).json({ error: 'year_data is required' });
    }

    const yearNumber = Number(year_data);
    if (isNaN(yearNumber)) {
      return res.status(400).json({ error: 'year_data must be a number' });
    }

    await sql.begin(async (sql) => {
      // Получаем текущую запись с блокировкой
      const [current] = await sql`
        SELECT year_data FROM importantdata LIMIT 1 FOR UPDATE
      `;

      let result;
      
      if (!current) {
        // Создаем новую запись
        result = await sql`
          INSERT INTO importantdata (year_data)
          VALUES (${yearNumber})
          RETURNING year_data
        `;
      } else {
        // Обновляем существующую
        result = await sql`
          UPDATE importantdata
          SET year_data = ${yearNumber}
          WHERE ctid IN (
            SELECT ctid FROM importantdata LIMIT 1
          )
          RETURNING year_data
        `;
      }

      res.json({ year_data: result[0].year_data });
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      error: 'Database error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};