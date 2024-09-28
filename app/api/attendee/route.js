import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function POST(request) {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('event-planner');
        const attendeesCollection = db.collection('attendees');

        const attendeeData = await request.json();
        console.log('Received attendee data:', attendeeData);
        
        // Validate the data
        if (!attendeeData.eventId || !attendeeData.attendee_name || !attendeeData.email) {
            console.log('Missing required fields');
            return new Response(JSON.stringify({ message: 'Missing required fields' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Convert eventId to ObjectId
        try {
            attendeeData.eventId = new ObjectId(attendeeData.eventId);
        } catch (error) {
            console.log('Invalid eventId:', attendeeData.eventId);
            return new Response(JSON.stringify({ message: 'Invalid eventId' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get the current food cost for this event
        const eventAttendee = await attendeesCollection.findOne({ eventId: attendeeData.eventId });
        if (eventAttendee && eventAttendee.foodCost !== undefined) {
            attendeeData.foodCost = eventAttendee.foodCost;
        } else {
            attendeeData.foodCost = 0; // Set a default value if no existing food cost
        }

        console.log('Inserting attendee data:', attendeeData);

        // Insert the attendee data
        const result = await attendeesCollection.insertOne(attendeeData);

        if (result.acknowledged) {
            console.log('Attendee added successfully');
            return new Response(JSON.stringify({ message: 'Attendee added successfully', id: result.insertedId }), { 
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            console.log('Failed to add attendee');
            return new Response(JSON.stringify({ message: 'Failed to add attendee' }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Error in POST /api/attendee:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.toString() }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
    }
}

export async function GET(request) {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('event-planner');
        const attendeesCollection = db.collection('attendees');

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return new Response(JSON.stringify({ message: 'Event ID is required' }), { status: 400 });
        }

        console.log('Querying for eventId:', eventId);

        const attendees = await attendeesCollection.find({ eventId: new ObjectId(eventId) }).toArray();

        console.log('Found attendees:', attendees);

        return new Response(JSON.stringify(attendees), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error in GET /api/attendee:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.toString() }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
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
        } else {
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