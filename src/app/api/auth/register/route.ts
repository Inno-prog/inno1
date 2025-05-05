// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/src/lib/db'; // Import modifié

export async function POST(request: Request) {
  try {
    const { email, password, nom, prenom } = await request.json();

    if (!email || !password || !nom || !prenom) {
      return NextResponse.json({ message: 'Champs requis manquants.' }, { status: 400 });
    }

    const conn = await db.getConnection();
    
    try {
      const [existing] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json({ message: 'Email déjà utilisé.' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await conn.query(
        `INSERT INTO users (email, password, nom, prenom, role) VALUES (?, ?, ?, ?, 'etudiant')`,
        [email, hashedPassword, nom, prenom]
      );

      return NextResponse.json({ message: 'Inscription réussie.' });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Erreur inscription:', error);
    return NextResponse.json({ message: 'Erreur interne' }, { status: 500 });
  }
}