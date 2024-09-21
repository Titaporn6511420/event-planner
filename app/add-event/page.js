"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddEvent() {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [host, setHost] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState(''); // Time as string
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError(null); // Reset error state

    const eventData = { name, details, host, date, time, location }; // Include time

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        router.push('/');
      } else {
        const errorData = await response.json();
        setError(`Error: ${errorData.message}`); // Show error in UI
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div className="event-form-container">
      <h1>Add New Event</h1>

      {error && <div className="error-message">{error}</div>} {/* Display error message */}

      <form onSubmit={handleSubmit} className="event-form">
        <label>
          Event Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
            placeholder="Enter the event's name"
            disabled={isLoading} // Disable when loading
          />
        </label>
        <label>
          Host Name:
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            required
            className="form-input"
            placeholder="Enter the host's name"
            disabled={isLoading} // Disable when loading
          />
        </label>
        <label>
          Details:
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            className="form-input"
            placeholder="Enter the details"
            disabled={isLoading} // Disable when loading
          />
        </label>
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="form-input"
            disabled={isLoading} // Disable when loading
          />
        </label>
        <label>
          Time: {/* Added time input */}
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="form-input"
            disabled={isLoading} // Disable when loading
          />
        </label>
        <label>
          Location:
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="form-input"
            placeholder="Enter the location"
            disabled={isLoading} // Disable when loading
          />
        </label>
        <div className="form-buttons">
          <button
            type="button"
            className="cancel-button"
            onClick={() => router.push('/')}
            disabled={isLoading} // Disable when loading
          >
            Cancel
          </button>
          <button
            type="submit"
            className="add-button"
            disabled={isLoading} // Disable when loading
          >
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

        .error-message {
          color: red;
          margin-bottom: 15px;
          text-align: center;
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

        textarea.form-input {
          resize: none;
          height: 100px;
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
