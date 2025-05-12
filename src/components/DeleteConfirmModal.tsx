import React from 'react';
import { FiX } from 'react-icons/fi';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  title = 'Delete?',
  message = 'Are you sure you want to delete this item? This cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white border-2 border-black rounded-2xl shadow-brutal max-w-xs w-full p-6 text-center relative">
        <button
          className="absolute top-2 right-2 p-1 rounded-full border-2 border-black bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black transition-colors"
          onClick={onCancel}
          aria-label="Close"
        >
          <FiX size={18} />
        </button>
        <h3 className="text-lg font-bold mb-4 text-black">{title}</h3>
        <p className="mb-4 text-gray-700">{message}</p>
        <div className="flex gap-2 justify-center">
          <button
            className="px-4 py-2 border-2 border-black rounded-lg bg-red-400 font-bold shadow-brutal hover:bg-red-600 text-white disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : confirmLabel}
          </button>
          <button
            className="px-4 py-2 border-2 border-black rounded-lg bg-white font-bold shadow-brutal hover:bg-yellow-100"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
