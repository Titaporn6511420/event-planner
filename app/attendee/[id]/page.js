"use client"; // Indicate that this is a client-side component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AttendeePage({ params }) {
    const { id } = params; // Get the event ID from URL parameters
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const router = useRouter(); // Hook for programmatic navigation

    useEffect(() => {
        const fetchAttendees = async () => {
            try {
                const response = await fetch(`/api/attendee?eventId=${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAttendees(data);
            } catch (err) {
                console.error('Error fetching attendees:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendees();
    }, [id]); // Ensure effect runs when id changes

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            {/* Navigation Bar */}
            <nav style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
                <button onClick={() => router.push('/')} style={{ marginRight: '10px' }}>Home</button>
                <button onClick={() => router.push(`/attendee`)}>Attendee</button>
                <button onClick={() => router.push(`/task`)}>Tasks</button>
            </nav>

            <h1>Attendees for Event </h1>
            <button onClick={() => router.push(`/attendee/add?id=${id}`)}>Add New Attendee</button>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Food Allergies</th>
                    </tr>
                </thead>
                <tbody>
                    {attendees.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>
                                No attendees found.
                            </td>
                        </tr>
                    ) : (
                        attendees.map(attendee => (
                            <tr key={attendee._id}>
                                <td>{attendee.name}</td>
                                <td>{attendee.email}</td>
                                <td>{attendee.phone}</td>
                                <td>{attendee.foodAllergies}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
