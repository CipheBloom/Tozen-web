"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useUser } from '@/context/UserContext';
import Image from 'next/image';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const { user, refreshUser } = useUser();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Sync local state with user context
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImage(user.image || "");
    }
  }, [user]);

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Please sign in to view your profile.</div>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image }),
    });
    if (res.ok) {
      setMessage("Profile updated!");
      await refreshUser();
      update();
    } else {
      setMessage("Failed to update profile.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white border-2 border-black rounded-md p-8 shadow-brutal">
      <h1 className="text-2xl font-extrabold mb-4">Your Profile</h1>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <label>
          Name:
          <input
            className="w-full border-2 border-black rounded-md p-2 mt-1"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Profile Image URL:
          <input
            type="url"
            className="w-full border-2 border-black rounded-md p-2 mt-1"
            value={image}
            onChange={e => setImage(e.target.value)}
            placeholder="https://example.com/your-image.jpg"
          />
        </label>
        {image && (
          <Image
            src={image}
            alt="Profile Preview"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full border-2 border-black mx-auto"
          />
        )}
        <button
          type="submit"
          className="px-4 py-2 border-2 border-black rounded-md bg-yellow-300 font-bold shadow-brutal hover:bg-yellow-400"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          className="px-4 py-2 border-2 border-black rounded-md bg-red-400 font-bold shadow-brutal hover:bg-red-600 text-white"
          disabled={saving}
          onClick={async () => {
            if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
            setSaving(true);
            setMessage("");
            const res = await fetch("/api/profile", { method: "DELETE" });
            if (res.ok) {
              setMessage("Account deleted. Redirecting...");
              setTimeout(() => {
                window.location.href = "/api/auth/signout";
              }, 1500);
            } else {
              setMessage("Failed to delete account.");
            }
            setSaving(false);
          }}
        >
          Delete Account
        </button>
        {message && <div className="text-green-700 font-bold">{message}</div>}
      </form>
    </div>
  );
} 