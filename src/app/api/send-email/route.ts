import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    // Récupérer les données de la requête
    const body = await request.json();
    const { to, subject, html, text } = body;

    // Vérifier que les champs requis sont présents
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: "Les champs destinataire, sujet et contenu sont obligatoires" },
        { status: 400 }
      );
    }

    // Détection des variables SMTP
    const smtpUser = process.env.EMAIL_USER;
    const smtpPass = process.env.EMAIL_PASSWORD;
    let transporter;
    let isEthereal = false;

    if (!smtpUser || !smtpPass) {
      // Mode test Ethereal
      console.warn('[ETHEREAL MODE ACTIVATED] Aucune configuration SMTP trouvée, utilisation du mode test Nodemailer/Ethereal. Les emails ne seront pas réellement envoyés !');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isEthereal = true;
    } else {
      // Mode SMTP réel
      console.log('Configuration SMTP trouvée');
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }

    // Configurer les options d'email
    const mailOptions = {
      from: process.env.EMAIL_FROM || smtpUser || 'no-reply@example.com',
      to,
      subject,
      text,
      html,
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé:', info.messageId);
    if (isEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('[ETHEREAL PREVIEW URL]:', previewUrl);
    }

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}