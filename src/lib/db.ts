import type { RowDataPacket } from 'mysql2/promise';

export { RowDataPacket };

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "stage",
  password: process.env.DB_PASSWORD || "stage",
  database: process.env.DB_NAME || "gestion_stages",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Get a MySQL connection from the pool
 */
export async function createConnection() {
  return pool.getConnection();
}

// Types et interfaces
export type StatutDemande = 'brouillon' | 'en_attente' | 'acceptee' | 'refusee';

export interface DemandeStage extends RowDataPacket {
  id: number;
  stagiaire_id: number;
  nom_etudiant: string;
  prenom_etudiant: string;
  email: string;
  telephone: string;
  etablissement: string;
  filiere: string;
  niveau_etude: string;
  date_debut: Date | string;
  date_fin: Date | string;
  statut: StatutDemande;
  cv_path: string;
  cnib_path: string;
  lettre_path: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  service_id: number | null; // Ajout du champ service_id
}

export interface Service extends RowDataPacket {
  id: number;
  nom: string;
  created_at: Date;
  updated_at: Date;
}

// Fonctions CRUD pour les services
export async function getAllServices(): Promise<Service[]> {
  const [rows] = await pool.query('SELECT * FROM services ORDER BY nom ASC');
  return rows as Service[];
}

export async function getServiceById(id: number): Promise<Service | null> {
  const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
  return (rows as Service[])[0] || null;
}

export async function createService(nom: string): Promise<number> {
  const [result]: any = await pool.query('INSERT INTO services (nom) VALUES (?)', [nom]);
  return result.insertId;
}

export async function updateService(id: number, nom: string): Promise<void> {
  await pool.query('UPDATE services SET nom = ? WHERE id = ?', [nom, id]);
}

export async function deleteService(id: number): Promise<void> {
  await pool.query('DELETE FROM services WHERE id = ?', [id]);
}

export interface CountResult {
  total: number;
}

export type CreationDemande = Omit<DemandeStage, 'id' | 'created_at' | 'updated_at'>;
export type UpdateDemande = Partial<Omit<CreationDemande, 'stagiaire_id'>>;

export interface DemandesRepository {
  create: (demande: CreationDemande) => Promise<number>;
}

// Fonction pour récupérer toutes les demandes de stage
export async function getDemandesStage(): Promise<DemandeStage[]> {
  const [rows] = await pool.query('SELECT * FROM demandes_stage WHERE statut = "acceptee"', []);
  return rows as DemandeStage[];
}

// Ajout des fonctions manquantes utilisées dans update/route.ts
export async function getDemandeById(id: number): Promise<DemandeStage | null> {
  const [rows] = await pool.query('SELECT * FROM demandes_stage WHERE id = ?', [id]);
  return (rows as DemandeStage[])[0] || null;
}

export async function updateDemandeStatus(id: number, statut: StatutDemande, notes?: string): Promise<void> {
  await pool.query('UPDATE demandes_stage SET statut = ? WHERE id = ?', [statut, id]);
}

