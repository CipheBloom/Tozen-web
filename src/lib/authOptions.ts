import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from './mongodb';
import type { Session } from 'next-auth/next';

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
    async session(params: { session: Session; token: object; user: object; newSession?: unknown; trigger?: "update" }): Promise<Session> {
      if (params.session?.user) {
        (params.session.user as Record<string, unknown>).id = (params.token && 'sub' in params.token && typeof params.token.sub === 'string' ? params.token.sub : '');
      }
      return params.session;
    },
  },
};