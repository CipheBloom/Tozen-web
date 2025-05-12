import { IPlan } from '@/models/Plan';
import { FiEdit2, FiTrash2, FiClock, FiCalendar, FiInfo } from 'react-icons/fi';
import Link from 'next/link';

interface PlanCardProps {
  plan: IPlan;
  onDelete: (id: string) => void;
}

export default function PlanCard({ plan, onDelete }: PlanCardProps) {
  const taskCount = Object.values(plan.scheduledTasks).reduce(
    (total, tasks) => total + (tasks?.length || 0),
    0
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(plan._id.toString());
  };

  // Convert ObjectId to string for URLs
  const planId = plan._id.toString();

  return (
    <div className="bg-white border-2 border-black rounded-lg p-4 shadow-brutal-sm hover:shadow-brutal transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold">{plan.title}</h3>
          <p className="text-sm text-gray-600">{plan.description}</p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/plans/edit/${planId}`}>
            <button 
              className="p-1.5 text-gray-600 hover:text-black transition-colors"
              aria-label="Edit plan"
            >
              <FiEdit2 size={18} />
            </button>
          </Link>
          <button 
            onClick={handleDelete}
            className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
            aria-label="Delete plan"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex items-center text-sm text-gray-600 mb-3">
        <div className="flex items-center mr-4">
          <FiClock className="mr-1" />
          <span>{plan.duration}</span>
        </div>
        <div className="flex items-center">
          <FiCalendar className="mr-1" />
          <span>{taskCount} tasks</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100">
          {plan.difficulty}
        </span>
        <Link 
          href={`/plans/${planId}`}
          className="flex items-center text-sm text-blue-600 hover:underline"
        >
          <span>View Details</span>
          <FiInfo className="ml-1" />
        </Link>
      </div>
    </div>
  );
}
