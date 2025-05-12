import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDB } from '@/lib/mongoose';
import Plan from '@/models/Plan';
import { Types } from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view this plan.' },
        { status: 401 }
      );
    }

    const plan = await Plan.findOne({
      _id: new Types.ObjectId(params.id),
      userId: session.user.email,
    }).lean();

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Convert ObjectId to string for the client
    const serializedPlan = {
      ...plan,
      _id: plan._id.toString(),
      scheduledTasks: Object.entries(plan.scheduledTasks).reduce((acc, [day, tasks]) => ({
        ...acc,
        [day]: (tasks as Array<{ _id?: Types.ObjectId; time?: Date; [key: string]: any }>).map(task => ({
          ...task,
          _id: task._id?.toString(),
          time: task.time ? new Date(task.time).toISOString() : undefined
        }))
      }), {})
    };

    return NextResponse.json(serializedPlan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to update this plan.' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { title, description, duration, difficulty, scheduledTasks } = data as {
      title: string;
      description: string;
      duration: string;
      difficulty: string;
      scheduledTasks: Record<string, Array<{
        _id?: string;
        title: string;
        type: string;
        time?: string | Date;
      }>>;
    };

    const updateData = {
      title,
      description,
      duration,
      difficulty,
      scheduledTasks: Object.entries(scheduledTasks).reduce<Record<string, Array<{
        _id: Types.ObjectId;
        title: string;
        type: string;
        time?: Date;
      }>>>((acc, [day, tasks]) => {
        acc[day] = tasks.map(task => ({
          _id: task._id ? new Types.ObjectId(task._id) : new Types.ObjectId(),
          title: task.title,
          type: task.type,
          time: task.time ? new Date(task.time) : undefined
        }));
        return acc;
      }, {}),
      updatedAt: new Date(),
    };

    const updatedPlan = await Plan.findOneAndUpdate(
      { _id: new Types.ObjectId(params.id), userId: session.user.email },
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    if (!updatedPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Convert ObjectId to string for the client
    const serializedPlan = {
      ...updatedPlan,
      _id: updatedPlan._id.toString(),
      scheduledTasks: Object.entries(updatedPlan.scheduledTasks).reduce((acc, [day, tasks]) => ({
        ...acc,
        [day]: (tasks as Array<{ _id?: Types.ObjectId; time?: Date; [key: string]: any }>).map(task => ({
          ...task,
          _id: task._id?.toString(),
          time: task.time ? new Date(task.time).toISOString() : undefined
        }))
      }), {})
    };

    return NextResponse.json(serializedPlan);
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete this plan.' },
        { status: 401 }
      );
    }

    const deletedPlan = await Plan.findOneAndDelete({
      _id: new Types.ObjectId(params.id),
      userId: session.user.email,
    });

    if (!deletedPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}
