const express = require('express');
const router = express.Router();
const ctrlTrips = require('../controllers/trips');

router
  .route('/trips')
  .get(ctrlTrips.tripsList)
  .post(ctrlTrips.tripsAddTrip);

// Registered before '/trips/:tripCode' so Express doesn't match "search"
// as a tripCode value.
router
  .route('/trips/search')
  .get(ctrlTrips.tripsSearch);

router
  .route('/trips/:tripCode')
  .get(ctrlTrips.tripsFindCode)
  .put(ctrlTrips.tripsUpdateTrip)
  .delete(ctrlTrips.tripsDeleteTrip);

module.exports = router;
