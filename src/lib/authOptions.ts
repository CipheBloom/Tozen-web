import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from './mongodb';


declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    sub?: string;
  }
}

const JWT_STRATEGY = "jwt" as const;

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: JWT_STRATEGY,
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token, user }: { session: any; token: any; user?: any; newSession?: any; trigger?: string }) {
      // Always ensure session.user is defined and has an id property
      if (!session.user) {
        session.user = { id: '', name: null, email: null, image: null };
      }
      // Prefer id from token or user
      session.user.id = (token?.id || token?.sub || user?.id || '');
      if (token && typeof token.name === 'string') session.user.name = token.name;
      if (token && typeof token.email === 'string') session.user.email = token.email;
      if (token && typeof token.picture === 'string') session.user.image = token.picture;
      return session;
    },
  },
};