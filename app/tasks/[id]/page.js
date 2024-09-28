"use client"; // Indicate that this is a client-side component

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TaskPage({ params }) {
    const { id } = params; // Get the event ID from URL parameters
    const router = useRouter(); // Hook for programmatic navigation
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);
    const [newTask, setNewTask] = useState({ task_name: '', detail: '', time: '' });
    const [isAddingTask, setIsAddingTask] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [id]);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`/api/tasks?eventId=${id}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched tasks:', data); // Add this line for debugging
                setTasks(data);
            } else {
                console.error('Failed to fetch tasks');
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleEdit = (task) => {
        setEditingTask({ ...task });
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`/api/tasks`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingTask),
            });
            if (response.ok) {
                setTasks(tasks.map(task => 
                    task._id === editingTask._id ? editingTask : task
                ));
                setEditingTask(null);
            } else {
                console.error('Failed to update task');
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDelete = async (taskId) => {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await fetch(`/api/tasks?id=${taskId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    setTasks(tasks.filter(task => task._id !== taskId));
                } else {
                    console.error('Failed to delete task');
                }
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...newTask, eventId: id }),
            });
            if (response.ok) {
                const addedTask = await response.json();
                console.log('Added task:', addedTask); // Add this line for debugging
                setTasks(prevTasks => [...prevTasks, addedTask]);
                setNewTask({ task_name: '', detail: '', time: '' });
                setIsAddingTask(false);
            } else {
                console.error('Failed to add new task');
            }
        } catch (error) {
            console.error('Error adding new task:', error);
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

            {isAddingTask && (
                <div className="add-task-form">
                    <h3>Add New Task</h3>
                    <form onSubmit={handleAddTask}>
                        <input
                            type="text"
                            placeholder="Task name"
                            value={newTask.task_name}
                            onChange={(e) => setNewTask({...newTask, task_name: e.target.value})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Task details"
                            value={newTask.detail}
                            onChange={(e) => setNewTask({...newTask, detail: e.target.value})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Task time"
                            value={newTask.time}
                            onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                            required
                        />
                        <button type="submit">Add Task</button>
                        <button type="button" onClick={() => setIsAddingTask(false)}>Cancel</button>
                    </form>
                </div>
            )}

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
                                <td>
                                    {editingTask?._id === task._id ? 
                                        <input 
                                            value={editingTask.task_name} 
                                            onChange={(e) => setEditingTask({...editingTask, task_name: e.target.value})}
                                        /> : task.task_name}
                                </td>
                                <td>
                                    {editingTask?._id === task._id ? 
                                        <input 
                                            value={editingTask.detail} 
                                            onChange={(e) => setEditingTask({...editingTask, detail: e.target.value})}
                                        /> : task.detail}
                                </td>
                                <td>
                                    {editingTask?._id === task._id ? 
                                        <input 
                                            value={editingTask.time} 
                                            onChange={(e) => setEditingTask({...editingTask, time: e.target.value})}
                                        /> : task.time}
                                </td>
                                <td>
                                    {editingTask?._id === task._id ? (
                                        <button onClick={handleUpdate}>Save</button>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEdit(task)}>📝</button>
                                            <button onClick={() => handleDelete(task._id)}>🗑️</button>
                                        </>
                                    )}
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

                .edit-form {
                    margin-top: 20px;
                    padding: 20px;
                    background-color: #f8f8f8;
                    border-radius: 8px;
                }

                .edit-form h3 {
                    margin-bottom: 15px;
                }

                .edit-form form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .edit-form input {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                .edit-form button {
                    padding: 8px 16px;
                    background-color: #6A4BFF;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .edit-form button[type="button"] {
                    background-color: #ccc;
                }

                .edit-form button:hover {
                    opacity: 0.8;
                }

                .tasks-table input {
                    width: 100%;
                    padding: 5px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                .tasks-table button {
                    margin: 0 5px;
                    cursor: pointer;
                    padding: 5px 10px;
                    background-color: #6A4BFF;
                    color: white;
                    border: none;
                    border-radius: 4px;
                }

                .tasks-table button:hover {
                    background-color: #5a3ee6;
                }

                .add-task-form {
                    margin-top: 20px;
                    padding: 20px;
                    background-color: #f8f8f8;
                    border-radius: 8px;
                }

                .add-task-form h3 {
                    margin-bottom: 15px;
                }

                .add-task-form form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .add-task-form input {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                .add-task-form button {
                    padding: 8px 16px;
                    background-color: #6A4BFF;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .add-task-form button[type="button"] {
                    background-color: #ccc;
                }

                .add-task-form button:hover {
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
}