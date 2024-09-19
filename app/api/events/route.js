// app/api/events/route.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export async function POST(req) {
  const { name, details, host, date, location } = await req.json();

  if (!name || !details || !host || !date || !location) {
    return new Response(JSON.stringify({ message: 'All fields are required' }), { status: 400 });
  }
s
  try {
    await client.connect();
    const database = client.db('eventPlanner');
    const events = database.collection('events');

    const result = await events.insertOne({ name, details, host, date, location });

    return new Response(JSON.stringify({ message: 'Event added', eventId: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error('Failed to save event:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  } finally {
    await client.close();
  }
}
