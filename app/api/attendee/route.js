import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function POST(request) {
    try {
        await client.connect();
        const db = client.db('event-planner');
        const attendeesCollection = db.collection('attendees');

        const attendeeData = await request.json();
        
        // Validate the data
        if (!attendeeData.eventId || !attendeeData.attendee_name || !attendeeData.email) {
            return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
        }

        // Convert eventId to ObjectId
        attendeeData.eventId = new ObjectId(attendeeData.eventId);

        // Insert the attendee data
        const result = await attendeesCollection.insertOne(attendeeData);

        if (result.acknowledged) {
            return new Response(JSON.stringify({ message: 'Attendee added successfully', id: result.insertedId }), { status: 201 });
        } else {
            return new Response(JSON.stringify({ message: 'Failed to add attendee' }), { status: 500 });
        }
    } catch (error) {
        console.error('Error in POST /api/attendee:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    } finally {
        await client.close();
    }
}

export async function GET(request) {
    try {
        await client.connect();
        const db = client.db('event-planner');
        const attendeesCollection = db.collection('attendees');

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return new Response(JSON.stringify({ message: 'Event ID is required' }), { status: 400 });
        }

        const attendees = await attendeesCollection.find({ eventId: new ObjectId(eventId) }).toArray();

        return new Response(JSON.stringify(attendees), { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/attendee:', error);
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
