"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useUser } from '@/context/UserContext';
import { useState } from 'react';

export default function HeaderMenu({ setShowAbout }: { setShowAbout: (v: boolean) => void }) {
  const { status } = useSession();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Hamburger button for mobile */}
      <button
        className="md:hidden flex items-center px-3 py-2 border-2 border-black rounded shadow-brutal bg-yellow-400"
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="fill-black" viewBox="0 0 20 20" width="24" height="24">
          <title>Menu</title>
          <rect y="3" width="20" height="2" rx="1" />
          <rect y="9" width="20" height="2" rx="1" />
          <rect y="15" width="20" height="2" rx="1" />
        </svg>
      </button>
      {/* Desktop menu */}
      <div className="hidden md:flex items-center gap-2">
        {status === 'loading' ? null : user === null ? (
          <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-200 animate-pulse" />
        ) : user ? (
          <>
            <Link href="/profile">
              <Image
                src={user.selectedImage && user.selectedImage.trim() !== '' ? user.selectedImage : '/default-image.jpg'}
                alt={user.name && user.name.trim() !== '' ? user.name : 'User'}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border-2 border-black shadow-brutal cursor-pointer"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/default-image.jpg'; }}
              />
            </Link>
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
            <button
              onClick={() => setShowAbout(true)}
              className="ml-2 px-3 py-1 border-2 border-black rounded-md bg-white font-bold hover:bg-yellow-200 shadow-brutal"
            >
              ABOUT
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
      {/* Mobile dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black rounded shadow-brutal z-50 flex flex-col p-2 md:hidden animate-fade-in">
          {status === 'loading' ? null : user === null ? (
            <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-200 animate-pulse" />
          ) : user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 px-2 py-2 hover:bg-yellow-100 rounded">
                <Image
                  src={user.selectedImage && user.selectedImage.trim() !== '' ? user.selectedImage : '/default-image.jpg'}
                  alt={user.name && user.name.trim() !== '' ? user.name : 'User'}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full border-2 border-black shadow-brutal"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/default-image.jpg'; }}
                />
                <span className="font-bold text-black">{user.name}</span>
              </Link>
              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }}
                className="w-full text-left px-2 py-2 border-2 border-black rounded-md bg-white font-bold hover:bg-yellow-200 shadow-brutal mt-2"
              >
                Sign out
              </button>
              <button
                onClick={() => { setShowAbout(true); setOpen(false); }}
                className="w-full text-left px-2 py-2 border-2 border-black rounded-md bg-white font-bold hover:bg-yellow-200 shadow-brutal mt-2"
              >
                ABOUT
              </button>
            </>
          ) : (
            <button
              onClick={() => { setOpen(false); signIn('google', { callbackUrl: '/' }); }}
              className="w-full text-left px-2 py-2 border-2 border-black rounded-md bg-white font-bold hover:bg-yellow-200 shadow-brutal"
            >
              Sign in
            </button>
          )}
        </div>
      )}
    </div>
  );
}
