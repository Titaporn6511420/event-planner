"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch events from the server
    const fetchEvents = async () => {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events); // Ensure the correct field from API response
      } else {
        console.error('Failed to fetch events');
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="main-container">
      <header className="header">
        <h1>Event Planner.</h1>
      </header>
      <div className="content">
        <h2><strong>Upcoming Event</strong></h2>
        <div className="search-section">
          <input type="text" placeholder="Search" className="search-input" />
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
              <div key={event._id} className="event-item">
                <h3>{event.name}</h3>
                <p>Host: {event.host}</p>
                <p>Date: {event.date}</p>
                <p>Location: {event.location}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
