const express = require('express');
const router = express.Router();
const ctrlTrips = require('../controllers/trips');

router
  .route('/trips')
  .get(ctrlTrips.tripsList)
  .post(ctrlTrips.tripsAddTrip);

router
  .route('/trips/:tripCode')
  .get(ctrlTrips.tripsFindCode)
  .put(ctrlTrips.tripsUpdateTrip)
  .delete(ctrlTrips.tripsDeleteTrip);

module.exports = router;
