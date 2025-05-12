// app/api/stagiaires/demandes/route.ts
import { NextResponse } from 'next/server';
import { DemandesRepository } from '@/lib/demandes-repository';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut');

    const demandes = await DemandesRepository.findAllByUser(Number(session.user.id));
    
    return NextResponse.json(demandes);
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json(
      { error: "Échec de la récupération des demandes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { etablissement, filiere, date_debut, date_fin } = body;
    
    if (!etablissement || !filiere || !date_debut || !date_fin) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    const demande = await DemandesRepository.create({
      user_id: Number(session.user.id),
      etablissement,
      filiere,
      date_debut,
      date_fin,
      statut: 'brouillon' as const
    });

    return NextResponse.json({ 
      id: demande,
      success: true,
      message: "Demande créée avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la création de la demande:", error);
    return NextResponse.json(
      { error: "Échec de la création de la demande" },
      { status: 500 }
    );
  }
}