import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // Retrieve the event ID

    await client.connect();
    const events = client.db('event-planner').collection('events');

    if (id) {
      // Fetch the specific event by ID
      const event = await events.findOne({ _id: new ObjectId(id) });
      if (event) {
        return new Response(JSON.stringify(event), {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ message: 'Event not found' }), { status: 404 });
      }
    } else {
      // Fetch all events
      const eventsList = await events.find({}).toArray();
      return new Response(JSON.stringify(eventsList), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in GET method:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  } finally {
    await client.close();
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

export async function PUT(request, { params }) {
  try {
    await client.connect();
    const events = client.db('event-planner').collection('events');
    
    const eventId = params.id; // Make sure this is correctly set from the URL

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
