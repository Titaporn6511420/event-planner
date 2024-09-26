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
    try {
        await client.connect();
        const attendeesCollection = client.db('event-planner').collection('attendees');

        const body = await request.json();
        console.log('Received body:', JSON.stringify(body, null, 2));

        if (body.attendee) {
            // Individual attendee update
            const { _id, ...updateData } = body.attendee;
            const result = await attendeesCollection.updateOne(
                { _id: new ObjectId(_id) },
                { $set: updateData }
            );

            if (result.modifiedCount === 1) {
                return new Response(JSON.stringify({ message: 'Attendee updated successfully' }), { 
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                return new Response(JSON.stringify({ message: 'Attendee not found or not modified' }), { 
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } else if (body.eventId && body.foodCost !== undefined && Array.isArray(body.attendees)) {
            // Bulk update for food cost
            const updatePromises = body.attendees.map(attendee =>
                attendeesCollection.updateOne(
                    { _id: new ObjectId(attendee._id) },
                    { $set: { foodCost: body.foodCost } }
                )
            );

            await Promise.all(updatePromises);
            return new Response(JSON.stringify({ message: 'Attendees updated successfully' }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            console.log('Invalid request data:', JSON.stringify(body, null, 2));
            return new Response(JSON.stringify({ message: 'Invalid request data' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Error in PUT method:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.toString() }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        await client.close();
    }
}

export async function DELETE(request) {
    try {
        await client.connect();
        const attendeesCollection = client.db('event-planner').collection('attendees');

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ message: 'Attendee ID is required' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const result = await attendeesCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            return new Response(JSON.stringify({ message: 'Attendee deleted successfully' }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ message: 'Attendee not found' }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Error in DELETE method:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        await client.close();
    }
}
