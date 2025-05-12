import type { NextApiRequest, NextApiResponse } from 'next'
import { createTransport } from 'nodemailer'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
}

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Début du logging
  console.log('\n=== NOUVELLE REQUÊTE REÇUE ===')
  console.log('Méthode:', req.method)
  console.log('Date:', new Date().toISOString())

  if (req.method !== 'POST') {
    console.log('Erreur: Méthode non autorisée')
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  // Vérification initiale du body
  if (!req.body || typeof req.body !== 'object') {
    console.log('Erreur: Body de requête invalide')
    return res.status(400).json({ error: 'Données de requête invalides' })
  }

  const { to, subject, text, html } = req.body
  console.log('Destinataire:', to)
  console.log('Sujet:', subject)

  // Validation des champs
  if (!to || typeof to !== 'string' || !validateEmail(to)) {
    console.log('Erreur: Destinataire invalide')
    return res.status(400).json({ error: 'Destinataire (to) invalide' })
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    console.log('Erreur: Sujet invalide')
    return res.status(400).json({ error: 'Sujet (subject) invalide' })
  }

  if ((!text || typeof text !== 'string') && (!html || typeof html !== 'string')) {
    console.log('Erreur: Contenu de mail manquant')
    return res.status(400).json({ error: 'Contenu du mail (text ou html) requis' })
  }

  // Vérification de la configuration SMTP
  // Supporte EMAIL_USER/EMAIL_PASSWORD ou SMTP_USER/SMTP_PASS
  const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const smtpPass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
  const smtpFrom = process.env.EMAIL_FROM || smtpUser;

  // FORCE le mode Ethereal pour tous les envois (test uniquement)
  console.warn('[ETHEREAL MODE FORCED] Tous les emails sont envoyés via le mode test Nodemailer/Ethereal. Aucune variable SMTP n\'est utilisée.');
  const testAccount = await require('nodemailer').createTestAccount();
  const transporter = createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  (transporter as any)._isEthereal = true;

  try {
    console.log('Tentative d\'envoi du mail...')
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: subject.trim(),
      text: text?.trim() || undefined,
      html: html?.trim() || undefined,
    })

    console.log('=== MAIL ENVOYÉ AVEC SUCCÈS ===')
    console.log('Message ID:', info.messageId)
    console.log('Réponse SMTP:', info.response)
    console.log('Accepté par serveur:', info.accepted)
    console.log('Rejeté par serveur:', info.rejected)

    // Affiche le lien Ethereal si utilisé
    if (transporter && (transporter as any)._isEthereal) {
      const nodemailer = require('nodemailer');
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('[ETHEREAL PREVIEW URL]:', previewUrl);
    }
    return res.status(200).json({ 
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    })
  } catch (error) {
    console.error('\n=== ERREUR D\'ENVOI ===')
    console.error('Date:', new Date().toISOString())
    console.error('Erreur complète:', error)
    
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }

    return res.status(500).json({ 
      error: 'Échec de l\'envoi du mail',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    })
  }
}