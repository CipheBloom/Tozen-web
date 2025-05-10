"use client";

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// NOTE: Run `npm install react-calendar` if not already installed.

type Workout = {
  _id: string;
  date: string;
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
};
type Exercise = {
  _id: string;
  name: string;
  category: string;
  notes?: string;
};

function getMonthRange(date: Date): [Date, Date] {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return [start, end];
}

export default function WorkoutsPage() {
  const [tab, setTab] = useState<'calendar' | 'exercises'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({ exerciseId: '', sets: '', reps: '', weight: '' });
  const [calendarRange, setCalendarRange] = useState<[Date, Date]>(getMonthRange(new Date()));
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [addExerciseForm, setAddExerciseForm] = useState({ name: '', category: '', notes: '' });
  const [showEditWorkout, setShowEditWorkout] = useState(false);
  const [editWorkout, setEditWorkout] = useState<Workout | null>(null);
  const [showEditExercise, setShowEditExercise] = useState(false);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);
  const [pendingDeleteExercise, setPendingDeleteExercise] = useState<Exercise | null>(null);
  const [pendingDeleteWorkout, setPendingDeleteWorkout] = useState<Workout | null>(null);

  // Fetch workouts for the visible month
  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      const start = calendarRange[0].toISOString().slice(0, 10);
      const end = calendarRange[1].toISOString().slice(0, 10);
      const res = await fetch(`/api/workouts?start=${start}&end=${end}`);
      if (res.ok) {
        setWorkouts(await res.json());
      } else {
        setWorkouts([]);
      }
      setLoading(false);
    };
    fetchWorkouts();
  }, [calendarRange]);

  // Fetch all exercises
  useEffect(() => {
    const fetchExercises = async () => {
      const res = await fetch('/api/exercises');
      if (res.ok) {
        setExercises(await res.json());
      } else {
        setExercises([]);
      }
    };
    fetchExercises();
  }, []);

  // Workouts for selected day
  const dateKey = selectedDate.toISOString().slice(0, 10);
  const workoutsForDay = workouts.filter(w => w.date === dateKey);

  // Calendar markers
  const workoutDays = new Set(workouts.map(w => w.date));

  // Calendar onChange handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCalendarChange = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
    }
  };

  // Calendar onActiveStartDateChange handler
  const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) setCalendarRange(getMonthRange(activeStartDate));
  };

  // Log workout modal handlers
  const closeLogModal = () => {
    setShowLogModal(false);
    setLogForm({ exerciseId: '', sets: '', reps: '', weight: '' });
  };
  const handleLogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleLogSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: dateKey,
        exerciseId: logForm.exerciseId,
        sets: Number(logForm.sets),
        reps: Number(logForm.reps),
        weight: Number(logForm.weight),
      }),
    });
    closeLogModal();
    // Refetch workouts
    const start = calendarRange[0].toISOString().slice(0, 10);
    const end = calendarRange[1].toISOString().slice(0, 10);
    const res = await fetch(`/api/workouts?start=${start}&end=${end}`);
    if (res.ok) setWorkouts(await res.json());
  };

  // Add Exercise modal handlers
  const closeAddExercise = () => {
    setShowAddExercise(false);
    setAddExerciseForm({ name: '', category: '', notes: '' });
  };
  const handleAddExerciseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddExerciseForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleAddExerciseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addExerciseForm),
    });
    closeAddExercise();
    // Refetch exercises
    const res = await fetch('/api/exercises');
    if (res.ok) setExercises(await res.json());
  };

  // Edit workout modal handlers
  const openEditWorkout = (workout: Workout) => {
    setEditWorkout({ ...workout });
    setShowEditWorkout(true);
  };
  const closeEditWorkout = () => {
    setShowEditWorkout(false);
    setEditWorkout(null);
  };
  const handleEditWorkoutChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditWorkout((w) => w ? { ...w, [e.target.name]: e.target.value } : w);
  };
  const handleEditWorkoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editWorkout) return;
    await fetch('/api/workouts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: editWorkout._id,
        date: editWorkout.date,
        exerciseId: editWorkout.exerciseId,
        sets: Number(editWorkout.sets),
        reps: Number(editWorkout.reps),
        weight: Number(editWorkout.weight),
      }),
    });
    closeEditWorkout();
    // Refetch workouts
    const start = calendarRange[0].toISOString().slice(0, 10);
    const end = calendarRange[1].toISOString().slice(0, 10);
    const res = await fetch(`/api/workouts?start=${start}&end=${end}`);
    if (res.ok) setWorkouts(await res.json());
  };
  const handleDeleteWorkout = (workout: Workout) => {
    setPendingDeleteWorkout(workout);
  };
  const confirmDeleteWorkout = async () => {
    if (!pendingDeleteWorkout) return;
    await fetch('/api/workouts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: pendingDeleteWorkout._id }),
    });
    setPendingDeleteWorkout(null);
    // Refetch workouts
    const start = calendarRange[0].toISOString().slice(0, 10);
    const end = calendarRange[1].toISOString().slice(0, 10);
    const res = await fetch(`/api/workouts?start=${start}&end=${end}`);
    if (res.ok) setWorkouts(await res.json());
  };
  const cancelDeleteWorkout = () => setPendingDeleteWorkout(null);
  // Log workout from exercise list
  const logWorkoutFromExercise = (exerciseId: string) => {
    setLogForm({ exerciseId, sets: '', reps: '', weight: '' });
    setShowLogModal(true);
  };
  // Group exercises by category
  const exercisesByCategory = exercises.reduce((acc: Record<string, Exercise[]>, ex: Exercise) => {
    acc[ex.category] = acc[ex.category] || [];
    acc[ex.category].push(ex);
    return acc;
  }, {});

  // Modal overlay style
  const modalOverlay = "fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-200";
  const modalBox = "bg-white border-2 border-black rounded-xl p-6 shadow-brutal w-full max-w-md animate-fade-in";

  // Helper: is selected date today?
  const isToday = (() => {
    const now = new Date();
    return (
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear()
    );
  })();

  // Edit exercise modal handlers
  const openEditExercise = (exercise: Exercise) => {
    setEditExercise({ ...exercise });
    setShowEditExercise(true);
  };
  const closeEditExercise = () => {
    setShowEditExercise(false);
    setEditExercise(null);
  };
  const handleEditExerciseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditExercise((ex) => ex ? { ...ex, [e.target.name]: e.target.value } : ex);
  };
  const handleEditExerciseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editExercise) return;
    await fetch('/api/exercises', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: editExercise._id,
        name: editExercise.name,
        category: editExercise.category,
        notes: editExercise.notes,
      }),
    });
    closeEditExercise();
    // Refetch exercises
    const res = await fetch('/api/exercises');
    if (res.ok) setExercises(await res.json());
  };
  const handleDeleteExercise = (exercise: Exercise) => {
    setPendingDeleteExercise(exercise);
  };
  const confirmDeleteExercise = async () => {
    if (!pendingDeleteExercise) return;
    await fetch('/api/exercises', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: pendingDeleteExercise._id }),
    });
    setPendingDeleteExercise(null);
    // Refetch exercises
    const res = await fetch('/api/exercises');
    if (res.ok) setExercises(await res.json());
  };
  const cancelDeleteExercise = () => setPendingDeleteExercise(null);

  return (
    <div className="bg-white border-2 border-black rounded-xl p-6 shadow-brutal max-w-4xl mx-auto">
      <div className="flex gap-2 mb-8">
        <button
          className={`px-4 py-2 font-bold border-2 border-black rounded-lg shadow-brutal transition-colors duration-150 ${tab === 'calendar' ? 'bg-yellow-300' : 'bg-white hover:bg-yellow-100'}`}
          onClick={() => setTab('calendar')}
          tabIndex={0}
        >
          Calendar
        </button>
        <button
          className={`px-4 py-2 font-bold border-2 border-black rounded-lg shadow-brutal transition-colors duration-150 ${tab === 'exercises' ? 'bg-yellow-300' : 'bg-white hover:bg-yellow-100'}`}
          onClick={() => setTab('exercises')}
          tabIndex={0}
        >
          Exercises
        </button>
      </div>
      {tab === 'calendar' ? (
        <div className="p-6 border-2 border-black rounded-lg bg-yellow-50 shadow-brutal">
          <h2 className="text-2xl font-extrabold mb-4 tracking-tight">Workout Calendar</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Calendar
              onChange={handleCalendarChange}
              value={selectedDate}
              className="border-2 border-black rounded-lg shadow-brutal"
              tileClassName={({ date }) =>
                workoutDays.has(date.toISOString().slice(0, 10)) ? 'bg-yellow-200 font-bold' : ''
              }
              onActiveStartDateChange={handleActiveStartDateChange}
              maxDate={new Date()}
            />
            <div className="flex-1 w-full">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold">Workouts for {selectedDate.toDateString()}</h3>
              </div>
              {loading ? (
                <div className="h-24 flex items-center justify-center text-gray-400">Loading...</div>
              ) : workoutsForDay.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-gray-400 italic">No workouts logged for this day.</div>
              ) : (
                <ul className="mt-2 space-y-2">
                  {workoutsForDay.map((w, i) => (
                    <li key={w._id || i} className="border-2 border-black rounded-lg p-3 bg-white shadow-brutal flex items-center justify-between group transition-all">
                      <div>
                        <span className="font-bold text-base">
                          {exercises.find(e => e._id === w.exerciseId)?.name || 'Exercise'}
                        </span> <span className="text-gray-500">— {w.sets} sets × {w.reps} reps @ {w.weight}kg</span>
                      </div>
                      <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          className="px-2 py-1 border-2 border-black rounded-lg bg-yellow-200 font-bold shadow-brutal hover:bg-yellow-300 transition-colors"
                          onClick={() => openEditWorkout(w)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="px-2 py-1 border-2 border-black rounded-lg bg-red-300 font-bold shadow-brutal hover:bg-red-400 transition-colors"
                          onClick={() => handleDeleteWorkout(w)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {showEditWorkout && editWorkout && (
            <div className={modalOverlay}>
              <div className={modalBox}>
                <h3 className="text-lg font-bold mb-4">Edit Workout</h3>
                <form onSubmit={handleEditWorkoutSubmit} className="flex flex-col gap-3">
                  <label>
                    Exercise:
                    <select
                      name="exerciseId"
                      value={editWorkout.exerciseId}
                      onChange={handleEditWorkoutChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                      required
                    >
                      <option value="">Select exercise</option>
                      {exercises.map((ex: Exercise) => (
                        <option key={ex._id} value={ex._id}>{ex.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Sets:
                    <input
                      name="sets"
                      type="number"
                      min="1"
                      value={editWorkout.sets}
                      onChange={handleEditWorkoutChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </label>
                  <label>
                    Reps:
                    <input
                      name="reps"
                      type="number"
                      min="1"
                      value={editWorkout.reps}
                      onChange={handleEditWorkoutChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </label>
                  <label>
                    Weight (kg):
                    <input
                      name="weight"
                      type="number"
                      min="0"
                      value={editWorkout.weight}
                      onChange={handleEditWorkoutChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </label>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 border-2 border-black rounded-lg bg-yellow-300 font-bold shadow-brutal hover:bg-yellow-400 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border-2 border-black rounded-lg bg-white font-bold shadow-brutal hover:bg-yellow-100 transition-colors"
                      onClick={closeEditWorkout}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {pendingDeleteWorkout && isToday && (
            <div className={modalOverlay}>
              <div className={modalBox + ' max-w-xs text-center'}>
                <h3 className="text-lg font-bold mb-4">Delete Workout?</h3>
                <p className="mb-4">Are you sure you want to delete this workout? This cannot be undone.</p>
                <div className="flex gap-2 justify-center">
                  <button
                    className="px-4 py-2 border-2 border-black rounded-lg bg-red-400 font-bold shadow-brutal hover:bg-red-600 text-white"
                    onClick={confirmDeleteWorkout}
                  >
                    Delete
                  </button>
                  <button
                    className="px-4 py-2 border-2 border-black rounded-lg bg-white font-bold shadow-brutal hover:bg-yellow-100"
                    onClick={cancelDeleteWorkout}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 border-2 border-black rounded-lg bg-yellow-50 shadow-brutal">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <button
                className={`px-4 py-2 border-2 border-black rounded-lg bg-yellow-200 font-bold shadow-brutal hover:bg-yellow-300 transition-colors ${!isToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isToday && setShowAddExercise(true)}
                disabled={!isToday}
                title={!isToday ? 'You can only add exercises for today.' : 'Add Exercise'}
              >
                + Add Exercise
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(exercisesByCategory).map(([category, exs]) => (
                <div key={category} className="border-2 border-black rounded-lg p-4 bg-white shadow-brutal">
                  <h3 className="font-bold mb-2">{category}</h3>
                  <ul className="flex flex-col gap-2">
                    {exs.map((ex: Exercise) => (
                      <li key={ex._id} className="flex items-center justify-between gap-2">
                        <span>{ex.name}</span>
                        <div className="flex gap-1">
                          <button
                            className={`px-2 py-1 border-2 border-black rounded-lg bg-blue-200 font-bold shadow-brutal hover:bg-blue-300 transition-colors ${!isToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => isToday && openEditExercise(ex)}
                            disabled={!isToday}
                            title={!isToday ? 'You can only edit exercises for today.' : 'Edit Exercise'}
                          >
                            ✏️
                          </button>
                          <button
                            className={`px-2 py-1 border-2 border-black rounded-lg bg-red-300 font-bold shadow-brutal hover:bg-red-400 transition-colors ${!isToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => isToday && handleDeleteExercise(ex)}
                            disabled={!isToday}
                            title={!isToday ? 'You can only delete exercises for today.' : 'Delete Exercise'}
                          >
                            🗑️
                          </button>
                          <button
                            className={`px-2 py-1 border-2 border-black rounded-lg bg-green-200 font-bold shadow-brutal hover:bg-green-300 transition-colors ${!isToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => isToday && logWorkoutFromExercise(ex._id)}
                            disabled={!isToday}
                            title={!isToday ? 'You can only log workouts for today.' : 'Log Workout'}
                          >
                            ➕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          {showAddExercise && isToday && (
            <div className={modalOverlay}>
              <div className={modalBox}>
                <h3 className="text-lg font-bold mb-4">Add Exercise</h3>
                <form onSubmit={handleAddExerciseSubmit} className="flex flex-col gap-3">
                  <label>
                    Name:
                    <input
                      name="name"
                      value={addExerciseForm.name}
                      onChange={handleAddExerciseChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </label>
                  <label>
                    Category:
                    <input
                      name="category"
                      value={addExerciseForm.category}
                      onChange={handleAddExerciseChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </label>
                  <label>
                    Notes:
                    <textarea
                      name="notes"
                      value={addExerciseForm.notes}
                      onChange={handleAddExerciseChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                    />
                  </label>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 border-2 border-black rounded-lg bg-yellow-300 font-bold shadow-brutal hover:bg-yellow-400 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border-2 border-black rounded-lg bg-white font-bold shadow-brutal hover:bg-yellow-100 transition-colors"
                      onClick={closeAddExercise}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {showEditExercise && isToday && editExercise && (
            <div className={modalOverlay}>
              <div className={modalBox}>
                <h3 className="text-lg font-bold mb-4">Edit Exercise</h3>
                <form onSubmit={handleEditExerciseSubmit} className="flex flex-col gap-3">
                  <label>
                    Name:
                    <input
                      name="name"
                      value={editExercise.name}
                      onChange={handleEditExerciseChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </label>
                  <label>
                    Category:
                    <input
                      name="category"
                      value={editExercise.category}
                      onChange={handleEditExerciseChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </label>
                  <label>
                    Notes:
                    <textarea
                      name="notes"
                      value={editExercise.notes}
                      onChange={handleEditExerciseChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                    />
                  </label>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 border-2 border-black rounded-lg bg-yellow-300 font-bold shadow-brutal hover:bg-yellow-400 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border-2 border-black rounded-lg bg-white font-bold shadow-brutal hover:bg-yellow-100 transition-colors"
                      onClick={closeEditExercise}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {showLogModal && isToday && (
            <div className={modalOverlay}>
              <div className={modalBox}>
                <h3 className="text-lg font-bold mb-4">Log Workout</h3>
                <form onSubmit={handleLogSubmit} className="flex flex-col gap-3">
                  <label>
                    Sets:
                    <input
                      name="sets"
                      type="number"
                      min="1"
                      value={logForm.sets}
                      onChange={handleLogChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </label>
                  <label>
                    Reps:
                    <input
                      name="reps"
                      type="number"
                      min="1"
                      value={logForm.reps}
                      onChange={handleLogChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </label>
                  <label>
                    Weight (kg):
                    <input
                      name="weight"
                      type="number"
                      min="0"
                      value={logForm.weight}
                      onChange={handleLogChange}
                      className="w-full border-2 border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </label>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 border-2 border-black rounded-lg bg-yellow-300 font-bold shadow-brutal hover:bg-yellow-400 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border-2 border-black rounded-lg bg-white font-bold shadow-brutal hover:bg-yellow-100 transition-colors"
                      onClick={closeLogModal}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {pendingDeleteExercise && isToday && (
            <div className={modalOverlay}>
              <div className={modalBox + ' max-w-xs text-center'}>
                <h3 className="text-lg font-bold mb-4">Delete Exercise?</h3>
                <p className="mb-4">Are you sure you want to delete <span className="font-bold">{pendingDeleteExercise.name}</span>?<br/>This cannot be undone.</p>
                <div className="flex gap-2 justify-center">
                  <button
                    className="px-4 py-2 border-2 border-black rounded-lg bg-red-400 font-bold shadow-brutal hover:bg-red-600 text-white"
                    onClick={confirmDeleteExercise}
                  >
                    Delete
                  </button>
                  <button
                    className="px-4 py-2 border-2 border-black rounded-lg bg-white font-bold shadow-brutal hover:bg-yellow-100"
                    onClick={cancelDeleteExercise}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 