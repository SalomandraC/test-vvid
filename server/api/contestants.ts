// server/api/contestants.ts
import { Request, Response } from 'express';
import sql from '../config/db';

interface Contestant {
  queue: number;
  fio: string;
  organization: string;
  participation: string;
  direction: string;
  theme_of_perfomance: string;
}

interface NewContestant {
  organization_name: string;
  participation: boolean;
  direction_name: string;
  theme_of_perfomance: string;
}

export const getContestants = async (req: Request, res: Response) => {
  try {
    const rows = await sql<Contestant[]>`
      SELECT 
        c.ui_queue as queue,
        CONCAT(a.lastname, ' ', a.firstname, ' ', a.middlename) as fio,
        o.ui_organization_name as organization,
        CASE WHEN c.participation THEN 'Очное' ELSE 'Заочное' END as participation,
        d.ui_direction_name as direction,
        c.theme_of_perfomance
      FROM contestant c
      JOIN accounts a ON c.account_id = a.pk_accounts_id
      JOIN organization o ON c.organization_id = o.pk_organization_id
      JOIN direction d ON c.direction_id = d.pk_direction_id
      ORDER BY c.ui_queue
    `;
    
    res.json(rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAllContestants = async (req: Request, res: Response) => {
  try {
    await sql`DELETE FROM contestant`;
    
    res.json({ message: 'Все участники успешно удалены' });
  } catch (error) {
    console.error('Error deleting contestants:', error);
    res.status(500).json({ error: 'Ошибка при удалении участников' });
  }
};

export const addContestant = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const { organization_name, direction_name, theme_of_perfomance } = req.body;
    const participation = req.body.participation !== false; 
    if (!organization_name || !direction_name || !theme_of_perfomance) {
      return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля' });
    }
    const organizationResult = await sql`
      INSERT INTO organization (ui_organization_name)
      VALUES (${organization_name})
      ON CONFLICT (ui_organization_name) DO UPDATE
      SET ui_organization_name = EXCLUDED.ui_organization_name
      RETURNING pk_organization_id
    `;
    const organizationId = organizationResult[0].pk_organization_id;
    const directionResult = await sql`
      SELECT pk_direction_id FROM direction
      WHERE ui_direction_name = ${direction_name}
    `;
    if (directionResult.length === 0) {
      return res.status(404).json({ error: 'Указанное направление не найдено' });
    }
    const maxQueueResult = await sql<{ max_queue: number }[]>`
      SELECT MAX(ui_queue) as max_queue FROM contestant
    `;

    const maxQueue = maxQueueResult[0]?.max_queue || 0;
    const newQueue = maxQueue + 1;
    const directionId = directionResult[0].pk_direction_id;
    const ui_queue = newQueue;
    const contestantResult = await sql`
      INSERT INTO contestant (
        account_id,
        organization_id,
        direction_id,
        participation,
        theme_of_perfomance,
        ui_queue,
        created_at
      ) VALUES (
        ${req.session.userId},
        ${organizationId},
        ${directionId},
        ${participation},
        ${theme_of_perfomance},
        ${ui_queue},
        NOW()
      )
      RETURNING pk_contestant_id
    `;
    res.status(201).json({
      message: 'Участник успешно добавлен',
      contestant_id: contestantResult[0].pk_contestant_id
    });

  } catch (error) {
    console.error('Ошибка добавления участника:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};