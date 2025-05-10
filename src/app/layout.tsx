"use client"
import Link from 'next/link';
import './globals.css';
import { ReactNode, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import NextAuthSessionProvider from './SessionProvider';
import SignInPage from './auth/signin/page';
import { UserProvider, useUser } from '@/context/UserContext';
import Image from 'next/image';

export default function RootLayout({ children }: { children: ReactNode }) {
  // About modal state
  const [showAbout, setShowAbout] = useState(false);

  return (
    <html lang="en">
      <body className="bg-yellow-100 min-h-screen font-sans">
        <NextAuthSessionProvider>
          <UserProvider>
            <AuthGate>
              <Header />
              <nav className="flex justify-center gap-4 py-4 bg-yellow-200 border-b-2 border-black shadow-brutal">
                <Link href="/workouts" className="px-4 py-2 rounded-md border-2 border-black bg-white font-bold hover:bg-yellow-300 shadow-brutal">WORKOUTS</Link>
                <Link href="/todo" className="px-4 py-2 rounded-md border-2 border-black bg-white font-bold hover:bg-yellow-300 shadow-brutal">TODO</Link>
                <Link href="/plans" className="px-4 py-2 rounded-md border-2 border-black bg-white font-bold hover:bg-yellow-300 shadow-brutal">PLANS</Link>
              </nav>
              <main className="max-w-3xl mx-auto p-4">{children}</main>
              {showAbout && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white border-2 border-black rounded-lg p-6 shadow-brutal w-full max-w-md">
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                      <span className="font-bold text-lg">ABOUT</span>
                    </div>
                    <div className="bg-yellow-100 border-2 border-black rounded-md p-4 mb-4">
                      <div className="font-bold text-xl">Tozen</div>
                      <div className="text-sm text-black/70 font-semibold mb-2">Your daily movement, made mindful.</div>
                      <div>Developed by: CipheBloom</div>
                      <div>Maintainer: Yougraj</div>
                      <div className="mt-2">© 2024 All rights reserved</div>
                    </div>
                    <button
                      className="mt-2 px-4 py-2 border-2 border-black rounded-md bg-yellow-300 font-bold hover:bg-yellow-400 shadow-brutal"
                      onClick={() => setShowAbout(false)}
                    >
                      CLOSE
                    </button>
                  </div>
                </div>
              )}
            </AuthGate>
          </UserProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}

// AuthGate component: Only renders children if signed in, otherwise shows sign-in
function AuthGate({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    // Show only the sign-in page if not authenticated
    return <SignInPage />;
  }

  // If signed in, show the app
  return <>{children}</>;
}

// Move the header into its own client component so it can use useUser
function Header() {
  const { status } = useSession();
  const { user } = useUser();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-yellow-300 shadow-brutal">
      <div className="p-2 bg-yellow-400 border-2 border-black rounded-md shadow-brutal">
        <span className="font-extrabold text-2xl text-black tracking-widest">Tozen</span>
        <span className="block text-xs font-semibold text-black/70 -mt-1">Your daily movement, made mindful.</span>
      </div>
      <div className="flex items-center gap-2">
        {status === 'loading' ? null : user ? (
          <>
            {user.image && (
              <Link href="/profile">
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border-2 border-black shadow-brutal cursor-pointer"
                />
              </Link>
            )}
            <Link href="/profile">
              <span className="font-bold text-black mx-2 cursor-pointer">
                {user.name}
              </span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="ml-2 px-3 py-1 border-2 border-black rounded-md bg-white font-bold hover:bg-yellow-200 shadow-brutal"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="ml-2 px-3 py-1 border-2 border-black rounded-md bg-white font-bold hover:bg-yellow-200 shadow-brutal"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
} 