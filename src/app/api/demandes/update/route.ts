import { NextResponse } from 'next/server';
import { updateDemandeStatus, getDemandeById } from '../../../../lib/db';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    // Récupérer les données de la requête
    const body = await request.json();
    const { id, statut, notes, sendEmail = false } = body;

    // Vérifier que les champs requis sont présents
    if (!id || !statut) {
      return NextResponse.json(
        { error: "L'ID et le statut sont obligatoires" },
        { status: 400 }
      );
    }

    // Vérifier que le statut est valide
    if (statut !== 'acceptee' && statut !== 'refusee' && statut !== 'en_attente') {
      return NextResponse.json(
        { error: "Le statut doit être 'acceptee', 'refusee' ou 'en_attente'" },
        { status: 400 }
      );
    }

    // Mettre à jour le statut de la demande
    await updateDemandeStatus(id, statut as 'acceptee' | 'refusee', notes);
    
    console.log(`✅ Demande #${id} mise à jour avec le statut: ${statut}`);
    
    // Récupérer la demande mise à jour
    const demande = await getDemandeById(id);
    
    // Envoyer un email de notification si demandé
    if (sendEmail && demande && demande.email) {
      await envoyerEmailNotification(demande, statut, notes);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Demande mise à jour avec succès${sendEmail ? ' et notification envoyée' : ''}`, 
      demande 
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la demande:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la demande" },
      { status: 500 }
    );
  }
}

// Fonction pour envoyer un email de notification
async function envoyerEmailNotification(demande: any, statut: string, notes?: string) {
  // Configurer le transporteur d'email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Préparer le sujet et le contenu en fonction du statut
  let sujet = 'Mise à jour de votre demande de stage';
  let contenuHtml = `
    <h1>Mise à jour de votre demande de stage</h1>
    <p>Bonjour ${demande.prenom_etudiant} ${demande.nom_etudiant},</p>
  `;

  if (statut === 'acceptee') {
    sujet = 'Bonne nouvelle ! Votre demande de stage a été acceptée';
    contenuHtml += `
      <p>Nous sommes heureux de vous informer que votre demande de stage a été <strong>acceptée</strong>.</p>
      <p>Période de stage : du ${demande.date_debut} au ${demande.date_fin}</p>
    `;
  } else if (statut === 'refusee') {
    sujet = 'Réponse concernant votre demande de stage';
    contenuHtml += `
      <p>Nous regrettons de vous informer que votre demande de stage a été <strong>refusée</strong>.</p>
    `;
  } else {
    contenuHtml += `
      <p>Le statut de votre demande a été mis à jour à : <strong>${statut}</strong>.</p>
    `;
  }

  if (notes) {
    contenuHtml += `
      <p>Commentaires : ${notes}</p>
    `;
  }

  contenuHtml += `
    <p>Pour toute question, n'hésitez pas à nous contacter.</p>
    <p>Cordialement,<br>L'équipe des stages</p>
  `;

  // Configurer les options d'email
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: demande.email,
    subject: sujet,
    html: contenuHtml,
  };

  // Envoyer l'email
  const info = await transporter.sendMail(mailOptions);
  console.log('✅ Email de notification envoyé:', info.messageId);
  
  return info;
}