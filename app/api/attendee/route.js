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

        // List all indexes before insertion
        const indexesBefore = await attendeesCollection.indexes();
        console.log('Indexes before insertion:', indexesBefore);

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
        if (error.code === 11000) {
            // This is a duplicate key error
            const indexes = await client.db('event-planner').collection('attendees').indexes();
            console.log('Current indexes:', indexes);
            return new Response(JSON.stringify({ 
                message: 'Duplicate email detected',
                error: error.toString(),
                indexes: indexes
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
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
        const action = searchParams.get('action');

        if (action === 'manageIndexes') {
            // List all indexes
            const indexes = await attendeesCollection.indexes();
            console.log('Current indexes:', indexes);

            // Drop all non-_id indexes
            for (const index of indexes) {
                if (index.name !== '_id_') {
                    await attendeesCollection.dropIndex(index.name);
                    console.log(`Dropped index: ${index.name}`);
                }
            }

            // List indexes again to confirm
            const updatedIndexes = await attendeesCollection.indexes();

            return new Response(JSON.stringify({ 
                message: 'Index management complete',
                originalIndexes: indexes,
                updatedIndexes: updatedIndexes
            }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

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
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('event-planner');
        const attendeesCollection = db.collection('attendees');

        const body = await request.json();
        console.log('Received body:', JSON.stringify(body, null, 2));

        if (body.attendee) {
            // Individual attendee update
            const { _id, ...updateData } = body.attendee;
            console.log('Updating attendee with _id:', _id);
            console.log('Update data:', updateData);

            const result = await attendeesCollection.findOneAndUpdate(
                { _id: new ObjectId(_id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );

            console.log('Update result:', result);

            if (result.value) {
                return new Response(JSON.stringify({ message: 'Attendee updated successfully', attendee: result.value }), { 
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                return new Response(JSON.stringify({ message: 'Attendee not found' }), { 
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } else if (body.eventId && body.foodCost && body.attendees) {
            // Bulk update for food cost
            const { eventId, foodCost, attendees } = body;
            console.log('Updating food cost for event:', eventId);
            console.log('New food cost:', foodCost);

            const bulkOps = attendees.map(attendee => ({
                updateOne: {
                    filter: { _id: new ObjectId(attendee._id) },
                    update: { $set: { foodCost: foodCost } }
                }
            }));

            const result = await attendeesCollection.bulkWrite(bulkOps);

            console.log('Bulk update result:', result);

            if (result.modifiedCount > 0) {
                return new Response(JSON.stringify({ message: 'Food cost updated successfully', modifiedCount: result.modifiedCount }), { 
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                return new Response(JSON.stringify({ message: 'No attendees were updated' }), { 
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
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
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