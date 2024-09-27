// models/Task.js
import mongoose from 'mongoose';

// models/Task.js

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    task_name: {
      type: String,
      required: true,
      trim: true,
    },
    detail: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String, // Alternatively, use Date if you need to store date-time
      required: true,
      validate: {
        validator: function (v) {
          return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: props => `${props.value} is not a valid time format!`,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
