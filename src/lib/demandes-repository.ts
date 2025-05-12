import { pool, modify, select } from './db-server';
import { CreationDemande, RowDataPacket } from './db';

export const DemandesRepository = {
  async create(demande: CreationDemande): Promise<number> {
    const result = await modify('INSERT INTO demandes_stage SET ?', [demande]);
    return result.insertId;
  },

  async findAllByUser(userId: number): Promise<RowDataPacket[]> {
    // La colonne stagiaire_id n'existe pas, donc on retourne toutes les demandes pour l'instant
    const rows = await select('SELECT * FROM demandes_stage WHERE user_id = ?', [userId]);
    return rows;
  }
};
