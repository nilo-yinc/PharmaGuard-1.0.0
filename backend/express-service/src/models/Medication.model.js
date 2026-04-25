const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  drugName: {
    type: String,
    required: [true, 'Drug name is required'],
    unique: true,
    trim: true,
    index: true
  },
  genericName: {
    type: String,
    trim: true
  },
  brandNames: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  dosageForm: {
    type: String,
    enum: ['tablet', 'capsule', 'liquid', 'injection', 'topical', 'inhaler', 'patch', 'other'],
    required: true
  },
  strength: {
    type: String,
    required: true
  },
  // Pharmacogenomic information
  associatedGenes: [{
    type: String,
    trim: true
  }],
  interactions: [{
    type: String
  }],
  contraindications: [{
    type: String
  }],
  sideEffects: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'medications'
});

// Index for searching
medicationSchema.index({ drugName: 'text', genericName: 'text' });
medicationSchema.index({ category: 1 });

// Static method to search medications
medicationSchema.statics.searchByName = function(searchTerm) {
  return this.find({
    $or: [
      { drugName: new RegExp(searchTerm, 'i') },
      { genericName: new RegExp(searchTerm, 'i') },
      { brandNames: new RegExp(searchTerm, 'i') }
    ]
  });
};

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;
