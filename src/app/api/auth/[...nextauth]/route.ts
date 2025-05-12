import NextAuth from 'next-auth';
import bcrypt from 'bcryptjs';
import CredentialsProvider from 'next-auth/providers/credentials';
import { pool, executeQuery } from '@/lib/db-server';
import { Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

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

import { SessionStrategy } from 'next-auth';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
  if (!credentials) {
    throw new Error('Credentials manquants');
  }
        try {
          // On récupère l'utilisateur par email
          const [rows] = await executeQuery(
            'SELECT * FROM users WHERE email = ?',
            [credentials.email]
          );

          if (rows.length === 0) {
            throw new Error('Invalid credentials');
          }

          const user = rows[0];
          // Vérification du mot de passe hashé
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid credentials');
          }

          return {
            id: String(user.id),
            email: user.email,
            name: user.nom + ' ' + user.prenom,
            role: user.role
          };

        } catch (error) {
          console.error('Error in authorize:', error);
          return null;
        }
      }
    })
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export const dynamic = 'force-dynamic';
