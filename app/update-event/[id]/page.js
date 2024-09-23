"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation'; // Import useParams to get URL parameters

export default function UpdateEvent() {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [host, setHost] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Set loading to true initially
  const [error, setError] = useState(null);

  const router = useRouter();
  const { id } = useParams(); // Get the ID directly from the URL

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/events/${id}`);
        if (response.ok) {
          const event = await response.json();
          setName(event.name);
          setDetails(event.details);
          setHost(event.host);
          setDate(event.date);
          setTime(event.time);
          setLocation(event.location);
          setIsLoading(false); // Stop loading when data is fetched
        } else {
          console.error(`Failed to load event data: ${response.status}`);
          setError('Failed to load event data.');
          setIsLoading(false); // Stop loading on error
        }
      } catch (error) {
        console.error('Error loading event data:', error);
        setError('Error loading event data.');
        setIsLoading(false); // Stop loading on error
      }
    };

    fetchEventData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const updateData = { _id: id, name, details, host, date, time, location };

    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        router.push('/');
      } else {
        const errorData = await response.json();
        setError(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="event-form-container">
      <h1>Update Event</h1>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div>Loading...</div>
      ) : (
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
          <label>
            Location:
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="form-input"
              placeholder="Enter the location"
            />
          </label>
          <div className="form-buttons">
            <button
              type="button"
              className="cancel-button"
              onClick={() => router.push('/')}
            >
              Cancel
            </button>
            <button type="submit" className="update-button">
              Update
            </button>
          </div>
        </form>
      )}

            {/* Include the same styling as in add-event */}
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
        .update-button {
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
        .update-button {
          background-color: #4CAF50;
          color: white;
        }
        .update-button:hover {
          background-color: #45a049;
        }
      `}</style>
        </div>
    );
}
