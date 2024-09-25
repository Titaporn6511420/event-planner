import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request) {
  try {
    console.log('Starting GET request');
    await client.connect();
    console.log('Connected to MongoDB');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const searchTerm = searchParams.get('q');

    console.log('ID:', id);
    console.log('Search Term:', searchTerm);

    const eventsCollection = client.db('event-planner').collection('events');
    let query = {};

    // Check if an ID was provided
    if (id) {
      console.log('Fetching event by ID:', id);
      query = { _id: new ObjectId(id) };
    } 
    // Check if a search term was provided and is at least 1 character long
    else if (searchTerm && searchTerm.trim().length > 0) {
      if (searchTerm.length < 1) {
        console.log('Search term too short, returning all events');
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.log('Constructing search query for term:', searchTerm);
      query = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { details: { $regex: searchTerm, $options: 'i' } }
        ]
      };
    } else {
      console.log('No search term provided, fetching all events');
    }

    console.log('Query:', query);

    // Fetch the events based on the query
    const eventsList = await eventsCollection.find(query).toArray();
    console.log('Events fetched:', eventsList);

    return new Response(JSON.stringify(eventsList), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in GET method:', error.message);
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), { status: 500 });
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

export async function PUT(request, { params }) {
  try {
    await client.connect();
    const eventsCollection = client.db('event-planner').collection('events');

    const eventId = params.id; // Ensure this is correctly set from the URL
    console.log('Event ID:', eventId); // Log the event ID

    // Check if the ID is a valid ObjectId
    if (!ObjectId.isValid(eventId)) {
      return new Response(JSON.stringify({ message: 'Invalid Event ID' }), { status: 400 });
    }

    const body = await request.json();
    const { name, details, host, date, time, location } = body;

    // Perform update
    const result = await eventsCollection.findOneAndUpdate(
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
    const eventsCollection = client.db('event-planner').collection('events');

    const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });
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
