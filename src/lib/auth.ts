// app/api/stagiaires/demandes/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { DemandesRepository } from './demandes-repository';
import { CredentialsProvider } from 'next-auth/providers/credentials';
import { SessionStrategy } from 'next-auth';
import { Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { executeQuery } from './db-server';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
    };
  }
  interface User {
    id: string;
    email: string;
    name?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    name?: string;
  }
}

export const authOptions = {
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials' as const,
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Record<string, string> | undefined) {
        try {
          if (!credentials || !credentials.email || !credentials.password) {
            throw new Error('Invalid credentials');
          }

          const [rows] = await executeQuery(
            'SELECT * FROM stagiaires WHERE email = ? AND password = ?',
            [credentials.email, credentials.password]
          );

          if (rows.length === 0) {
            throw new Error('Invalid credentials');
          }

          return {
            id: String(rows[0].id),
            email: rows[0].email,
            name: rows[0].nom + ' ' + rows[0].prenom
          };
        } catch (error) {
          console.error('Error in authorize:', error);
          return null;
        }
      }
    }
  ],
  pages: {
    signIn: '/auth/login'
  },
  session: {
    strategy: 'jwt' as SessionStrategy
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.name = token.name;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user: User | undefined }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
      }
      return token;
    }
  }
};

export async function getAuthSession(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut');

    const demandes = await DemandesRepository.findAllByUser(Number(session.user.id), statut as 'brouillon' | 'en_attente' | 'acceptee' | 'refusee' | undefined);
    
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
    const session = await getAuthSession();

    const body = await request.json();
    const { etablissement, filiere, date_debut, date_fin } = body;
    
    if (!etablissement || !filiere || !date_debut || !date_fin) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    const demande = await DemandesRepository.create({
      stagiaire_id: Number(session.user.id),
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