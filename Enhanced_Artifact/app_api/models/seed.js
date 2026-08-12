console.log('seed.js started');

const mongoose = require('./db');
console.log('db loaded');

const fs = require('fs');
const path = require('path');

const tripsPath = path.join(__dirname, '../../data/trips.json');
const trips = JSON.parse(fs.readFileSync(tripsPath, 'utf8'));

const Trip = mongoose.model('trips');
console.log('trip model loaded');

async function seedDB() {
  try {
    console.log('starting seed...');
    await Trip.deleteMany({});
    console.log('old trips removed');

    const result = await Trip.insertMany(trips);
    console.log(result.length + ' trips inserted');

    await mongoose.connection.close();
    console.log('connection closed');
  } catch (err) {
    console.error('seed error:', err);
    await mongoose.connection.close();
  }
}

seedDB();