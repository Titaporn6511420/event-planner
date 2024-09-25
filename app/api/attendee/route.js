// app/api/attendee/route.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    try {
        await client.connect();
        const attendeesCollection = client.db('event-planner').collection('attendees');

        // Fetch attendees by event ID
        const attendees = await attendeesCollection.find({ eventId }).toArray();
        return new Response(JSON.stringify(attendees), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in GET method:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    } finally {
        await client.close();
    }
}

export async function PUT(request) {
    const { foodCost, attendees } = await request.json(); // Adjust this as needed
    try {
        await client.connect();
        const attendeesCollection = client.db('event-planner').collection('attendees');

        // You might want to update food cost in a different manner, 
        // depending on how you structure your data.
        // This is just a simple example of how to loop through attendees
        // and update their food cost (if you have such a field).

        const updatePromises = attendees.map(attendee =>
            attendeesCollection.updateOne(
                { _id: attendee._id },
                { $set: { foodCost } } // Adjust this to include relevant fields you want to update
            )
        );

        await Promise.all(updatePromises);

        return new Response(JSON.stringify({ message: 'Attendees updated successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error in PUT method:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    } finally {
        await client.close();
    }
}
