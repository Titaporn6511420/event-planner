import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q'); // Get the search query from the URL

        console.log('Received search query:', query); // Log the search query

        await client.connect();
        console.log('Connected to MongoDB'); // Log connection success

        const eventsCollection = client.db('event-planner').collection('events');
        console.log('Accessed events collection'); // Log collection access

        let searchCriteria = {};
        if (query) {
            searchCriteria = {
                $or: [
                    { name: { $regex: query, $options: 'i' } }, // Search by event name
                    { description: { $regex: query, $options: 'i' } } // Or by description
                ]
            };
        }

        const eventsList = await eventsCollection.find(searchCriteria).toArray();
        console.log('Fetched events list:', eventsList); // Log fetched events

        return new Response(JSON.stringify(eventsList), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in GET method:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), { status: 500 });
    } finally {
        await client.close();
        console.log('MongoDB connection closed'); // Log connection closure
    }
}



export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, phone, foodAllergies } = body; // Assuming these fields for an attendee

        if (!name || !email || !phone) {
            return new Response(JSON.stringify({ message: 'Name, email, and phone are required' }), { status: 400 });
        }

        await client.connect();
        const attendees = client.db('event-planner').collection('attendees');
        const result = await attendees.insertOne(body);

        await client.close();
        return new Response(JSON.stringify({ message: 'Attendee added', attendeeId: result.insertedId }), { status: 201 });
    } catch (error) {
        console.error('Error in POST method:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { _id, ...updateData } = body; // Extract _id from the body

        if (!_id) {
            return new Response(JSON.stringify({ message: 'Attendee ID is required' }), { status: 400 });
        }

        await client.connect();
        const attendees = client.db('event-planner').collection('attendees');

        // Find and update the attendee by ID, returning the updated document
        const result = await attendees.findOneAndUpdate(
            { _id: new ObjectId(_id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        await client.close();

        if (result.value) {
            return new Response(JSON.stringify(result.value), { status: 200 });
        } else {
            return new Response(JSON.stringify({ message: 'Attendee not found' }), { status: 404 });
        }
    } catch (error) {
        console.error('Error in PUT method:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id } = await request.json(); // Parse the request body to get the ID

        if (!id) {
            return new Response(JSON.stringify({ message: 'Attendee ID is required' }), { status: 400 });
        }

        await client.connect();
        const attendees = client.db('event-planner').collection('attendees');

        const result = await attendees.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            return new Response(JSON.stringify({ message: 'Attendee deleted' }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ message: 'Attendee not found' }), { status: 404 });
        }
    } catch (error) {
        console.error('Error in DELETE method:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    } finally {
        await client.close();
    }
}
