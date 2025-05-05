import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// This would be replaced with a proper database in production
let demandes: any[] = [];

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

    // Create a new demande record
    const id = uuidv4();
    const date_soumission = new Date().toISOString();
    
    const demande = {
      id,
      nom_etudiant,
      prenom_etudiant,
      email,
      telephone,
      etablissement,
      filiere,
      niveau_etude,
      date_debut,
      date_fin,
      date_soumission,
      statut,
      reference: `STG-${id.slice(0, 8)}`,
      ...fileUrls
    };
    
    // In a real app, you would save to a database
    demandes.push(demande);
    
    return NextResponse.json({ 
      success: true,
      message: statut === 'soumise' ? 'Demande soumise avec succès' : 'Brouillon enregistré',
      demande
    });
    
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du traitement de la demande' 
    }, { status: 500 });
  }
}