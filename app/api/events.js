import dbConnect from '../lib/db.js'; // Adjust path as necessary
import Event from '../models/Event.js'; // Adjust path as necessary

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const events = await Event.find({});
        res.status(200).json(events);
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch events' });
      }
      break;

    case 'POST':
      try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json({ message: 'Event added', eventId: newEvent._id });
      } catch (error) {
        res.status(500).json({ message: 'Failed to create event' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}