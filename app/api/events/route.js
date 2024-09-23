import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim(); // Retrieve the search query

    await client.connect();
    console.log("Connected to MongoDB");

    const events = client.db('event-planner').collection('events');

    // Initialize an empty query object
    let query = {};

    // If the query exists and is more than 1 character, filter events
    if (q) {
      query = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { details: { $regex: q, $options: 'i' } }
        ]
      };
    }

    console.log("Executing MongoDB query:", query); // Log the query

    const eventsList = await events.find(query).sort({ date: 1 }).toArray();

    console.log('Fetched events:', eventsList); // Log the fetched events

    await client.close();
    return new Response(JSON.stringify(eventsList), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in GET method:', error); // Log the specific error
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
    const { _id, ...updateData } = body;

    await client.connect();
    const events = client.db('event-planner').collection('events');
    const result = await events.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    await client.close();
    if (result.value) {
      return new Response(JSON.stringify(result.value), { status: 200 });
    } else {
      return new Response("Event not found", { status: 404 });
    }
  } catch (error) {
    console.error('Error in PUT method:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request) {
  return PUT(request);
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
