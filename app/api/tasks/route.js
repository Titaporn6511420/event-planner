import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request) {
    try {
        await client.connect();
        const db = client.db('event-planner');
        const tasksCollection = db.collection('tasks');

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return new Response(JSON.stringify({ message: 'Event ID is required' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const tasks = await tasksCollection.find({ eventId: eventId }).toArray();
        console.log('Fetched tasks for eventId:', eventId, tasks); // Add this line for debugging

        return new Response(JSON.stringify(tasks), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error in GET /api/tasks:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        await client.close();
    }
}

export async function POST(request) {
    try {
        await client.connect();
        const db = client.db('event-planner');
        const tasksCollection = db.collection('tasks');

        const taskData = await request.json();
        
        // Validate the data
        if (!taskData.eventId || !taskData.task_name || !taskData.detail || !taskData.time) {
            return new Response(JSON.stringify({ message: 'Missing required fields' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Insert the task data
        const result = await tasksCollection.insertOne(taskData);

        if (result.acknowledged) {
            const newTask = await tasksCollection.findOne({ _id: result.insertedId });
            console.log('Inserted new task:', newTask); // Add this line for debugging
            return new Response(JSON.stringify(newTask), { 
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ message: 'Failed to add task' }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Error in POST /api/tasks:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.toString() }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        await client.close();
    }
}

export async function PUT(request) {
    try {
        await client.connect();
        const tasksCollection = client.db('event-planner').collection('tasks');

        const body = await request.json();
        console.log('Received body:', JSON.stringify(body, null, 2));

        const { _id, ...updateData } = body;
        const result = await tasksCollection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: updateData }
        );

        if (result.modifiedCount === 1) {
            return new Response(JSON.stringify({ message: 'Task updated successfully' }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ message: 'Task not found or not modified' }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Error in PUT /api/tasks:', error);
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
        const tasksCollection = client.db('event-planner').collection('tasks');

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ message: 'Task ID is required' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            return new Response(JSON.stringify({ message: 'Task deleted successfully' }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ message: 'Task not found' }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Error in DELETE /api/tasks:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        await client.close();
    }
}