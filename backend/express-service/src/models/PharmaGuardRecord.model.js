const mongoose = require('mongoose');

// Sub-schema for detected variants
const detectedVariantSchema = new mongoose.Schema({
  rsid: {
    type: String,
    required: true
  },
  genotype: {
    type: String,
    required: true
  },
  impact: {
    type: String,
    required: true
  }
}, { _id: false });

// Sub-schema for pharmacogenomic profile
const pharmacogenomicProfileSchema = new mongoose.Schema({
  primary_gene: {
    type: String,
    required: true
  },
  diplotype: {
    type: String,
    required: true
  },
  phenotype: {
    type: String,
    required: true
  },
  detected_variants: [detectedVariantSchema]
}, { _id: false });

// Sub-schema for risk assessment
const riskAssessmentSchema = new mongoose.Schema({
  risk_label: {
    type: String,
    enum: ['low', 'moderate', 'high', 'very_high'],
    required: true
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'mild', 'moderate', 'high', 'severe', 'critical'],
    required: true
  }
}, { _id: false });

// Sub-schema for each drug result
const drugResultSchema = new mongoose.Schema({
  drug: {
    type: String,
    required: true
  },
  risk_assessment: {
    type: riskAssessmentSchema,
    required: true
  },
  pharmacogenomic_profile: {
    type: pharmacogenomicProfileSchema,
    required: true
  },
  clinical_recommendation: {
    action: {
      type: String
    },
    details: {
      type: String
    }
  },
  llm_generated_explanation: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { _id: false });

// Main PharmaGuardRecord schema
const pharmaGuardRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true,
  },
  patientId: {
    type: String,
    required: [true, 'Patient ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  vcfBuffer: {
    type: Buffer,
    required: [true, 'VCF file buffer is required'],
    validate: {
      validator: function(buffer) {
        // Validate buffer size (max 5MB)
        return buffer && buffer.length <= 5 * 1024 * 1024;
      },
      message: 'VCF file must not exceed 5MB'
    }
  },
  uploadTimestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  results: {
    type: [drugResultSchema],
    default: []
  },
  // Additional metadata fields
  fileName: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'pharma_guard_records'
});

// Indexes for better query performance
pharmaGuardRecordSchema.index({ uploadTimestamp: -1 });
pharmaGuardRecordSchema.index({ processingStatus: 1 });
pharmaGuardRecordSchema.index({ userId: 1, uploadTimestamp: -1 });

// Virtual for file size in MB
pharmaGuardRecordSchema.virtual('fileSizeMB').get(function() {
  return this.fileSize ? (this.fileSize / (1024 * 1024)).toFixed(2) : 0;
});

// Method to add results after AI processing
pharmaGuardRecordSchema.methods.addResults = function(resultsArray) {
  this.results = resultsArray;
  this.processingStatus = 'completed';
  return this.save();
};

// Method to mark as failed
pharmaGuardRecordSchema.methods.markAsFailed = function(errorMsg) {
  this.processingStatus = 'failed';
  this.errorMessage = errorMsg;
  return this.save();
};

// Static method to find by patient ID
pharmaGuardRecordSchema.statics.findByPatientId = function(patientId, userId) {
  const query = { patientId };
  if (userId) query.userId = userId;
  return this.findOne(query);
};

// Static method to get recent records
pharmaGuardRecordSchema.statics.getRecentRecords = function(limit = 10, userId) {
  const query = userId ? { userId } : {};
  return this.find(query)
    .sort({ uploadTimestamp: -1 })
    .limit(limit)
    .select('-vcfBuffer'); // Exclude buffer from results
};

// Pre-save middleware to update processing status
pharmaGuardRecordSchema.pre('save', function() {
  if (this.isNew) {
    this.processingStatus = 'pending';
  }
});

const PharmaGuardRecord = mongoose.model('PharmaGuardRecord', pharmaGuardRecordSchema);

module.exports = PharmaGuardRecord;
