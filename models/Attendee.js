import mongoose from 'mongoose';

const AttendeeSchema = new mongoose.Schema({
  name: String,
  foodExpenses: Number,
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
});

export default mongoose.models.Attendee || mongoose.model('Attendee', AttendeeSchema);
