"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddAttendee({ params }) {
  const { id } = params;
  const [attendeeName, setAttendeeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [foodAllergies, setFoodAllergies] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const attendeeData = {
      eventId: id,
      attendee_name: attendeeName,
      email,
      phone,
      foodAllergies
    };

    try {
      console.log('Sending attendee data:', attendeeData);
      const response = await fetch('/api/attendee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendeeData),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add attendee');
      }

      console.log('Attendee added:', data);
      
      // Navigate back to the attendee page
      router.push(`/attendee/${id}`);
    } catch (error) {
      console.error('Error adding attendee:', error);
      setError(error.message);
      // You might want to show this error to the user in your UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="event-form-container">
      <h1>Add Attendee</h1>
      <form onSubmit={handleSubmit} className="event-form">
        <label>
          Name:
          <input
            type="text"
            value={attendeeName}
            onChange={(e) => setAttendeeName(e.target.value)}
            required
            className="form-input"
            placeholder="Enter name"
          />
        </label>
        <label>
          Email:
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            placeholder="Enter the email"
          />
        </label>
        <label>
          Phone Number:
          <input
            type="number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="form-input"
            placeholder="Enter phone no."
          />
        </label>
        <label>
          Food Allergies (if any):
          <input
            type="text"
            value={foodAllergies}
            onChange={(e) => setFoodAllergies(e.target.value)}
            required
            className="form-input"
            placeholder="type - if do not have any"
          />
        </label>
        <div className="form-buttons">
          <button
            type="button"
            className="cancel-button"
            onClick={() => router.push(`/attendee/${id}`)}
          >
            Cancel
          </button>
          <button type="submit" className="add-button">
            Add
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
