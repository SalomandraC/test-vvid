import { Request, Response } from 'express';
import sql from '../config/db'; 

/**
 * Получает текущее значение place из таблицы currentplace.
 * Если таблицы или записи нет — создаёт запись со значением 1.
 */
export const getCurrentPlace = async (req: Request, res: Response) => {
  try {
    // Получаем текущее место
    const rows = await sql<{ place: number }[]>`
      SELECT place FROM currentplace LIMIT 1
    `;

    if (rows.length === 0) {
      const newRows = await sql<{ place: number }[]>`
        INSERT INTO currentplace (place)
        VALUES (1)
        RETURNING place
      `;
      return res.json({ place: newRows[0].place });
    }

    res.json({ place: rows[0].place });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Database error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Обновляет значение place в таблице currentplace.
 * Поддерживает транзакции.
 */
export const updateCurrentPlace = async (req: Request, res: Response) => {
  try {
    // Начинаем транзакцию
    await sql.begin(async (sql) => {

      const { place } = req.body;

      // Получаем текущую запись с блокировкой для обновления
      const current = await sql<{ place: number }[]>`
        SELECT place FROM currentplace LIMIT 1 FOR UPDATE
      `;

      const placeToUpdate = place ?? 1;

      let result;

      if (current.length === 0) {
        // Если записей нет — создаём новую
        result = await sql<{ place: number }[]>`
          INSERT INTO currentplace (place)
          VALUES (${placeToUpdate})
          RETURNING place
        `;
      } else {
        // Иначе — обновляем существующую
        result = await sql<{ place: number }[]>`
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
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      error: 'Database error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};