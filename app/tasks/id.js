"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TaskPage() {
  const router = useRouter();
  const { id } = router.query; // Event ID from URL

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    if (id) {
      fetchTasks();
    }
  }, [id]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim()) {
      try {
        const response = await fetch(`/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: id, task: newTask })
        });

        if (response.ok) {
          fetchTasks(); // Refresh the tasks after adding a new one
          setNewTask(''); // Clear input
        }
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  return (
    <div className="task-page-container">
      <h1>Tasks for Event: {id}</h1>
      
      <ul>
        {tasks.map(task => (
          <li key={task._id}>{task.task}</li>
        ))}
      </ul>

      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="New Task"
      />
      <button onClick={handleAddTask}>Add Task</button>

      <style jsx>{`
        /* Add your styles here */
      `}</style>
    </div>
  );
}
