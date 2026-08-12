const express = require('express');
const router = express.Router();
const ctrlTrips = require('../controllers/trips');
const sanitizeInput = require('../middleware/sanitize');

// Database enhancement (Milestone Four): applied to every route in this
// router so no controller has to remember to sanitize input itself.
router.use(sanitizeInput);

router
  .route('/trips')
  .get(ctrlTrips.tripsList)
  .post(ctrlTrips.tripsAddTrip);

// Registered before '/trips/:tripCode' so Express doesn't match "search"
// as a tripCode value.
router
  .route('/trips/search')
  .get(ctrlTrips.tripsSearch);

// Database enhancement (Milestone Four): reporting endpoint. Also
// registered before '/trips/:tripCode' so "stats" isn't interpreted as a
// tripCode value.
router
  .route('/trips/stats/resort')
  .get(ctrlTrips.tripsStatsByResort);

router
  .route('/trips/:tripCode')
  .get(ctrlTrips.tripsFindCode)
  .put(ctrlTrips.tripsUpdateTrip)
  .delete(ctrlTrips.tripsDeleteTrip);

module.exports = router;
