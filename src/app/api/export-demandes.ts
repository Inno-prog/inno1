// pages/api/export-demandes.ts
import * as db from '@/lib/db'
import type { DemandeStage } from '@/lib/db';
import { utils, write } from 'xlsx'  // Changed from writeFile to write
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const demandes = await db.getDemandesStage()
    
    const data = demandes.map((d: DemandeStage) => ({
      'ID': d.id,
      'Nom': d.nom_etudiant,
      'Prénom': d.prenom_etudiant,
      'Email': d.email,
      'Téléphone': d.telephone,
      'Établissement': d.etablissement,
      'Filière': d.filiere,
      'Niveau': d.niveau_etude,
      'Date début': d.date_debut,
      'Date fin': d.date_fin,
      'Statut': d.statut,
      'Date demande': d.date_demande,
      'Notes': d.notes
    }))

    const ws = utils.json_to_sheet(data)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Demandes')
    const buf = write(wb, { type: 'buffer' })  // Using write instead of writeFile
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=demandes_stage.xlsx')
    res.send(buf)
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: 'Erreur lors de l\'export' })
  }
}