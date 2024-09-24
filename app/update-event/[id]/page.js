"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation'; // Adjust import for your Next.js version

export default function UpdateEventPage({ params }) {
  const { id } = params; // Extracting ID from the URL params
  const router = useRouter();
  const [error, setError] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${API_BASE}/events?id=${id}`);
        if (response.ok) {
          const event = await response.json();
          reset(event); // Pre-fill form with fetched event data
        } else {
          setError('Failed to fetch event details');
        }
      } catch (error) {
        setError('Error fetching event details');
      }
    };

    fetchEvent();
  }, [id, reset]);

  const handleUpdate = async (data) => {
    try {
      // Include the event ID in the request body
      const updateData = { ...data, _id: id };
  
      const response = await fetch(`${API_BASE}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
  
      if (response.ok) {
        alert('Event updated successfully');
      } else {
        const errorData = await response.json();
        console.warn(errorData.message || 'Failed to update event'); // Log the error
      }
  
      // Redirect to the homepage after attempting the update
      router.push('/'); // Always redirect to homepage
    } catch (error) {
      console.error('Error updating event:', error); // Log the error
      // Still redirect to the homepage even if there is an error
      router.push('/');
    }
  };


  const handleCancel = () => {
    router.push('/'); // Redirect to the homepage without changes
  };

  return (
    <div className='event-form-container'>
      <h1>Update Event</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit(handleUpdate)}>
        <div className='form-input'>
          <label>Name:</label>
          <input {...register("name", { required: true })} />
        </div>
        <div>
          <label>Details:</label>
          <input {...register("details", { required: true })} />
        </div>
        <div className='form-input'>
          <label>Host:</label>
          <input {...register("host", { required: true })} />
        </div>
        <div className='form-input'>
          <label>Date:</label>
          <input type="date" {...register("date", { required: true })} />
        </div>
        <div className='form-input'>
          <label>Time:</label>
          <input type="time" {...register("time", { required: true })} />
        </div>
        <div className='form-input'>
          <label>Location:</label>
          <input {...register("location", { required: true })} />
        </div>
        <div className='form-buttons'>
        <button type="button" onClick={handleCancel} className="cancel-button">Cancel</button>
          <button type="submit" className="update-button">Update Event</button>
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
