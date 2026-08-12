const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Trip code is required'],
    trim: true,
    uppercase: true
    // uniqueness is enforced explicitly below via schema.index(), so all
    // indexes are defined in one place alongside the text index
  },
  name: { type: String, required: [true, 'Trip name is required'], trim: true },
  length: { type: String, required: [true, 'Trip length is required'], trim: true },
  start: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: (value) => value instanceof Date && !isNaN(value),
      message: 'Start date must be a valid date'
    }
  },
  resort: { type: String, required: [true, 'Resort is required'], trim: true },
  perPerson: {
    type: Number,
    required: [true, 'Price per person is required'],
    min: [0, 'Price per person cannot be negative'],
    max: [100000, 'Price per person exceeds an allowed maximum']
  },
  image: { type: String, required: [true, 'Image is required'], trim: true },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  }
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

// Database enhancement (Milestone Four): unique index on the natural key
// used to look trips up throughout the app.
tripSchema.index({ code: 1 }, { unique: true });

// Database enhancement (Milestone Four): compound index supporting the
// "trips at a resort around a date" access pattern used by the new
// resort-stats reporting endpoint, so that query can use the index instead
// of scanning every trip.
tripSchema.index({ resort: 1, start: 1 });

mongoose.model('trips', tripSchema);
