
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { config } from "dotenv";
import path from "path";
import { headers } from 'next/headers';

// Charger les variables d'environnement
config({ path: path.resolve(process.cwd(), ".env") });

// Interface pour les utilisateurs
interface UserRow extends mysql.RowDataPacket {
  id: number;
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: 'etudiant' | 'admin';
}

// Configuration de la base de données directement dans ce fichier
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "stage",
  password: process.env.DB_PASSWORD || "stage",
  database: process.env.DB_NAME || "gestion_stages",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export async function POST(request: Request) {
  // Créer une connexion pour cette requête
  const pool = mysql.createPool(dbConfig);
  
  try {
    const { email, password } = await request.json();
    
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email et mot de passe requis.' },
        { status: 400 }
      );
    }
    
    console.log(`📧 Tentative de connexion pour l'email: ${email}`);
    
    // Exécuter la requête directement
    const [users] = await pool.execute<UserRow[]>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    
    if (users.length === 0) {
      console.log(`❌ Utilisateur non trouvé: ${email}`);
      return NextResponse.json(
        { message: 'Identifiants incorrects' },
        { status: 401 }
      );
    }
    
    const user = users[0];
    console.log(`✅ Utilisateur trouvé: ${user.email}`);
    
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`❌ Mot de passe incorrect pour: ${email}`);
      return NextResponse.json(
        { message: 'Identifiants incorrects' },
        { status: 401 }
      );
    }
    
    console.log(`✅ Authentification réussie pour: ${email}`);
    
    // Générer le JWT (sans le mot de passe)
    const { password: _, ...safeUser } = user;
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'secret_fallback',
      { expiresIn: '1h' }
    );
    
    // Créer une réponse avec les données utilisateur et le token
    const response = NextResponse.json({
      user: safeUser,
      token,
      success: true,
      redirect: '/dashboarPrincipal'
    });
    
    // Définir un cookie pour le token JWT si nécessaire
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 heure
      path: '/dashboarPrincipal'
    });
    
    return response;
    
  } catch (error) {
    console.error('🚨 Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    // Fermer le pool à la fin
    await pool.end();
  }
}