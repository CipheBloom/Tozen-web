import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!; // Set this in your .env.local
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable so the value is preserved across module reloads
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production, create a new client for every connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise; 