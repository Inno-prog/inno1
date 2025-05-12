import fs from 'fs'
import path from 'path'
import { IncomingForm } from 'formidable'
import db from '../../../lib/db'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const form = new IncomingForm({
    keepExtensions: true,
    uploadDir: path.join(process.cwd(), '/public/uploads'),
  })

  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir, { recursive: true })
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erreur parsing:', err)
      return res.status(500).json({ message: 'Erreur lors de l’analyse du formulaire' })
    }

    try {
      const {
        nom_etudiant,
        prenom_etudiant,
        email,
        telephone,
        etablissement,
        filiere,
        niveau_etude,
        date_debut,
        date_fin,
        statut
      } = fields

      const cv_path = files.cv?.[0]?.newFilename || null
      const cnib_path = files.cnib?.[0]?.newFilename || null
      const lettre_path = files.lettre?.[0]?.newFilename || null

      const query = `
        INSERT INTO demandes_stage (
          nom_etudiant, prenom_etudiant, email, telephone,
          etablissement, filiere, niveau_etude, date_debut, date_fin,
          statut, cv_path, cnib_path, lettre_path, date_demande
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `

      const values = [
        nom_etudiant?.[0],
        prenom_etudiant?.[0],
        email?.[0],
        telephone?.[0] || null,
        etablissement?.[0],
        filiere?.[0],
        niveau_etude?.[0],
        date_debut?.[0],
        date_fin?.[0],
        statut?.[0] || 'non soumise',
        `/uploads/${cv_path}`,
        `/uploads/${cnib_path}`,
        lettre_path ? `/uploads/${lettre_path}` : null,
      ]

      const [result] = await db.execute(query, values)

      res.status(200).json({
        message: 'Demande enregistrée avec succès',
        demande: {
          id: result.insertId,
          nom: nom_etudiant?.[0],
          prenom: prenom_etudiant?.[0],
          statut: statut?.[0] || 'non soumise',
        }
      })
    } catch (error) {
      console.error('Erreur insertion BDD:', error)
      res.status(500).json({ message: 'Erreur lors de l’insertion en base' })
    }
  })
}
