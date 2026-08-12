const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Trip code is required'],
    trim: true,
    uppercase: true,
    unique: true
  },
  name: { type: String, required: [true, 'Trip name is required'], trim: true },
  length: { type: String, required: [true, 'Trip length is required'], trim: true },
  start: { type: String, required: [true, 'Start date is required'], trim: true },
  resort: { type: String, required: [true, 'Resort is required'], trim: true },
  perPerson: {
    type: Number,
    required: [true, 'Price per person is required'],
    min: [0, 'Price per person cannot be negative']
  },
  image: { type: String, required: [true, 'Image is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'], trim: true }
});

mongoose.model('trips', tripSchema);
