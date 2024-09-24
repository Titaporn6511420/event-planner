"use client"; // Indicate that this is a client-side component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TaskPage({ params }) {
    const { id } = params; // Get the event ID from URL parameters
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter(); // Hook for programmatic navigation

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`/api/task?eventId=${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTasks(data);
            } catch (err) {
                console.error('Error fetching tasks:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [id]); // Ensure effect runs when id changes

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            {/* Navigation Bar */}
            <nav style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
                <button onClick={() => router.push('/')} style={{ marginRight: '10px' }}>Home</button>
                <button onClick={() => router.push(`/attendee/${id}`)}>Attendees</button>
                <button onClick={() => router.push(`/task/add?id=${id}`)}>Add New Task</button>
            </nav>

            <h1>Tasks for Event {id}</h1>
            <table>
                <thead>
                    <tr>
                        <th>Task Name</th>
                        <th>Description</th>
                        <th>Assigned To</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>
                                No tasks found.
                            </td>
                        </tr>
                    ) : (
                        tasks.map(task => (
                            <tr key={task._id}>
                                <td>{task.name}</td>
                                <td>{task.description}</td>
                                <td>{task.assignedTo}</td>
                                <td>{task.status}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
