"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

type User = {
  name: string;
  image: string;
  email: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);

  // Fetch user from DB
  const fetchUser = async () => {
    if (!session?.user?.email) return;
    const res = await fetch("/api/profile?email=" + encodeURIComponent(session.user.email));
    if (res.ok) {
      const dbUser = await res.json();
      setUser({
        name: dbUser.name || session.user.name,
        image: dbUser.image || session.user.image,
        email: dbUser.email,
      });
    } else {
      setUser({
        name: session.user.name || "",
        image: session.user.image || "",
        email: session.user.email || "",
      });
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, [session?.user?.email]);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
} 