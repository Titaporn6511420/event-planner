"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AttendeePage({ params }) {
    const { id } = params; // Get the event ID from URL parameters
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [foodCost, setFoodCost] = useState(0); // State for food cost per attendee
    const [totalFoodCost, setTotalFoodCost] = useState(0); // State for total food cost

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

    // Function to calculate total food cost based on input value
    const handleFoodCostChange = (e) => {
        const costPerAttendee = parseFloat(e.target.value);
        setFoodCost(costPerAttendee);
        if (!isNaN(costPerAttendee)) {
            setTotalFoodCost(costPerAttendee * attendees.length);
        } else {
            setTotalFoodCost(0);
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
                    <button onClick={() => router.push(`/attendee`)} className="active">Attendees</button>
                    <button onClick={() => router.push(`/task`)}>Task</button>
                </div>
            </nav>

            {/* Attendees Section */}
            <div className="header-with-button">
                <h1 className="title">Attendees of the event</h1>
                <button className="add-attendee-btn" onClick={() => router.push('/add-attendee')}>
                    + Add New Attendee
                </button>
            </div>

            <div className="box">
                <table className="attendee-table">
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
                                <td colSpan="4" style={{ textAlign: 'center' }}>No attendees found.</td>
                            </tr>
                        ) : (
                            attendees.map(attendee => (
                                <tr key={attendee._id}>
                                    <td>{attendee.name}</td>
                                    <td>{attendee.email}</td>
                                    <td>{attendee.phone}</td>
                                    <td>{attendee.foodAllergies || "None"}</td>
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
                    padding: 20px;
                    font-family: Arial, sans-serif;
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
            `}</style>
        </div>
    );
}
