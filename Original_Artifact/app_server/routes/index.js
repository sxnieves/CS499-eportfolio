const express = require('express');
const router = express.Router();
const ctrlTravlr = require('../controllers/travlr');

router.get('/', ctrlTravlr.home);
router.get('/travel', ctrlTravlr.travel);
router.get('/rooms', ctrlTravlr.rooms);
router.get('/meals', ctrlTravlr.meals);
router.get('/news', ctrlTravlr.news);
router.get('/about', ctrlTravlr.about);
router.get('/contact', ctrlTravlr.contact);

module.exports = router;
