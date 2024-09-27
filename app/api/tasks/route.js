import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return new Response(JSON.stringify({ error: 'Event ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { db } = await connectToDatabase();
        const tasks = await db.collection('tasks').find({ eventId: new ObjectId(eventId) }).toArray();

        return new Response(JSON.stringify(tasks), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(request) {
    let client;
    try {
        console.log('Received request to add task');
        const { db, client } = await connectToDatabase();
        console.log('Connected to database');
        
        const taskData = await request.json();
        console.log('Received task data:', taskData);

        // Validate the incoming data
        if (!taskData.eventId || !taskData.task_name || !taskData.detail || !taskData.time) {
            return new Response(JSON.stringify({ message: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Convert eventId to ObjectId
        taskData.eventId = new ObjectId(taskData.eventId);

        const result = await db.collection('tasks').insertOne(taskData);
        console.log('Insert result:', result);

        if (result.acknowledged) {
            return new Response(JSON.stringify({ message: 'Task added successfully', id: result.insertedId }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            throw new Error('Failed to add task');
        }
    } catch (error) {
        console.error('Error in POST /api/tasks:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.toString() }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
}