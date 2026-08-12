const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email must be a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'staff'
  }
}, {
  timestamps: true
});

// Unique index on email — the natural lookup key for authentication.
userSchema.index({ email: 1 }, { unique: true });

// Hash the password before it is ever written to the database. This runs
// only when the password field is new or has changed, so updates that
// don't touch the password don't get re-hashed.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to check a plaintext candidate against the stored hash,
// so no controller ever needs to touch bcrypt or the raw hash directly.
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Never send the password hash back in any JSON response, even by accident.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  }
});

mongoose.model('users', userSchema);
