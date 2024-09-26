"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchEvents = async () => {
      let url = "/api/events"; // Base URL

      // Append search term if it exists
      if (searchTerm.trim()) {
        url += `?q=${encodeURIComponent(searchTerm.trim())}`; // Properly encode search term
      }

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
          if (Array.isArray(data) && data.length === 0) {
            setEvents([]); // No events found
          } else {
            const sortedEvents = data.sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              
              // Compare dates
              if (dateA.getTime() !== dateB.getTime()) {
                return dateA.getTime() - dateB.getTime();
              }
              
              // If dates are the same, compare times
              const timeA = a.time.split(':');
              const timeB = b.time.split(':');
              return (parseInt(timeA[0]) * 60 + parseInt(timeA[1])) - 
                     (parseInt(timeB[0]) * 60 + parseInt(timeB[1]));
            });

            setEvents(sortedEvents);
          }
          setError(null); // Clear any previous error
        } else {
          console.error('Server error:', data.message);
          setError(`Error: ${data.message}`);
          setEvents([]); // Clear events on error
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        setError('Error fetching events. Please try again.');
        setEvents([]); // Clear events on fetch error
      }
    };

    fetchEvents();
  }, [searchTerm]); // Dependency on searchTerm

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term); // Update search term as user types
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch("/api/events", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setEvents((prevEvents) => prevEvents.filter((event) => event._id !== id));
      } else {
        setError('Failed to delete event');
      }
    } catch (error) {
      setError('Error deleting event');
    }
  };

  return (
    <div className="main-container">
      <header className="header">
        <h1>Event Planner</h1>
      </header>
      <div className="content">
        <div className="search-section">
          <h2><strong>Upcoming Event</strong></h2>
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Link href="/add-event">
            <button className="add-event-btn">+ Add new event</button>
          </Link>
        </div>
        <hr />
        {error && <div className="error-message">{error}</div>}
        {events.length === 0 ? (
          <div className="no-events">There's no event in here</div>
        ) : (
          <div className="event-list">
            {events.map(event => (
              <div key={event._id} className="event-card">
                <div className="event-details">
                  <p><strong>Name :</strong> {event.name}</p>
                  <p><strong>Host :</strong> {event.host}</p>
                  <p><strong>Details :</strong> {event.details}</p>
                  <p><strong>Date :</strong> {new Date(event.date).toLocaleDateString()}</p>
                  <p><strong>Time :</strong> {event.time}</p>
                  <p><strong>Location :</strong> {event.location}</p>
                </div>
                <div className="event-action">
                  <Link href={`/update-event/${event._id}`}>
                    <button className="event-update-btn">Update</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="event-delete-btn"
                  >
                    Delete
                  </button>
                  <Link href={`/attendee/${event._id}`}>
                    <button className="event-tasks-btn">Go to Detail</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .main-container {
          background-color: #f4f4f9;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 36px;
        }
        .content {
          width: 90%;
          max-width: 1200px;
          margin: 0 auto;
        }
        .search-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .search-input {
          padding: 10px;
          font-size: 16px;
          width: 60%;
        }
        .add-event-btn {
          background-color: #6d31c9;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .event-list {
          margin-top: 20px;
        }
        .event-card {
          background-color: #fff;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 10px;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .event-details {
          flex: 1;
        }
        .event-details p {
          margin: 5px 0;
        }
        .event-action {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .event-action button,
        .event-action a {
          margin-bottom: 10px;
        }
        .event-update-btn,
        .event-delete-btn,
        .event-tasks-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .event-update-btn {
          background-color: #00aaff;
          color: white;
        }
        .event-delete-btn {
          background-color: #ff4b4b;
          color: white;
        }
        .event-tasks-btn {
          background-color: #6d31c9;
          color: white;
        }
        .event-update-btn:hover,
        .event-delete-btn:hover,
        .event-tasks-btn:hover {
          opacity: 0.8;
        }
        .error-message {
          color: red;
          margin-bottom: 15px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
