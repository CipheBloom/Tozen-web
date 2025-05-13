import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { connectToDB } from '@/lib/mongoose';
import Plan from '@/models/Plan';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// Connect to MongoDB
await connectToDB();

export async function GET() {
  try {
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const plans = await Plan.find({ userId: session.user.id }).lean();
    // Convert ObjectId to string for the client
    const serializedPlans = plans.map(plan => ({
      ...plan,
      _id: plan._id.toString(),
      scheduledTasks: Object.entries(plan.scheduledTasks).reduce((acc, [day, tasks]) => ({
        ...acc,
        [day]: tasks.map(task => ({
          ...task,
          _id: task._id?.toString(),
          time: task.time ? new Date(task.time).toISOString() : undefined
        }))
      }), {})
    }));
    return NextResponse.json(serializedPlans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const newPlan = new Plan({
      ...body,
      userId: session.user.id,
      scheduledTasks: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      },
    });

    const savedPlan = await newPlan.save();
    // Convert ObjectId to string for the client
    const serializedPlan = {
      ...savedPlan.toObject(),
      _id: savedPlan._id.toString(),
      scheduledTasks: Object.entries(savedPlan.scheduledTasks).reduce((acc, [day, tasks]) => ({
        ...acc,
        [day]: tasks.map(task => ({
          ...task,
          _id: task._id?.toString(),
          time: task.time ? new Date(task.time).toISOString() : undefined
        }))
      }), {})
    };
    return NextResponse.json(serializedPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}
