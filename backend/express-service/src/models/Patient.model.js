const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: [true, 'Patient ID is required'],
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  // Reference to PharmaGuard records
  records: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PharmaGuardRecord'
  }]
}, {
  timestamps: true,
  collection: 'patients'
});

// Virtual for full name
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for searching
patientSchema.index({ firstName: 1, lastName: 1 });

// Static method to find patient with records
patientSchema.statics.findWithRecords = function(patientId) {
  return this.findOne({ patientId }).populate('records', '-vcfBuffer');
};

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
