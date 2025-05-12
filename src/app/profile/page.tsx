"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from '@/context/UserContext';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const { user, refreshUser } = useUser();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Sync local state with user context
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImage(user.selectedImage || "");
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
      body: JSON.stringify({ action: "updateName", name }),
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

  // Add new image
  const handleAddImage = async () => {
    if (!image.trim()) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", image }),
    });
    if (res.ok) {
      setMessage("Image added!");
      setImage("");
      await refreshUser();
      update();
    } else {
      setMessage("Failed to add image.");
    }
    setSaving(false);
  };

  // Delete image
  const handleDeleteImage = async (img: string) => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", image: img }),
    });
    if (res.ok) {
      setMessage("Image deleted!");
      await refreshUser();
      update();
    } else {
      setMessage("Failed to delete image.");
    }
    setSaving(false);
  };

  // Select image
  const handleSelectImage = async (img: string) => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "select", image: img }),
    });
    if (res.ok) {
      setMessage("Profile image selected!");
      await refreshUser();
      update();
    } else {
      setMessage("Failed to select image.");
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
          Add Image URL:
          <div className="flex gap-2 mt-1">
            <input
              type="url"
              className="flex-1 border-2 border-black rounded-md p-2"
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="https://cdn.staticneo.com/w/naruto/Nprofile2.jpg"
              disabled={saving}
            />
            <button
              type="button"
              className="px-3 py-2 border-2 border-black rounded-md bg-green-300 font-bold shadow-brutal hover:bg-green-400"
              onClick={handleAddImage}
              disabled={saving || !image.trim()}
            >
              Add
            </button>
          </div>
        </label>
        {user && user.images && user.images.length > 0 && (
          <div className="grid grid-cols-3 gap-4 my-4">
            {user.images.map((img, idx) => (
              <div
                key={img}
                className={`relative border-2 rounded-md p-1 flex flex-col items-center ${user.selectedImage === img ? 'border-yellow-500 bg-yellow-100' : 'border-black bg-white'}`}
              >
                <Image
                  src={img}
                  alt={`Profile ${idx + 1}`}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full border mb-1 cursor-pointer"
                  style={{ borderColor: user.selectedImage === img ? '#f59e42' : '#000' }}
                  onClick={() => handleSelectImage(img)}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/default-image.jpg'; }}
                />
                {user.selectedImage === img && (
                  <span className="text-xs font-bold text-yellow-700">Selected</span>
                )}
                <button
                  type="button"
                  className="absolute top-1 right-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-700"
                  onClick={() => handleDeleteImage(img)}
                  disabled={saving}
                  title="Delete image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
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
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </button>
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          title="Delete Account?"
          message="Are you sure you want to delete your account? This cannot be undone."
          confirmLabel={deletingAccount ? 'Deleting...' : 'Delete'}
          cancelLabel="Cancel"
          onConfirm={async () => {
            setDeletingAccount(true);
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
            setDeletingAccount(false);
            setShowDeleteModal(false);
          }}
          onCancel={() => setShowDeleteModal(false)}
          loading={deletingAccount}
        />
        {message && <div className="text-green-700 font-bold">{message}</div>}
      </form>
    </div>
  );
} 