"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddTask({ params }) {
  const { id } = params;
  const [task_name, setTaskName] = useState('');
  const [detail, setDetail] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const taskData = {
      eventId: id,
      task_name,
      detail,
      time
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      const text = await response.text();
      console.log('Raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', text);
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Task added:', data);
      router.push(`/tasks/${id}`);
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="event-form-container">
      <h1>Add Task</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="event-form">
        <label>
          Task Name:
          <input
            type="text"
            value={task_name}
            onChange={(e) => setTaskName(e.target.value)}
            required
            className="form-input"
            placeholder="Enter task name"
          />
        </label>
        <label>
          Detail:
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            required
            className="form-input"
            placeholder="Enter task details"
          />
        </label>
        <label>
          Time:
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="form-input"
          />
        </label>
        <div className="form-buttons">
          <button
            type="button"
            className="cancel-button"
            onClick={() => router.push(`/tasks/${id}`)}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button type="submit" className="add-button" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      <style jsx>{`
        * {
            font-family: 'Jost', sans-serif;
        }

        .event-form-container {
          background-color: #fff;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          margin: 0 auto;
        }

        h1 {
          text-align: center;
          font-size: 24px;
          margin-bottom: 20px;
        }

        .event-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        label {
          display: flex;
          flex-direction: column;
          font-size: 14px;
          font-weight: bold;
        }

        .form-input {
          padding: 10px;
          font-size: 16px;
          border-radius: 10px;
          border: 1px solid #ccc;
          margin-top: 5px;
        }

        .form-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .cancel-button,
        .add-button {
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .cancel-button {
          background-color: #ff4b4b;
          color: white;
        }

        .cancel-button:hover {
          background-color: #ff6f6f;
        }

        .add-button {
          background-color: #4CAF50;
          color: white;
        }

        .add-button:hover {
          background-color: #45a049;
        }
      `}</style>
    </div>
  );
}
