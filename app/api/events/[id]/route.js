import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request, { params }) {
    try {
        await client.connect();
        const events = client.db('event-planner').collection('events');

        const event = await events.findOne({ _id: new ObjectId(params.id) });

        if (!event) {
            return new Response(JSON.stringify({ message: 'Event not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(event), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching event by ID:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    } finally {
        await client.close();
    }
}
