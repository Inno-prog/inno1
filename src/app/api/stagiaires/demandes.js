import { createPool } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  try {
    // En production, vous devriez vérifier l'utilisateur connecté
    const stagiaireId = 1 // Remplacer par l'ID du stagiaire connecté
    
    const pool = createPool()
    const [rows] = await pool.query(
      'SELECT * FROM demandes_stagiaire WHERE stagiaire_id = ? ORDER BY created_at DESC',
      [stagiaireId]
    )
    
    res.status(200).json(rows)
  } catch (error) {
    console.error('Erreur:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}