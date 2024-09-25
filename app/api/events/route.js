import dbConnect from '@/lib/db'; // Import the db connection function
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request) {
  try {
    await client.connect(); // Ensure MongoDB connection is established at the beginning

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const searchTerm = searchParams.get('q');

    const events = client.db('event-planner').collection('events');
    let query = {};

    if (id) {
      query = { _id: new ObjectId(id) };
    } else if (searchTerm) {
      query = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { details: { $regex: searchTerm, $options: 'i' } }
        ]
      };
    }

    const eventsList = await events.find(query).toArray();

    return new Response(JSON.stringify(eventsList), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in GET method:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  } finally {
    await client.close(); // Ensure the client is closed after the request is done
  }
}




export async function POST(request) {
  try {
    const body = await request.json();
    const { name, details, host, date, time, location } = body;

    // Validate fields
    if (!name || !details || !host || !date || !time || !location) {
      return new Response(JSON.stringify({ message: 'All fields are required' }), { status: 400 });
    }

    await client.connect();
    const events = client.db('event-planner').collection('events');
    const result = await events.insertOne(body);

    return new Response(JSON.stringify({ message: 'Event added', eventId: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error('Error in POST method:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}


export async function PUT(request, { params }) {
  try {
    await client.connect();
    const events = client.db('event-planner').collection('events');
    
    const eventId = params.id; // Make sure this is correctly set from the URL
    console.log('Event ID:', eventId); // Log the event ID

    // Check if the ID is a valid ObjectId
    if (!ObjectId.isValid(eventId)) {
      return new Response(JSON.stringify({ message: 'Invalid Event ID' }), { status: 400 });
    }

    const body = await request.json();
    const { name, details, host, date, time, location } = body;

    // Perform update
    const result = await events.findOneAndUpdate(
      { _id: new ObjectId(eventId) },
      { $set: { name, details, host, date, time, location } },
      { returnDocument: 'after' }
    );

    console.log('FindOneAndUpdate result:', result); // Log the result

    if (!result.value) {
      return new Response(JSON.stringify({ message: 'Event not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(result.value), { status: 200 });
  } catch (error) {
    console.error('Error updating event:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  } finally {
    await client.close();
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
