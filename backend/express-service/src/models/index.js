// Export all models from a single file for easy imports
const PharmaGuardRecord = require('./PharmaGuardRecord.model');
const Patient = require('./Patient.model');
const Medication = require('./Medication.model');

module.exports = {
  PharmaGuardRecord,
  Patient,
  Medication
};
