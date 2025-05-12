import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import Todo from '@/models/Todo';

// Connect to MongoDB
await connectToDB();

export async function PATCH(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  try {
    const { isCompleted } = await request.json();
    
    if (typeof isCompleted === 'undefined') {
      return NextResponse.json(
        { error: 'isCompleted is required' },
        { status: 400 }
      );
    }

    // TODO: Add user authentication
    const userId = 'demo-user';

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      { isCompleted },
      { new: true }
    );

    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  try {
    // TODO: Add user authentication
    const userId = 'demo-user';

    const todo = await Todo.findOneAndDelete({
      _id: id,
      userId
    });

    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
