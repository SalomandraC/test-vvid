"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContestants = void 0;
const db_1 = __importDefault(require("../config/db"));
const getContestants = async (req, res) => {
    try {
        const rows = await (0, db_1.default) `
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
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getContestants = getContestants;
