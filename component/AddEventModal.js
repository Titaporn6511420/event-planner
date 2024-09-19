import { useState } from 'react';

const AddEventModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [host, setHost] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct the event object
        const newEvent = { name, host, date, location };

        // Call the save event function passed as a prop
        await onSave(newEvent);

        // Close the modal after saving
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Add New Event</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Host:
                        <input
                            type="text"
                            value={host}
                            onChange={(e) => setHost(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Date:
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Location:
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit">Save Event</button>
                </form>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default AddEventModal;
