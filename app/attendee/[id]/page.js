"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// test

export default function AttendeePage({ params }) {
    const { id } = params;
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [foodCost, setFoodCost] = useState(0);
    const [totalFoodCost, setTotalFoodCost] = useState(0);
    const [editingAttendee, setEditingAttendee] = useState(null);

    const router = useRouter();

    const fetchAttendees = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/attendee?eventId=${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            setAttendees(data);
            if (data.length > 0 && data[0].foodCost !== undefined) {
                setFoodCost(data[0].foodCost);
                setTotalFoodCost(data[0].foodCost * data.length);
            } else {
                setFoodCost(0);
                setTotalFoodCost(0);
            }
            
            // Clear any saved data in localStorage
            localStorage.removeItem(`attendees_${id}`);
        } catch (err) {
            console.error('Error fetching attendees:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAttendees();
    }, [fetchAttendees]);

    // Add this new effect to refetch attendees when the component gains focus
    useEffect(() => {
        const handleFocus = () => {
            fetchAttendees();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchAttendees]);

    const handleFoodCostChange = (e) => {
        const costPerAttendee = parseFloat(e.target.value);
        setFoodCost(costPerAttendee);
        if (!isNaN(costPerAttendee) && costPerAttendee >= 0) {
            setTotalFoodCost(costPerAttendee * attendees.length);
        } else {
            setTotalFoodCost(0);
        }
        saveToLocalStorage(attendees, costPerAttendee, costPerAttendee * attendees.length);
    };

    const handleSaveChanges = async () => {
        try {
            const updatedAttendees = attendees.map(attendee => ({
                _id: attendee._id,
                foodCost: foodCost
            }));

            const requestBody = { 
                eventId: id,
                foodCost, 
                attendees: updatedAttendees 
            };

            console.log('Request body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(`/api/attendee`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Save successful:', data);

            const updatedAttendeesList = attendees.map(a => ({ ...a, foodCost }));
            setAttendees(updatedAttendeesList);
            setTotalFoodCost(foodCost * updatedAttendeesList.length);
            localStorage.removeItem(`attendees_${id}`); // Clear local storage after saving
            alert('Changes saved successfully!');
        } catch (err) {
            console.error('Error saving changes:', err);
            alert('Error saving changes: ' + err.message);
        }
    };

    const handleEdit = (attendee) => {
        setEditingAttendee(attendee);
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

                const updatedAttendees = attendees.filter(a => a._id !== attendeeId);
                setAttendees(updatedAttendees);
                setTotalFoodCost(foodCost * updatedAttendees.length);
                saveToLocalStorage(updatedAttendees, foodCost, foodCost * updatedAttendees.length);
                alert('Attendee deleted successfully!');
            } catch (err) {
                console.error('Error deleting attendee:', err);
                alert('Error deleting attendee: ' + err.message);
            }
        }
    };

    const handleSaveEdit = async (editedAttendee) => {
        try {
            console.log('Sending edited attendee data:', editedAttendee);
            const response = await fetch(`/api/attendee`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    attendee: {
                        ...editedAttendee,
                        _id: editedAttendee._id.toString() // Ensure _id is a string
                    }
                }),
            });

            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, message: ${data.message}`);
            }

            console.log('Update successful:', data);

            // Update the attendees state with the edited attendee
            const updatedAttendees = attendees.map(a => 
                a._id === editedAttendee._id ? {...a, ...editedAttendee} : a
            );
            setAttendees(updatedAttendees);
            setEditingAttendee(null);
            saveToLocalStorage(updatedAttendees, foodCost, totalFoodCost);
            alert('Attendee updated successfully!');
        } catch (err) {
            console.error('Error updating attendee:', err);
            alert('Error updating attendee: ' + err.message);
        }
    };

    const saveToLocalStorage = (attendeesList, cost, total) => {
        localStorage.setItem(`attendees_${id}`, JSON.stringify({
            attendees: attendeesList,
            foodCost: cost,
            totalFoodCost: total
        }));
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
                                    <td>{editingAttendee?._id === attendee._id ? 
                                        <input 
                                            value={editingAttendee.attendee_name} 
                                            onChange={(e) => setEditingAttendee({...editingAttendee, attendee_name: e.target.value})}
                                        /> : attendee.attendee_name}
                                    </td>
                                    <td>{editingAttendee?._id === attendee._id ? 
                                        <input 
                                            value={editingAttendee.email} 
                                            onChange={(e) => setEditingAttendee({...editingAttendee, email: e.target.value})}
                                        /> : attendee.email}
                                    </td>
                                    <td>{editingAttendee?._id === attendee._id ? 
                                        <input 
                                            value={editingAttendee.phone} 
                                            onChange={(e) => setEditingAttendee({...editingAttendee, phone: e.target.value})}
                                        /> : attendee.phone}
                                    </td>
                                    <td>{editingAttendee?._id === attendee._id ? 
                                        <input 
                                            value={editingAttendee.foodAllergies} 
                                            onChange={(e) => setEditingAttendee({...editingAttendee, foodAllergies: e.target.value})}
                                        /> : attendee.foodAllergies || "-"}
                                    </td>
                                    <td>
                                        {editingAttendee?._id === attendee._id ? (
                                            <button onClick={() => handleSaveEdit(editingAttendee)}>Save</button>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEdit(attendee)}>📝</button>
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

                .attendee-table button {
                    margin: 0 5px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}