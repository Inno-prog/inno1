import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { select, modify } from '@/lib/db-server';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer les informations du profil
    const [rows] = await select('SELECT * FROM stagiaires WHERE id = ?', [session.user.id]);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return NextResponse.json(
      { error: "Échec de la récupération du profil" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nom, prenom, email, telephone, etablissement, filiere, niveau_etude } = body;

    if (!nom || !prenom || !email || !telephone || !etablissement || !filiere || !niveau_etude) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    const result = await modify(
      'UPDATE stagiaires SET nom = ?, prenom = ?, email = ?, telephone = ?, etablissement = ?, filiere = ?, niveau_etude = ? WHERE id = ?',
      [nom, prenom, email, telephone, etablissement, filiere, niveau_etude, session.user.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Profil mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json(
      { error: "Échec de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
