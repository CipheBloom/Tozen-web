import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from './mongodb';
import type { Session } from 'next-auth/next';
import type { JWT } from 'next-auth/jwt';

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
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user) {
        (session.user as Record<string, unknown>).id = (token && 'sub' in token && typeof token.sub === 'string' ? token.sub : '');
      }
      return session;
    },
  },
};