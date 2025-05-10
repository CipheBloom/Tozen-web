"use client";
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 p-8">
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/dumbbell.svg"
          alt="tozen Logo"
          width={64}
          height={64}
          className="mb-2"
        />
        <h1 className="text-5xl font-extrabold text-black mb-2 tracking-tight brutalist-title">
          Tozen
        </h1>
        <span className="block text-lg font-semibold text-black/70 mb-4">Your daily movement, made mindful.</span>
        <div className="flex flex-col items-center gap-2 mb-4">
          <span className="text-base text-black/80">What you can do with tozen:</span>
          <ul className="text-left text-black/90 text-base font-medium list-disc list-inside">
            <li>Log your daily workouts and track progress on a calendar</li>
            <li>Build and edit your own custom exercises</li>
            <li>View your fitness journey at a glance</li>
            <li>Enjoy a unique, brutalist-inspired interface</li>
            <li>Stay motivated and organized every day</li>
          </ul>
        </div>
      </div>
      <div className="bg-white border-2 border-black rounded-md p-8 shadow-brutal text-center w-full max-w-md">
        <h2 className="text-2xl font-extrabold mb-4">Sign in to <span className="text-yellow-600">tozen</span></h2>
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-black rounded-md bg-yellow-300 font-bold shadow-brutal hover:bg-yellow-400 transition-colors text-lg w-full"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.148 0-3.359 2.75-6.148 6.125-6.148 1.922 0 3.211.82 3.953 1.523l2.703-2.625c-1.711-1.57-3.922-2.523-6.656-2.523-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.695 0-.652-.07-1.148-.156-1.707z" fill="#000"/>
            </g>
          </svg>
          Sign in with Google
        </button>
      </div>
      <footer className="text-black/60 text-sm mt-8">
        &copy; {new Date().getFullYear()} tozen. Your daily movement, made mindful.
      </footer>
    </div>
  );
} 