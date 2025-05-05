import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import path from 'path';

// Charge explicitement le fichier .env
config({ path: path.resolve(process.cwd(), '.env') });

// Debug - Affiche les variables chargées
console.log('Configuration DB:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'stage',
  password: process.env.DB_PASSWORD || 'stage',
  database: process.env.DB_NAME || 'gestion_stages',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de connexion immédiat
pool.getConnection()
  .then(conn => {
    console.log('✅ Connexion DB réussie!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion DB:', err);
  });

// Fonction pour récupérer toutes les demandes de stage
async function getDemandesStage() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        id, 
        nom_etudiant, 
        prenom_etudiant, 
        email,
        telephone,
        etablissement, 
        filiere,
        niveau_etude,
        DATE_FORMAT(date_debut, '%d/%m/%Y') as date_debut,
        DATE_FORMAT(date_fin, '%d/%m/%Y') as date_fin,
        statut,
        DATE_FORMAT(date_demande, '%d/%m/%Y %H:%i') as date_demande,
        notes,
        cv_path,
        cnib_path,
        lettre_path
      FROM demandes_stage
      ORDER BY date_demande DESC
    `);
    connection.release();
    return rows;
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    throw error;
  }
}

// Fonction pour récupérer une demande par son ID
async function getDemandeById(id) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        id, 
        nom_etudiant, 
        prenom_etudiant, 
        email,
        telephone,
        etablissement, 
        filiere,
        niveau_etude,
        DATE_FORMAT(date_debut, '%d/%m/%Y') as date_debut,
        DATE_FORMAT(date_fin, '%d/%m/%Y') as date_fin,
        statut,
        DATE_FORMAT(date_demande, '%d/%m/%Y %H:%i') as date_demande,
        notes,
        cv_path,
        cnib_path,
        lettre_path
      FROM demandes_stage
      WHERE id = ?
    `, [id]);
    connection.release();
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la demande:', error);
    throw error;
  }
}

// Fonction pour mettre à jour le statut d'une demande
async function updateDemandeStatus(id, statut, notes) {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      UPDATE demandes_stage 
      SET statut = ?, notes = ?
      WHERE id = ?
    `, [statut, notes || null, id]);
    connection.release();
    console.log(`Demande #${id} mise à jour avec le statut: ${statut}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la demande:', error);
    throw error;
  }
}

// Exporter toutes les fonctions
const db = {
  pool,
  getDemandesStage,
  getDemandeById,
  updateDemandeStatus
};

export default db;