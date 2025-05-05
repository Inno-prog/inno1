import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import mysql from 'mysql2/promise';

// Type pour les données de la demande
type DemandeStage = {
  nom_etudiant: string;
  prenom_etudiant: string;
  email: string;
  telephone: string;
  etablissement?: string;
  filiere?: string;
  niveau_etude?: string;
  date_debut?: string;
  date_fin?: string;
};

// Type pour la réponse d'erreur
type ApiError = {
  error: string;
  details?: string;
  status?: number;
};

// Création d'une connexion à la base de données
const createDbConnection = async () => {
  const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "stage",
    password: process.env.DB_PASSWORD || "stage",
    database: process.env.DB_NAME || "gestion_stages",
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion DB réussie!');
    return connection;
  } catch (err) {
    console.error('❌ Erreur connexion DB:', err);
    throw err;
  }
};

// ✅ Méthode GET - Liste des demandes
export async function GET() {
  let connection;

  try {
    connection = await createDbConnection();

    const [rows] = await connection.query('SELECT * FROM demandes_stage ORDER BY date_demande DESC');

    await connection.end();

    return NextResponse.json({
      success: true,
      data: rows
    }, { status: 200 });

  } catch (error: any) {
    if (connection) await connection.end().catch(() => {});

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des demandes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// ✅ Méthode POST - Enregistrement d'une demande
export async function POST(request: Request) {
  let connection;

  try {
    const formData = await request.formData();

    const getRequiredField = (field: string): string => {
      const value = formData.get(field);
      if (!value || typeof value !== 'string') {
        throw { error: `Champ ${field} manquant ou invalide`, status: 400 };
      }
      return value;
    };

    const demande: DemandeStage = {
      nom_etudiant: getRequiredField('nom_etudiant'),
      prenom_etudiant: getRequiredField('prenom_etudiant'),
      email: getRequiredField('email'),
      telephone: getRequiredField('telephone'),
      etablissement: formData.get('etablissement')?.toString(),
      filiere: formData.get('filiere')?.toString(),
      niveau_etude: formData.get('niveau_etude')?.toString(),
      date_debut: formData.get('date_debut')?.toString(),
      date_fin: formData.get('date_fin')?.toString(),
    };

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const saveFile = async (file: File | null): Promise<string | null> => {
      if (!file) return null;
      const buffer = await file.arrayBuffer();
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      await fs.writeFile(path.join(uploadDir, filename), Buffer.from(buffer));
      return filename;
    };

    const [cv, cnib, lettre] = await Promise.all([
      saveFile(formData.get('cv') as File | null),
      saveFile(formData.get('cnib') as File | null),
      saveFile(formData.get('lettre') as File | null),
    ]);

    connection = await createDbConnection();

    const [result] = await connection.query(
      `INSERT INTO demandes_stage 
       (nom_etudiant, prenom_etudiant, email, telephone, etablissement, filiere, niveau_etude, date_debut, date_fin, statut, cv_path, cnib_path, lettre_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'en_attente', ?, ?, ?)`,
      [
        demande.nom_etudiant,
        demande.prenom_etudiant,
        demande.email,
        demande.telephone,
        demande.etablissement,
        demande.filiere,
        demande.niveau_etude,
        demande.date_debut,
        demande.date_fin,
        cv,
        cnib,
        lettre,
      ]
    );

    await connection.end();

    const response = NextResponse.json({
      success: true,
      message: 'Demande enregistrée avec succès',
      data: {
        id: (result as any).insertId,
        nom: demande.nom_etudiant,
        prenom: demande.prenom_etudiant,
        email: demande.email
      }
    }, { status: 201 });

    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Content-Type', 'application/json');
    return response;

  } catch (error: unknown) {
    if (connection) await connection.end().catch(() => {});

    const apiError: ApiError = (() => {
      if (typeof error === 'object' && error !== null) {
        return {
          error: 'error' in error ? String(error.error) : 'Erreur inconnue',
          details: 'details' in error ? String(error.details) : undefined,
          status: 'status' in error ? Number(error.status) : 500
        };
      }
      return {
        error: 'Erreur inconnue',
        details: error instanceof Error ? error.message : String(error),
        status: 500
      };
    })();

    const errorResponse = NextResponse.json(
      { 
        success: false,
        error: apiError.error,
        details: process.env.NODE_ENV === 'development' ? apiError.details : undefined
      },
      { status: apiError.status || 500 }
    );

    errorResponse.headers.set('Cache-Control', 'no-store');
    errorResponse.headers.set('Content-Type', 'application/json');
    return errorResponse;
  }
}
