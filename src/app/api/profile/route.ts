import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { action, image, name } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection("users").findOne({ email: session.user.email });

  // Ensure images array exists
  let images: string[] = Array.isArray(user?.images) ? user.images : [];
  let selectedImage = user?.selectedImage || '';

  if (action === 'add' && image) {
    if (!images.includes(image)) images.push(image);
    selectedImage = image; // auto-select new
  } else if (action === 'delete' && image) {
    images = images.filter((img) => img !== image);
    if (selectedImage === image) selectedImage = images[0] || '';
  } else if (action === 'select' && image) {
    if (images.includes(image)) selectedImage = image;
  } else if (action === 'updateName' && name) {
    // Optional: update name
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { name } }
    );
  }

  await db.collection("users").updateOne(
    { email: session.user.email },
    { $set: { images, selectedImage } }
  );

  // Fetch and return the updated user
  const updatedUser = await db.collection("users").findOne({ email: session.user.email });
  return new Response(JSON.stringify(updatedUser), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function GET(req: Request) {
  const url = new URL(req.url!);
  const email = url.searchParams.get("email");
  if (!email) return new Response("Missing email", { status: 400 });
  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection("users").findOne({ email });
  if (!user) return new Response("Not found", { status: 404 });
  // Only return images and selectedImage, plus name/email
  const { images = [], selectedImage = '', name = '', email: userEmail = '' } = user;
  return new Response(JSON.stringify({ images, selectedImage, name, email: userEmail }), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  const client = await clientPromise;
  const db = client.db();
  await db.collection("users").deleteOne({ email: session.user.email });
  // Optionally, delete other user-related data from other collections here
  return new Response("Deleted", { status: 200 });
}