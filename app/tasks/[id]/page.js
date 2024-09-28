"use client"; // Indicate that this is a client-side component

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TaskPage({ params }) {
    const { id } = params; // Get the event ID from URL parameters
    const router = useRouter(); // Hook for programmatic navigation
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetchTasks();
    }, [id]);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`/api/tasks?eventId=${id}`);
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            } else {
                console.error('Failed to fetch tasks');
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleEdit = (taskId) => {
        // Navigate to an edit page or open a modal for editing
        router.push(`/edit-task/${id}/${taskId}`);
    };

    const handleDelete = async (taskId) => {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await fetch(`/api/tasks?id=${taskId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    // Refresh the task list
                    fetchTasks();
                } else {
                    console.error('Failed to delete task');
                }
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    return (
        <div className="task-page">
            {/* Header Navigation */}
            <nav className="navbar">
                <div className="logo">
                    <span className="logo-event">Event</span>
                    <span className="logo-planner">Planner.</span>
                </div>
                <div className="nav-links">
                    <button onClick={() => router.push('/')}>Home</button>
                    <button onClick={() => router.push(`/attendee/${id}`)}>Attendees</button>
                    <button onClick={() => router.push(`/tasks/${id}`)} className="active">Tasks</button>
                </div>
            </nav>

            {/* Task Section */}
            <div className="tasks-header">
                <h2>Track Tasks</h2>
                <Link href={`/add-task/${id}`}>
                    <button className="add-task-btn">+ Add new task</button>
                </Link>
            </div>

            <div className="tasks-table">
                <table>
                    <thead>
                        <tr>
                            <th>Task name</th>
                            <th>Details</th>
                            <th>Time</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => (
                            <tr key={task._id}>
                                <td>{task.task_name}</td>
                                <td>{task.detail}</td>
                                <td>{task.time}</td>
                                <td>
                                    <button onClick={() => handleEdit(task._id)}>📝</button>
                                    <button onClick={() => handleDelete(task._id)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .task-page {
                    font-family: 'Jost', sans-serif;
                    padding: 20px;
                }

                /* Header Styling */
                .navbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    background-color: #f8f8f8;
                    border-radius: 0 0 20px 20px;
                    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
                    margin-bottom: 20px;
                }
                .logo {
                    display: flex;
                    align-items: center;
                }
                .logo-event {
                    font-weight: bold;
                    font-size: 24px;
                    color: #6A4BFF;
                }
                .logo-planner {
                    font-weight: 600;
                    font-size: 24px;
                    color: #333;
                    margin-left: 5px;
                }
                .nav-links {
                    display: flex;
                    gap: 20px;
                }
                .nav-links button {
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    color: #333;
                }
                .nav-links button.active {
                    color: #6A4BFF;
                }
                .nav-links button:hover {
                    text-decoration: underline;
                }

                /* Task Header and Table Styling */
                .tasks-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .tasks-header h2 {
                    font-size: 24px;
                    font-weight: 600;
                }
                .add-task-btn {
                    background-color: #6A4BFF;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background-color 0.3s ease;
                }
                .add-task-btn:hover {
                    background-color: #5a3fd1;
                }

                .tasks-table {
                    border-radius: 20px;
                    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    background-color: #fff;
                }
                .tasks-table h3 {
                    margin-bottom: 10px;
                    font-size: 18px;
                    font-weight: 500;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                th, td {
                    text-align: left;
                    padding: 12px;
                }
                th {
                    font-weight: bold;
                    background-color: #f9f9f9;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }

                .edit-btn, .delete-btn {
                    padding: 5px 10px;
                    margin: 0 5px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .edit-btn {
                    background-color: #4CAF50;
                    color: white;
                }

                .delete-btn {
                    background-color: #f44336;
                    color: white;
                }

                .edit-btn:hover, .delete-btn:hover {
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
}
