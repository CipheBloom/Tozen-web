'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { IPlan, IPlanBase, IPlanTaskBase, TaskType } from '@/models/Plan';

type TaskFormData = {
  title: string;
  type: TaskType;
  time?: string;
  day: string;
};

export default function EditPlanPage() {
  const params = useParams();
  const router = useRouter();
  const planId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [plan, setPlan] = useState<IPlanBase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: '',
    type: TaskType.EXERCISE,
    day: 'Monday',
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTask = () => {
    if (!taskForm.title.trim() || !plan) return;

    const newTask: IPlanTaskBase = {
      title: taskForm.title,
      type: taskForm.type,
      ...(taskForm.time && { time: new Date(`1970-01-01T${taskForm.time}`) }),
    };

    const updatedPlan = { ...plan };
    if (!updatedPlan.scheduledTasks[taskForm.day]) {
      updatedPlan.scheduledTasks[taskForm.day] = [];
    }
    updatedPlan.scheduledTasks[taskForm.day].push(newTask);

    setPlan(updatedPlan);
    setTaskForm({
      title: '',
      type: TaskType.EXERCISE,
      day: taskForm.day,
    });
  };

  const removeTask = (day: string, index: number) => {
    if (!plan) return;
    
    const updatedPlan = { ...plan };
    const tasks = [...updatedPlan.scheduledTasks[day]];
    tasks.splice(index, 1);
    updatedPlan.scheduledTasks[day] = tasks;
    setPlan(updatedPlan);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...plan,
          scheduledTasks: plan.scheduledTasks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update plan');
      }

      router.push(`/plans/${planId}`);
    } catch (err) {
      console.error('Error updating plan:', err);
      setError('Failed to update plan. Please try again.');
      setIsSaving(false);
    }
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
      <div className="container mx-auto px-4 py-8 bg-white border-2 border-black min-h-screen rounded-2xl">
        <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-brutal">
          <p>{error || 'Plan not found'}</p>
        </div>
        <Link href="/plans" className="flex items-center px-4 py-2 border-2 border-black rounded-lg bg-white font-bold shadow-brutal hover:bg-yellow-100 transition-colors">
          <FiArrowLeft className="mr-1" />
          Back to Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white border-2 border-black min-h-screen rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <Link
          href={`/plans/${planId}`}
          className="flex items-center px-4 py-2 border-2 border-black rounded-lg bg-white font-bold shadow-brutal hover:bg-yellow-100 transition-colors"
        >
          <FiArrowLeft className="mr-1" />
          Back to Plan
        </Link>
        <button
          type="submit"
          form="edit-plan-form"
          disabled={isSaving}
          className="flex items-center px-4 py-2 border-2 border-black rounded-lg bg-yellow-300 font-bold shadow-brutal hover:bg-yellow-400 transition-colors disabled:opacity-50"
        >
          <FiSave className="mr-1" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <form id="edit-plan-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-brutal">
          <h1 className="text-2xl font-bold mb-4 text-black">Edit Plan</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={plan.title}
                onChange={(e) => setPlan({ ...plan, title: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-300"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={plan.description}
                onChange={(e) => setPlan({ ...plan, description: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <select
                id="duration"
                value={plan.duration}
                onChange={(e) => setPlan({ ...plan, duration: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                <option value="1 week">1 Week</option>
                <option value="2 weeks">2 Weeks</option>
                <option value="4 weeks">4 Weeks</option>
                <option value="8 weeks">8 Weeks</option>
                <option value="12 weeks">12 Weeks</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={plan.difficulty}
                onChange={(e) => setPlan({ ...plan, difficulty: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-brutal">
          <h2 className="text-xl font-bold mb-4 text-black">Scheduled Tasks</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                id="task-title"
                name="title"
                value={taskForm.title}
                onChange={handleTaskInputChange}
                className="w-full px-3 py-2 border-2 border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-300"
                placeholder="e.g., Morning Run"
              />
            </div>
            
            <div>
              <label htmlFor="task-type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="task-type"
                name="type"
                value={taskForm.type}
                onChange={handleTaskInputChange}
                className="w-full px-3 py-2 border-2 border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                <option value={TaskType.EXERCISE}>Exercise</option>
                <option value={TaskType.DIET}>Diet</option>
                <option value={TaskType.CUSTOM}>Custom</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="task-time" className="block text-sm font-medium text-gray-700 mb-1">
                Time (Optional)
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="task-time"
                  name="time"
                  value={taskForm.time || ''}
                  onChange={handleTaskInputChange}
                  className="w-full px-3 py-2 border-2 border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
                <FiClock className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="task-day" className="block text-sm font-medium text-gray-700 mb-1">
                Day
              </label>
              <select
                id="task-day"
                name="day"
                value={taskForm.day}
                onChange={handleTaskInputChange}
                className="w-full px-3 py-2 border-2 border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleAddTask}
            disabled={!taskForm.title.trim()}
            className="flex items-center px-4 py-2 border-2 border-black rounded-lg bg-yellow-300 font-bold shadow-brutal hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            <FiPlus className="mr-1" />
            Add Task
          </button>
          
          <div className="mt-6 space-y-6">
            {days.map((day) => (
              <div key={day} className="border-2 border-black rounded-lg p-4 shadow-brutal bg-white">
                <h3 className="text-lg font-bold mb-3 text-black">{day}</h3>
                {plan.scheduledTasks[day]?.length ? (
                  <ul className="space-y-2">
                    {plan.scheduledTasks[day].map((task, index) => (
                      <li key={index} className="flex items-center justify-between p-2 bg-yellow-100 rounded shadow-brutal">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-500">{task.type}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.time && (
                            <span className="text-sm text-gray-500">
                              {new Date(task.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeTask(day, index)}
                            className="text-red-500 hover:text-red-700 font-bold"
                            aria-label="Remove task"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No tasks scheduled for {day}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
