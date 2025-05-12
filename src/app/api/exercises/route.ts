import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const client = await clientPromise;
  const db = client.db();
  const exercises = await db.collection("exercises").find({ userId: session.user.email }).toArray();
  return new Response(JSON.stringify(exercises), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const { name, category, notes } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection("exercises").insertOne({
    userId: session.user.email,
    name,
    category,
    notes,
    createdAt: new Date(),
  });
  return new Response(JSON.stringify({ _id: result.insertedId }), { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const { _id, name, category, notes } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection("exercises").updateOne(
    { _id: new ObjectId(_id), userId: session.user.email },
    { $set: { name, category, notes } }
  );
  return new Response("OK", { status: 200 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const { _id } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection("exercises").deleteOne({ _id: new ObjectId(_id), userId: session.user.email });
  return new Response("OK", { status: 200 });
} 