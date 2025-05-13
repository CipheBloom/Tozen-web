import { getServerSession } from "next-auth/next";
import type { Session } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url!);
  const date = url.searchParams.get("date"); // YYYY-MM-DD
  const client = await clientPromise;
  const db = client.db();
  const query: Record<string, unknown> = { userId: session.user.id };
  if (date) query.date = date;
  const workouts = await db.collection("workouts").find(query).toArray();
  return new Response(JSON.stringify(workouts), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function POST(req: Request) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const { date, exerciseId, sets, reps, weight } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection("workouts").insertOne({
    userId: session.user.id,
    date, // YYYY-MM-DD
    exerciseId,
    sets,
    reps,
    weight,
    createdAt: new Date(),
  });
  return new Response(JSON.stringify({ _id: result.insertedId }), { status: 201 });
}

export async function DELETE(req: Request) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const { _id } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection("workouts").deleteOne({ _id: new ObjectId(_id), userId: session.user.id });
  return new Response("OK", { status: 200 });
}