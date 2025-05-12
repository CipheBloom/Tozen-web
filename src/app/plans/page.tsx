'use client';

import { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import PlanCard from '@/components/PlanCard';
import CreatePlanModal from '@/components/CreatePlanModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { IPlan } from '@/models/Plan';

export default function PlansPage() {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeletePlanId, setPendingDeletePlanId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      const data = await response.json() as IPlan[];
      setPlans(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load plans. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async (planData: {
    title: string;
    description: string;
    duration: string;
    difficulty: string;
  }) => {
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...planData,
          color: '#3b82f6', // Default blue color
          icon: 'dumbbell',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create plan');
      }

      const newPlan = await response.json() as IPlan;
      setPlans([...plans, newPlan]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating plan:', err);
      setError('Failed to create plan. Please try again.');
    }
  };

  const handleDeletePlan = (planId: string) => {
    setPendingDeletePlanId(planId);
  };

  const confirmDeletePlan = async () => {
    if (!pendingDeletePlanId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/plans/${pendingDeletePlanId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete plan');
      }
      setPlans(plans.filter(plan => String(plan._id) !== pendingDeletePlanId));
      setPendingDeletePlanId(null);
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError('Failed to delete plan. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeletePlan = () => {
    setPendingDeletePlanId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white border-2 border-black min-h-screen rounded-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-black">My Plans</h1>
          <p className="text-gray-700">Create and manage your fitness plans</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 border-2 border-black rounded-lg bg-yellow-300 font-bold shadow-brutal hover:bg-yellow-400 transition-colors"
        >
          <FiPlus className="mr-2" />
          New Plan
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded-lg shadow-brutal">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 bg-white border-2 border-black rounded-2xl shadow-brutal">
          <h3 className="text-lg font-bold text-black mb-2">No plans yet</h3>
          <p className="text-gray-700 mb-4">Get started by creating your first fitness plan</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 border-2 border-black rounded-lg bg-yellow-300 font-bold shadow-brutal hover:bg-yellow-400 transition-colors"
          >
            Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard 
              key={plan._id.toString()} 
              plan={plan} 
              onDelete={handleDeletePlan} 
            />
          ))}
        </div>
      )}

      <CreatePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreatePlan}
      />

      <DeleteConfirmModal
        isOpen={!!pendingDeletePlanId}
        title="Delete Plan?"
        message="Are you sure you want to delete this plan? This cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        onConfirm={confirmDeletePlan}
        onCancel={cancelDeletePlan}
        loading={isDeleting}
      />
    </div>
  );
}