'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';

interface TodoItem {
  _id: string;
  title: string;
  isCompleted: boolean;
  date: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos from API on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/todos?date=${today}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch todos');
        }
        
        const data = await response.json();
        setTodos(data);
      } catch (err) {
        console.error('Error loading todos:', err);
        setError(err instanceof Error ? err.message : 'Failed to load todos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTodo.trim(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add todo');
      }
      
      const newTodoItem: TodoItem = await response.json();
      setTodos(prevTodos => [...prevTodos, newTodoItem]);
      setNewTodo('');
    } catch (err) {
      console.error('Error adding todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to add todo');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      setError(null);
      const todoToUpdate = todos.find(todo => todo._id === id);
      if (!todoToUpdate) return;
      
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCompleted: !todoToUpdate.isCompleted,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update todo');
      }
      
      const updatedTodo: TodoItem = await response.json();
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo._id === id ? updatedTodo : todo
        )
      );
    } catch (err) {
      console.error('Error toggling todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete todo');
      }
      
      setTodos(prevTodos => prevTodos.filter(todo => todo._id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  const completedCount = todos.filter(todo => todo.isCompleted).length;
  const totalCount = todos.length;

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border-2 border-black rounded-lg shadow-brutal">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiCheckCircle className="text-gray-900 mr-2" size={24} />
            <h2 className="text-xl font-extrabold">Today's Tasks</h2>
          </div>
          <div className="px-3 py-1 bg-white border-2 border-black rounded-full text-sm font-bold shadow-brutal-sm">
            {completedCount}/{totalCount}
          </div>
        </div>
      </div>

      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a task for today"
            className="w-full p-3 pl-4 pr-12 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 hover:text-black transition-colors"
            title="Add task"
          >
            <FiPlus size={20} />
          </button>
        </div>
      </form>

      {todos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-300 text-6xl mb-4">✓</div>
          <p className="text-gray-500 font-medium">No tasks for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todos.map((todo) => (
            <div
              key={todo._id}
              className={`flex items-center p-3 bg-white border-2 border-black rounded-lg shadow-brutal-sm ${
                todo.isCompleted ? 'opacity-70' : 'hover:shadow-brutal transition-shadow bg-white'
              }`}
            >
              <button
                onClick={() => toggleTodo(todo._id)}
                className="mr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={todo.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {todo.isCompleted ? (
                  <FiCheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <FiCircle className="w-5 h-5" />
                )}
              </button>
              <span
                className={`flex-1 ${todo.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}
              >
                {todo.title}
              </span>
              <button
                onClick={() => deleteTodo(todo._id)}
                className="text-gray-400 hover:text-red-500 focus:outline-none"
                aria-label="Delete todo"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
