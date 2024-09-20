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

  // Function to delete an event
  const handleDelete = async (id) => {
    const response = await fetch(`/api/events`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      setEvents(prevEvents => prevEvents.filter(event => event._id !== id));
    } else {
      console.error('Failed to delete event');
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
