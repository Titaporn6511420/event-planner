"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      let url = `/api/events`;
      if (searchTerm) {
        url += `?q=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error('Failed to fetch events');
      }
    };

    fetchEvents();
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/events`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
  
      if (res.ok) {
        // Remove the deleted event from the state
        setEvents((prevEvents) => prevEvents.filter((event) => event._id !== id));
        console.log('Event deleted successfully');
      } else {
        console.error('Failed to delete event:', res.status);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
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
        {events.length === 0 ? (
          <div className="no-events">There's no event in here</div>
        ) : (
          <div className="event-list">
            {events.map(event => (
              <div key={event._id} className="event-card">
                <div className="event-details">
                  <p><strong>Name :</strong> {event.name}</p>
                  <p><strong>Details :</strong> {event.details}</p>
                  <p><strong>Date :</strong> {new Date(event.date).toLocaleDateString()}</p>
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

                  <Link href={`/tasks/${event._id}`}>
                    <button className="event-tasks-btn">Go to Details</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .main-container {
          padding: 20px;
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
          background-color: #4CAF50;
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
          background-color: #4CAF50;
          color: white;
        }

        .event-update-btn:hover,
        .event-delete-btn:hover,
        .event-tasks-btn:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
