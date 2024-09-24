import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function PUT(request, { params }) {
    try {
        await client.connect();
        const events = client.db('event-planner').collection('events');
        
        const eventId = params.id;

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
