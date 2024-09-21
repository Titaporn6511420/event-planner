import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export async function GET(request) {
  try {
    await client.connect();
    const events = client.db('event-planner').collection('events');
    const eventsList = await events.find({}).sort({ date: -1 }).toArray();

    await client.close();
    return new Response(JSON.stringify(eventsList), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in GET method:', error);  // Log the error to understand the issue
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}


export async function POST(request) {
  try {
    const body = await request.json();
    const { name, details, host, date, location } = body;

    if (!name || !details || !host || !date || !location) {
      return new Response(JSON.stringify({ message: 'All fields are required' }), { status: 400 });
    }

    await client.connect();
    const events = client.db('event-planner').collection('events');
    const result = await events.insertOne(body);

    await client.close();
    return new Response(JSON.stringify({ message: 'Event added', eventId: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error('Error in POST method:', error);  // Log the error for diagnosis
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}


export async function PUT(request) {
  try {
    const body = await request.json();
    const { _id, name, details, host, date, location } = body;

    if (!_id || !name || !details || !host || !date || !location) {
      return new Response(JSON.stringify({ message: 'All fields are required' }), { status: 400 });
    }

    await client.connect();
    const events = client.db('event-planner').collection('events');
    const result = await events.findOneAndUpdate(
      { _id: new ObjectId(_id) }, // Convert _id to ObjectId
      { $set: { name, details, host, date, location } },
      { returnDocument: 'after' }
    );

    await client.close();
    if (result.value) {
      return new Response(JSON.stringify({ message: 'Event updated', event: result.value }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: 'Event not found' }), { status: 404 });
    }
  } catch (error) {
    console.error('Error in PUT method:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ message: 'ID is required' }), { status: 400 });
    }

    await client.connect();
    const events = client.db('event-planner').collection('events');
    const result = await events.findOneAndDelete({ _id: new ObjectId(id) });

    await client.close();

    if (result.value) {
      return new Response(JSON.stringify({ message: 'Event deleted' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: 'Event not found' }), { status: 404 });
    }
  } catch (error) {
    console.error('Error in DELETE method:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}