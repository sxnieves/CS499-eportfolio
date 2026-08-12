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
  tripsFindCode,
  tripsAddTrip,
  tripsUpdateTrip,
  tripsDeleteTrip
};
