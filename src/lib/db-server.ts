import mysql from 'mysql2/promise';
import type { ResultSetHeader, RowDataPacket, FieldPacket } from 'mysql2/promise';

// 1. Configuration de la connexion
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'stage',
  password: process.env.DB_PASSWORD || 'stage',
  database: process.env.DB_NAME || 'gestion_stages',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 2. Fonctions de base pour les requêtes
const executeQuery = async (
  sql: string,
  params: any[] = []
): Promise<[RowDataPacket[], FieldPacket[]]> => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(sql, params);
    return [rows, []];
  } finally {
    connection.release();
  }
};

const select = async (
  sql: string,
  params: any[] = []
): Promise<RowDataPacket[]> => {
  const [rows] = await executeQuery(sql, params);
  return rows;
};

const modify = async (
  sql: string,
  params: any[] = []
): Promise<ResultSetHeader> => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query<ResultSetHeader>(sql, params);
    return result;
  } finally {
    connection.release();
  }
};

// 3. Fonction d'initialisation
const initializeDb = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('✅ Connexion DB réussie!');
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de la DB:', err);
    throw err;
  }
};

export { pool, executeQuery, select, modify, initializeDb };
