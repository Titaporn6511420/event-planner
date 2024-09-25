// models/Attendee.js
import mongoose from 'mongoose';

const AttendeeSchema = new mongoose.Schema({
    attendee_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure each email is unique
        match: /.+\@.+\..+/, // Basic email validation
    },
    phone: {
        type: String,
        required: true,
    },
    foodAllergies: {
        type: String,
        default: 'None', // Default value if no allergies are specified
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event', // Reference to the Event model (if you have one)
    },
    foodCost: {
        type: Number,
        default: 0, // Default food cost for the attendee
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Export the Attendee model
const Attendee = mongoose.models.Attendee || mongoose.model('Attendee', AttendeeSchema);
export default Attendee;
