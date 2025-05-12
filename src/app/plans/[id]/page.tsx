'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiEdit, FiTrash2, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { IPlan } from '@/models/Plan';

export default function PlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<IPlan | null>(null);
  const planId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/plans/${planId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch plan');
        }
        const data = await response.json();
        setPlan(data);
      } catch (err) {
        console.error('Error fetching plan:', err);
        setError('Failed to load plan. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete plan');
      }
      router.push('/plans');
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError('Failed to delete plan. Please try again.');
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="container mx-auto px-4 py-8 bg-yellow-100 min-h-screen rounded-2xl">
        <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-brutal">
          <p>{error || 'Plan not found'}</p>
        </div>
        <button
          onClick={() => router.push('/plans')}
          className="flex items-center px-4 py-2 border-2 border-black rounded-lg bg-white font-bold shadow-brutal hover:bg-yellow-100 transition-colors"
        >
          <FiArrowLeft className="mr-1" />
          Back to Plans
        </button>
      </div>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="container mx-auto px-4 py-8 bg-white border-2 border-black rounded-2xl">
      <div className="flex justify-between items-start mb-6">
        <button
          onClick={() => router.push('/plans')}
          className="flex items-center px-4 py-2 border-2 border-black rounded-lg bg-white font-bold shadow-brutal hover:bg-yellow-100 transition-colors"
        >
          <FiArrowLeft className="mr-1" />
          Back to Plans
        </button>
        <div className="flex space-x-2">
          <Link
            href={`/plans/edit/${plan._id.toString()}`}
            className="flex items-center px-4 py-2 border-2 border-black rounded-lg bg-yellow-300 font-bold shadow-brutal hover:bg-yellow-400 transition-colors"
          >
            <FiEdit className="mr-1" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-bold shadow-brutal hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <FiTrash2 className="mr-1" />
            Delete
          </button>
          <DeleteConfirmModal
            isOpen={showDeleteModal}
            title="Delete Plan?"
            message="Are you sure you want to delete this plan? This cannot be undone."
            confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
            cancelLabel="Cancel"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            loading={isDeleting}
          />
        </div>
      </div>

      <div className="bg-white border-2 border-black rounded-2xl p-6 mb-8 shadow-brutal">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-black">{plan.title}</h1>
            <p className="text-gray-700">{plan.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <FiClock className="mr-1" />
              <span>{plan.duration}</span>
            </div>
            <span className="px-2 py-1 text-xs font-bold rounded-md bg-yellow-200 border-2 border-black">
              {plan.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => (
          <div key={day} className="bg-white border-2 border-black rounded-2xl p-4 shadow-brutal">
            <h2 className="text-lg font-semibold mb-3">{day}</h2>
            {plan.scheduledTasks[day]?.length ? (
              <ul className="space-y-2">
                {plan.scheduledTasks[day].map((task, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-500">{task.type}</p>
                    </div>
                    {task.time && (
                      <span className="text-sm text-gray-500">
                        {new Date(task.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No tasks scheduled</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
