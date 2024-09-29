"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AttendeePage({ params }) {
    const { id } = params;
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [foodCost, setFoodCost] = useState(0);
    const [totalFoodCost, setTotalFoodCost] = useState(0);
    const [isEditingFoodCost, setIsEditingFoodCost] = useState(false);
    const [tempFoodCost, setTempFoodCost] = useState(0);

    const router = useRouter();

    const fetchAttendees = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/attendee?eventId=${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Sort attendees by name (A-Z)
            const sortedAttendees = data.sort((a, b) => a.attendee_name.localeCompare(b.attendee_name));
            
            setAttendees(sortedAttendees);
            if (sortedAttendees.length > 0 && sortedAttendees[0].foodCost !== undefined) {
                setFoodCost(sortedAttendees[0].foodCost);
                setTotalFoodCost(sortedAttendees[0].foodCost * sortedAttendees.length);
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
        const cost = parseFloat(e.target.value);
        setTempFoodCost(cost);
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

    const saveToLocalStorage = (attendeesList, cost, total) => {
        localStorage.setItem(`attendees_${id}`, JSON.stringify({
            attendees: attendeesList,
            foodCost: cost,
            totalFoodCost: total
        }));
    };

    const handleEditFoodCost = () => {
        setTempFoodCost(foodCost);
        setIsEditingFoodCost(true);
    };

    const handleCancelEditFoodCost = () => {
        setIsEditingFoodCost(false);
    };

    const handleSaveFoodCost = async () => {
        try {
            const response = await fetch(`/api/attendee`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: id,
                    foodCost: tempFoodCost,
                    attendees: attendees.map(a => ({ _id: a._id }))
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Food cost update successful:', data);

            setFoodCost(tempFoodCost);
            setTotalFoodCost(tempFoodCost * attendees.length);
            setIsEditingFoodCost(false);
            alert('Food cost updated successfully!');
        } catch (err) {
            console.error('Error updating food cost:', err);
            alert('Error updating food cost: ' + err.message);
        }
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
                                    <td>{attendee.attendee_name}</td>
                                    <td>{attendee.email}</td>
                                    <td>{attendee.phone}</td>
                                    <td>{attendee.foodAllergies || "-"}</td>
                                    <td>
                                        <button onClick={() => handleDelete(attendee._id)}>🗑️</button>
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
                        {isEditingFoodCost ? (
                            <>
                                <input
                                    type="number"
                                    id="food-cost"
                                    value={tempFoodCost}
                                    onChange={handleFoodCostChange}
                                    className={isNaN(tempFoodCost) || tempFoodCost < 0 ? "invalid" : "valid"}
                                />
                                <button onClick={handleSaveFoodCost}>Save</button>
                                <button onClick={handleCancelEditFoodCost}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <span>${foodCost.toFixed(2)}</span>
                                <button onClick={handleEditFoodCost}>📝</button>
                            </>
                        )}
                    </div>
                    <p><strong>Total Food Cost:</strong> ${totalFoodCost.toFixed(2)}</p>
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