import TodoList from '@/components/TodoList';

export default function TodoPage() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white border-2 border-black rounded-md p-6 shadow-brutal">
        <h1 className="text-2xl font-extrabold mb-6">Todo</h1>
        <TodoList />
      </div>
    </div>
  );
} 