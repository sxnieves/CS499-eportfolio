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

// Shared pagination helper used by both tripsList and tripsSearch so the
// two endpoints behave consistently instead of one being paginated and the
// other returning a bare array. Page/limit are clamped to sane values so a
// bad or malicious query string can't force an oversized scan.
const runPaginatedQuery = async (res, filter, options, req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [trips, total] = await Promise.all([
    Trip.find(filter, options.projection || null)
      .sort(options.sort)
      .skip(skip)
      .limit(limit),
    Trip.countDocuments(filter)
  ]);

  res.status(200).json({
    trips,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
};

const tripsList = async (req, res) => {
  try {
    await runPaginatedQuery(res, {}, { sort: { start: 1 } }, req);
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
//   - Database enhancement (Milestone Four): now shares the same pagination
//     helper as tripsList, so search results are bounded the same way full
//     listings are instead of returning every match in one response.
//
// Efficiency:
//   - Only matching documents are sent over the network, reducing payload
//     size and downstream Angular rendering work compared to sending the
//     full collection and filtering after the fact.
const tripsSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return runPaginatedQuery(res, {}, { sort: { start: 1 } }, req);
    }

    await runPaginatedQuery(
      res,
      { $text: { $search: q } },
      { projection: { score: { $meta: 'textScore' } }, sort: { score: { $meta: 'textScore' } } },
      req
    );
  } catch (err) {
    handleError(res, err);
  }
};

// Database enhancement (Milestone Four): aggregation pipeline reporting
// endpoint. Groups trips by resort and returns trip count, average price,
// and price range per resort — the kind of query that goes beyond basic
// find()/CRUD and shows real use of the database engine to summarize data
// rather than pulling everything back and summarizing it in application code.
const tripsStatsByResort = async (req, res) => {
  try {
    const stats = await Trip.aggregate([
      {
        $group: {
          _id: '$resort',
          tripCount: { $sum: 1 },
          averagePrice: { $avg: '$perPerson' },
          minPrice: { $min: '$perPerson' },
          maxPrice: { $max: '$perPerson' }
        }
      },
      {
        $project: {
          _id: 0,
          resort: '$_id',
          tripCount: 1,
          averagePrice: { $round: ['$averagePrice', 2] },
          minPrice: 1,
          maxPrice: 1
        }
      },
      { $sort: { tripCount: -1 } }
    ]);

    res.status(200).json(stats);
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
  tripsDeleteTrip,
  tripsStatsByResort
};
