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

// Algorithmic/data-structure enhancement: text index on the fields a user
// actually searches by (name, resort, description).
//
// Time complexity:
//   Before: Trip.find({}) followed by any narrowing was a full collection
//   scan, O(n) in the number of trips, with no server-side way to filter.
//   After: MongoDB builds an inverted index (conceptually a hash of terms ->
//   document list) over these fields. A $text query looks up matching terms
//   in that index rather than scanning every document, so search is O(k)
//   in the number of matching terms/documents rather than O(n) in the total
//   collection size. This is the same reason a book index beats reading
//   every page to find a topic.
//
// Efficiency:
//   Reduces both server-side scan work and the network payload returned to
//   the client, since only matching documents are sent instead of the
//   entire collection.
tripSchema.index({ name: 'text', resort: 'text', description: 'text' });

mongoose.model('trips', tripSchema);
