import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export async function GET(request, { params }) {
  try {
    await client.connect();
    const tasksCollection = client.db('event-planner').collection('tasks');
    const tasks = await tasksCollection.find({ eventId: params.id }).toArray();
    await client.close();
    
    return new Response(JSON.stringify(tasks), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { eventId, task } = await request.json();

    if (!eventId || !task) {
      return new Response(JSON.stringify({ message: 'Event ID and task are required' }), { status: 400 });
    }

    await client.connect();
    const tasksCollection = client.db('event-planner').collection('tasks');
    const result = await tasksCollection.insertOne({ eventId, task });

    await client.close();
    return new Response(JSON.stringify({ message: 'Task added', taskId: result.insertedId }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
