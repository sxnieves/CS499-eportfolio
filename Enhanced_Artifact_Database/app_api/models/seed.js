console.log('seed.js started');

const mongoose = require('./db');
console.log('db loaded');

const fs = require('fs');
const path = require('path');

const tripsPath = path.join(__dirname, '../../data/trips.json');
const trips = JSON.parse(fs.readFileSync(tripsPath, 'utf8'));

const Trip = mongoose.model('trips');
const User = mongoose.model('users');
console.log('trip and user models loaded');

async function seedDB() {
  try {
    console.log('starting seed...');
    await Trip.deleteMany({});
    console.log('old trips removed');

    const result = await Trip.insertMany(trips);
    console.log(result.length + ' trips inserted');

    // Reset and seed a single default admin account. Using create() here
    // (rather than insertMany) ensures the pre('save') hashing hook on the
    // User schema actually runs, so the stored password is a bcrypt hash
    // and not plaintext.
    await User.deleteMany({});
    console.log('old users removed');

    await User.create({
      email: 'admin@travlr.example',
      password: 'ChangeMe123!',
      role: 'admin'
    });
    console.log('default admin user seeded (change this password before real use)');

    await mongoose.connection.close();
    console.log('connection closed');
  } catch (err) {
    console.error('seed error:', err);
    await mongoose.connection.close();
  }
}

seedDB();