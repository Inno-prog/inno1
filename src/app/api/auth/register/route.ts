// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'stage',
  password: process.env.DB_PASSWORD || 'stage',
  database: process.env.DB_NAME || 'gestion_stages',
};

export async function POST(request: Request) {
  let connection;
  try {
    const { email, password, nom, prenom } = await request.json();

    if (!email || !password || !nom || !prenom) {
      return NextResponse.json({ message: 'Champs requis manquants.' }, { status: 400 });
    }
    
    // Create a new connection
    connection = await mysql.createConnection(dbConfig);
    
    // Check if user already exists
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    ) as [any[], any];
    
    if (rows.length > 0) {
      return NextResponse.json(
        { message: 'Un utilisateur avec cet email existe déjà.' }, 
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    await connection.query(
      'INSERT INTO users (email, password, nom, prenom) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, nom, prenom]
    );
    
    return NextResponse.json(
      { message: 'Utilisateur créé avec succès.' },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'inscription.' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}