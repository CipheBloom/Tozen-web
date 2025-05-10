import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url!);
  const date = url.searchParams.get("date"); // YYYY-MM-DD
  const client = await clientPromise;
  const db = client.db();
  const query: unknown = { userId: session.user.email };
  if (date) query.date = date;
  const workouts = await db.collection("workouts").find(query).toArray();
  return new Response(JSON.stringify(workouts), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const { date, exerciseId, sets, reps, weight } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection("workouts").insertOne({
    userId: session.user.email,
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const { _id } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection("workouts").deleteOne({ _id: new (import('mongodb').ObjectId)(_id), userId: session.user.email });
  return new Response("OK", { status: 200 });
} 