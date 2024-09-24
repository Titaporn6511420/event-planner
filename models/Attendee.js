import mongoose from 'mongoose';

const AttendeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  foodAllergies: {
    type: [String], // Optional array of strings for allergies
    default: []
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the associated event
    required: true,
    ref: 'Event'
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Check if the Attendee model already exists to avoid recompiling the schema
export default mongoose.models.Attendee || mongoose.model('Attendee', AttendeeSchema);
