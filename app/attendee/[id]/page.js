"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AttendeePage({ params }) {
    const { id } = params;
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [foodCost, setFoodCost] = useState(0);
    const [totalFoodCost, setTotalFoodCost] = useState(0);
    const [editingId, setEditingId] = useState(null);

    const router = useRouter();

    useEffect(() => {
        fetchAttendees();
    }, [id]);

    const fetchAttendees = async () => {
        try {
            setLoading(true);
            console.log('Fetching attendees for eventId:', id);
            const response = await fetch(`/api/attendee?eventId=${id}`);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Fetched attendees:', data);
            
            if (Array.isArray(data)) {
                setAttendees(data);
                console.log('Attendees set:', data);
                if (data.length > 0 && data[0].foodCost !== undefined) {
                    setFoodCost(data[0].foodCost);
                    setTotalFoodCost(data[0].foodCost * data.length);
                } else {
                    setFoodCost(0);
                    setTotalFoodCost(0);
                }
            } else {
                console.error('Fetched data is not an array:', data);
                setError('Invalid data format received from server');
            }
        } catch (err) {
            console.error('Error fetching attendees:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAttendee = (newAttendee) => {
        setAttendees(prevAttendees => [...prevAttendees, newAttendee]);
        updateFoodCost(foodCost, [...attendees, newAttendee].length);
    };

    const handleEdit = (attendeeId) => {
        setEditingId(attendeeId);
    };

    const handleSave = async (attendee) => {
        try {
            const response = await fetch(`/api/attendee`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    attendee: attendee
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Update successful:', data);

            setAttendees(prevAttendees => 
                prevAttendees.map(a => a._id === attendee._id ? attendee : a)
            );
            setEditingId(null);
        } catch (err) {
            console.error('Error updating attendee:', err);
            alert('Error updating attendee: ' + err.message);
        }
    };

    const handleChange = (e, attendee) => {
        const { name, value } = e.target;
        setAttendees(prevAttendees => 
            prevAttendees.map(a => 
                a._id === attendee._id ? { ...a, [name]: value } : a
            )
        );
    };

    const handleDelete = async (attendeeId) => {
        if (window.confirm('Are you sure you want to delete this attendee?')) {
            try {
                const response = await fetch(`/api/attendee?id=${attendeeId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Delete successful:', data);

                setAttendees(prevAttendees => prevAttendees.filter(a => a._id !== attendeeId));
                updateFoodCost(foodCost, attendees.length - 1);
            } catch (err) {
                console.error('Error deleting attendee:', err);
                alert('Error deleting attendee: ' + err.message);
            }
        }
    };

    const updateFoodCost = (cost, attendeeCount) => {
        setFoodCost(cost);
        setTotalFoodCost(cost * attendeeCount);
    };

    const handleFoodCostChange = (e) => {
        const newFoodCost = parseFloat(e.target.value);
        updateFoodCost(newFoodCost, attendees.length);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="attendee-page">
            {/* Header Navigation */}
            <nav className="navbar">
                <div className="logo">
                    <span className="logo-event">Event</span>
                    <span className="logo-planner">Planner.</span>
                </div>
                <div className="nav-links">
                    <button onClick={() => router.push('/')}>Home</button>
                    <button onClick={() => router.push(`/attendee/${id}`)} className="active">Attendees</button>
                    <button onClick={() => router.push(`/tasks/${id}`)}>Tasks</button>
                </div>
            </nav>

            {/* Attendees Section */}
            <div className="header-with-button">
                <h1 className="title">Attendees of the event</h1>
                <button className="add-attendee-btn" onClick={() => {
                    router.push(`/add-attendee/${id}`);
                }}>
                    + Add New Attendee
                </button>
            </div>

            <div className="box">
                <table className="attendee-table">
                    <thead>
                        <tr>
                            <th>Attendees Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Food Allergies</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendees.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>No attendees found.</td>
                            </tr>
                        ) : (
                            attendees.map(attendee => (
                                <tr key={attendee._id}>
                                    <td>
                                        {editingId === attendee._id ? (
                                            <input
                                                type="text"
                                                name="attendee_name"
                                                value={attendee.attendee_name}
                                                onChange={(e) => handleChange(e, attendee)}
                                            />
                                        ) : (
                                            attendee.attendee_name
                                        )}
                                    </td>
                                    <td>
                                        {editingId === attendee._id ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={attendee.email}
                                                onChange={(e) => handleChange(e, attendee)}
                                            />
                                        ) : (
                                            attendee.email
                                        )}
                                    </td>
                                    <td>
                                        {editingId === attendee._id ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={attendee.phone}
                                                onChange={(e) => handleChange(e, attendee)}
                                            />
                                        ) : (
                                            attendee.phone
                                        )}
                                    </td>
                                    <td>
                                        {editingId === attendee._id ? (
                                            <input
                                                type="text"
                                                name="foodAllergies"
                                                value={attendee.foodAllergies || ""}
                                                onChange={(e) => handleChange(e, attendee)}
                                            />
                                        ) : (
                                            attendee.foodAllergies || "-"
                                        )}
                                    </td>
                                    <td>
                                        {editingId === attendee._id ? (
                                            <>
                                                <button onClick={() => handleSave(attendee)}>Save</button>
                                                <button onClick={() => setEditingId(null)}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEdit(attendee._id)}>📝</button>
                                                <button onClick={() => handleDelete(attendee._id)}>🗑️</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary Section */}
            <div className="box">
                <div className="summary">
                    <p><strong>Total Attendees:</strong> {attendees.length}</p>
                    <div className="food-cost-input">
                        <label htmlFor="food-cost">Food Cost for each:</label>
                        <input
                            type="number"
                            id="food-cost"
                            value={foodCost}
                            onChange={handleFoodCostChange}
                            className={isNaN(foodCost) || foodCost <= 0 ? "invalid" : "valid"}
                        />
                    </div>
                    <p><strong>Total Food Cost:</strong> {totalFoodCost ? `$${totalFoodCost.toFixed(2)}` : '$0.00'}</p>
                </div>
            </div>

            {/* Save Changes Button */}
            <div className="save-changes-button">
                <button onClick={() => {
                    handleSaveChanges();
                    router.push('/');
                }} className="save-btn">
                    Save Changes
                </button>
            </div>

            <style jsx>{`
                .attendee-page {
                    font-family: 'Jost', sans-serif;
                    padding: 20px;
                }

                /* Header Styling */
                .navbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    background-color: #f8f8f8;
                    border-radius: 0 0 20px 20px;
                    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
                    margin-bottom: 20px;
                }
                .logo {
                    display: flex;
                    align-items: center;
                }
                .logo-event {
                    font-weight: bold;
                    font-size: 24px;
                    color: #6A4BFF; /* Purple color */
                }
                .logo-planner {
                    font-weight: 600;
                    font-size: 24px;
                    color: #333; /* Darker color for Planner. */
                    margin-left: 5px;
                }
                .nav-links {
                    display: flex;
                    gap: 20px;
                }
                .nav-links button {
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    color: #333; /* Default link color */
                }
                .nav-links button.active {
                    color: #6A4BFF; /* Active link color */
                }
                .nav-links button:hover {
                    text-decoration: underline;
                }

                /* Add Attendee Button and Header */
                .header-with-button {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .add-attendee-btn {
                    padding: 10px 20px;
                    font-size: 14px;
                    background-color: #6A4BFF;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .add-attendee-btn:hover {
                    background-color: #5a3ee6;
                }

                /* Box Styling */
                .box {
                    background-color: #f8f8f8;
                    border-radius: 20px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
                }

                .attendee-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                .attendee-table th, .attendee-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                .attendee-table th {
                    background-color: #f2f2f2;
                    text-align: left;
                }
                .summary {
                    margin-top: 20px;
                }
                .food-cost-input {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .food-cost-input label {
                    margin-right: 10px;
                }
                .food-cost-input input {
                    padding: 5px;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                    width: 100px;
                }
                .food-cost-input input.invalid {
                    border-color: red;
                }
                .food-cost-input input.valid {
                    border-color: green;
                }

                /* Save Changes Button Styling */
                .save-changes-button {
                    text-align: right;
                }

                .save-btn {
                    padding: 10px 20px;
                    background-color: #6A4BFF;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .save-btn:hover {
                    background-color: #5a3ee6;
                }

                .attendee-table button {
                    margin: 0 5px;
                    cursor: pointer;
                }

                .attendee-table input {
                    width: 100%;
                    padding: 5px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
}