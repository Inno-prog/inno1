import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// This would be replaced with a proper database in production
import { DemandesRepository } from '@/lib/demandes-repository';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    
    // Extract form fields
    const nom_etudiant = formData.get('nom_etudiant') as string;
    const prenom_etudiant = formData.get('prenom_etudiant') as string;
    const email = formData.get('email') as string;
    const telephone = formData.get('telephone') as string;
    const etablissement = formData.get('etablissement') as string;
    const filiere = formData.get('filiere') as string;
    const niveau_etude = formData.get('niveau_etude') as string;
    const date_debut = formData.get('date_debut') as string;
    const date_fin = formData.get('date_fin') as string;
    const statut = formData.get('statut') as 'soumise' | 'non soumise';

    // Validate required fields
    if (!nom_etudiant || !prenom_etudiant || !email || !telephone || 
        !etablissement || !filiere || !niveau_etude || 
        !date_debut || !date_fin || !statut) {
      return NextResponse.json({ message: 'Tous les champs sont obligatoires' }, { status: 400 });
    }

    // Validate dates
    const startDate = new Date(date_debut);
    const endDate = new Date(date_fin);
    
    if (startDate >= endDate) {
      return NextResponse.json({ 
        message: 'La date de début doit être antérieure à la date de fin' 
      }, { status: 400 });
    }

    // Process file uploads
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Ensure upload directory exists
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    
    // Handle file uploads
    const fileFields = ['cv', 'cnib', 'lettre'];
    const fileUrls: Record<string, string> = {};
    
    for (const field of fileFields) {
      const file = formData.get(field) as File;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${field}-${uuidv4()}.${fileExt}`;
        const filePath = path.join(uploadDir, fileName);
        
        // In production, you'd use a proper file storage service
        // For this example, we'll simulate successful file upload
        fileUrls[field] = `/uploads/${fileName}`;
      }
    }

    // Récupère la session utilisateur
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }
    // Create a new demande record
    const id = uuidv4();
    const now = new Date();
    const date_soumission = now.toISOString().slice(0, 19).replace('T', ' ');
    
    // Adapter la valeur du statut pour l'ENUM MySQL
    let statut_sql: string = statut as string;
    if (statut === 'soumise') {
      statut_sql = 'en_attente';
    }

    // Calcul de la durée du stage (en jours)
    let duree_stage = 1;
    if (date_debut && date_fin) {
      const d1 = new Date(date_debut);
      const d2 = new Date(date_fin);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0) duree_stage = diff;
    }

    // Construction de l'objet pour l'insertion (champs obligatoires + optionnels si présents)
    const demande: Record<string, any> = {
      user_id: Number(session.user.id),
      nom_etudiant,
      prenom_etudiant,
      email,
      telephone,
      filiere, // correspondance directe avec la colonne existante
      duree_stage, // OBLIGATOIRE
      date_debut,
      cv_path: fileUrls.cv || '', // OBLIGATOIRE
      lettre_motivation_path: fileUrls.lettre || '', // OBLIGATOIRE
      statut: statut_sql
    };
    // Champs optionnels
    if (etablissement) demande.etablissement = etablissement;
    if (filiere) demande.filiere = filiere;
    if (niveau_etude) demande.niveau_etude = niveau_etude;
    if (date_fin) demande.date_fin = date_fin;
    if (date_soumission) demande.date_soumission = date_soumission;
    demande.reference = `STG-${id.slice(0, 8)}`;
    if (fileUrls.cnib) demande.cnib = fileUrls.cnib;
    if (fileUrls.lettre) demande.lettre = fileUrls.lettre;


    
    // Enregistrer dans la base MySQL
    const insertedId = await DemandesRepository.create(demande);
    
    return NextResponse.json({ 
      success: true,
      message: statut === 'soumise' ? 'Demande soumise avec succès' : 'Brouillon enregistré',
      id: insertedId,
      demande: { ...demande, id: insertedId }
    });
    
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du traitement de la demande' 
    }, { status: 500 });
  }
}