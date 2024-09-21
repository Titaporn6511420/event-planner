import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  name: String, // Updated field name
  date: Date,
  time: String,
  details: String, // Updated field name
  host: String, // New field for host
  location: String, // New field for location
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
