import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth";
import { createConnection, RowDataPacket } from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@gmail.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { email, password } = credentials;
        // Cas admin
        if(email === "admin@gmail.com" && password === "admin") {
          return {
            id: 0,
            email: "admin@gmail.com",
            nom: "Admin",
            prenom: "Super",
            role: "admin"
          };
        }

        // Utilisateur normal (reprise logique de login.js)
        const connection = await createConnection();
        try {
          const [users] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
          );
          if (users.length === 0) return null;
          const user = users[0];
          const isValid = await verifyPassword(password, user.password);
          if (!isValid) return null;
          return {
            id: user.id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role ? user.role : "stagiaire"
          };
        } catch {
          return null;
        } finally {
          await connection.end();
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login"
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
