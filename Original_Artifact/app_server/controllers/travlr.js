const mongoose = require('mongoose');
const Trip = mongoose.model('trips');

const renderPage = (view, title) => (req, res) => {
  res.render(view, { title });
};

const travel = async (req, res) => {
  try {
    const trips = await Trip.find({});
    res.render('travel', {
      title: 'Travel - Travlr Getaways',
      trips
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving trips');
  }
};

module.exports = {
  home: renderPage('index', 'Travlr Getaways'),
  travel,
  rooms: renderPage('rooms', 'Rooms - Travlr Getaways'),
  meals: renderPage('meals', 'Meals - Travlr Getaways'),
  news: renderPage('news', 'News - Travlr Getaways'),
  about: renderPage('about', 'About - Travlr Getaways'),
  contact: renderPage('contact', 'Contact - Travlr Getaways')
};