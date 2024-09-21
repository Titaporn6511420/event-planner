import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

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
    console.error('Error in GET method:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, details, host, date, time, location } = body; // Include time field

    if (!name || !details || !host || !date || !time || !location) { // Validate time
      return new Response(JSON.stringify({ message: 'All fields are required' }), { status: 400 });
    }

    await client.connect();
    const events = client.db('event-planner').collection('events');
    const result = await events.insertOne(body);

    await client.close();
    return new Response(JSON.stringify({ message: 'Event added', eventId: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error('Error in POST method:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { _id, name, details, host, date, time, location } = body; // Include time field

    if (!_id || !name || !details || !host || !date || !time || !location) { // Validate time
      return new Response(JSON.stringify({ message: 'All fields are required' }), { status: 400 });
    }

    await client.connect();
    const events = client.db('event-planner').collection('events');
    const result = await events.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: { name, details, host, date, time, location } }, // Update time field
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

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ message: 'ID is required' }), { status: 400 });
    }

    await client.connect();
    const db = client.db('event-planner');
    const collection = db.collection('events');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      return new Response(JSON.stringify({ message: 'Event deleted' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: 'Event not found' }), { status: 404 });
    }
  } catch (error) {
    console.error('Error in DELETE API:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  } finally {
    await client.close();
  }
}
