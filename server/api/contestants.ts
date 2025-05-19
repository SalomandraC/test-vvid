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