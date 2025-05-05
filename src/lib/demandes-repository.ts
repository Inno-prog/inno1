import { pool, modify, select } from './db-server';
import { CreationDemande, RowDataPacket } from './db';

export const DemandesRepository = {
  async create(demande: CreationDemande): Promise<number> {
    const result = await modify('INSERT INTO demandes_stage SET ?', [demande]);
    return result.insertId;
  },

  async findAllByUser(userId: number): Promise<RowDataPacket[]> {
    const rows = await select('SELECT * FROM demandes_stage WHERE stagiaire_id = ?', [userId]);
    return rows;
  }
};
