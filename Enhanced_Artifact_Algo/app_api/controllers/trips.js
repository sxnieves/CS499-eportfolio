const mongoose = require('mongoose');
const Trip = mongoose.model('trips');

// Shared handler for Mongoose validation errors and duplicate-key errors.
// Anything unexpected still falls back to a 500 so real server errors aren't masked.
const handleError = (res, err) => {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: 'A trip with that code already exists' });
  }
  return res.status(500).json({ message: 'Server error', error: err.message });
};

const tripsList = async (req, res) => {
  try {
    const trips = await Trip.find({});
    res.status(200).json(trips);
  } catch (err) {
    handleError(res, err);
  }
};

// Algorithms and Data Structure enhancement.
//
// Purpose: let a user narrow the trip list by keyword (name, resort, or
// description) instead of always retrieving and scanning the entire
// collection client-side.
//
// Time complexity (Big O):
//   - Before this enhancement, the only way to "search" was to call
//     tripsList(), which runs Trip.find({}) -> O(n) collection scan, then
//     linearly re-scan the returned array again in the UI for every
//     keystroke, an O(n) client-side operation with zero index support.
//   - This endpoint instead runs a MongoDB $text query against the text
//     index defined in app_api/models/travlr.js. That index is an inverted
//     index (term -> matching documents), so the lookup cost is O(k),
//     proportional to the number of matching terms/documents, not O(n) in
//     the total number of trips. As the trips collection grows, this
//     endpoint's cost grows with the result set, not the whole dataset.
//
// Optimization:
//   - Falls back to an empty-query tripsList()-equivalent result when no
//     search term is supplied, so existing behavior (loading all trips) is
//     preserved and this is purely additive.
//   - Uses .exec() and async/await consistent with the rest of the
//     controller so error handling stays uniform via handleError().
//
// Efficiency:
//   - Only matching documents are sent over the network, reducing payload
//     size and downstream Angular rendering work compared to sending the
//     full collection and filtering after the fact.
const tripsSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      const trips = await Trip.find({});
      return res.status(200).json(trips);
    }

    const trips = await Trip.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    res.status(200).json(trips);
  } catch (err) {
    handleError(res, err);
  }
};

const tripsFindCode = async (req, res) => {
  try {
    const trip = await Trip.findOne({ code: req.params.tripCode }).exec();

    if (!trip) {
      return res.status(404).json({ message: 'tripCode not found' });
    }

    res.status(200).json(trip);
  } catch (err) {
    handleError(res, err);
  }
};

const tripsAddTrip = async (req, res) => {
  try {
    const newTrip = await Trip.create({
      code: req.body.code,
      name: req.body.name,
      length: req.body.length,
      start: req.body.start,
      resort: req.body.resort,
      perPerson: req.body.perPerson,
      image: req.body.image,
      description: req.body.description
    });
    res.status(201).json(newTrip);
  } catch (err) {
    handleError(res, err);
  }
};

const tripsUpdateTrip = async (req, res) => {
  try {
    const updatedTrip = await Trip.findOneAndUpdate(
      { code: req.params.tripCode },
      {
        code: req.body.code,
        name: req.body.name,
        length: req.body.length,
        start: req.body.start,
        resort: req.body.resort,
        perPerson: req.body.perPerson,
        image: req.body.image,
        description: req.body.description
      },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedTrip) {
      return res.status(404).json({ message: 'tripCode not found' });
    }

    res.status(200).json(updatedTrip);
  } catch (err) {
    handleError(res, err);
  }
};

const tripsDeleteTrip = async (req, res) => {
  try {
    const deletedTrip = await Trip.findOneAndDelete({ code: req.params.tripCode });

    if (!deletedTrip) {
      return res.status(404).json({ message: 'tripCode not found' });
    }

    res.status(200).json({ message: 'Trip deleted', trip: deletedTrip });
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = {
  tripsList,
  tripsSearch,
  tripsFindCode,
  tripsAddTrip,
  tripsUpdateTrip,
  tripsDeleteTrip
};
