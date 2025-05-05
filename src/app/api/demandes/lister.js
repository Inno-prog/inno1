// ... (import et début du handler restent identiques)
import pool from '@/lib/db';

let query = 'SELECT id, nom_etudiant, prenom_etudiant, email, etablissement, filiere, ';
query += 'date_debut, date_fin, statut FROM demandes_stage';
let params = [];

if (statut) {
  query += ' WHERE statut = ?';
  params.push(statut);
}

query += ' ORDER BY date_demande DESC LIMIT ? OFFSET ?';
params.push(parseInt(limit), parseInt(offset));

const connection = await pool.getConnection();
const [] = await connection.query(query, params);

// Compte total pour la pagination
let countQuery = 'SELECT COUNT(*) as total FROM demandes_stage';
if (statut) {
  countQuery += ' WHERE statut = ?';
}
const [] = await connection.query(countQuery, statut ? [statut] : []);

// ... (le reste du fichier reste identique)