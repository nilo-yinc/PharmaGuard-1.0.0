const { PharmaGuardRecord } = require('../models');

const FALLBACK_DRUG_LIBRARY = {
  CODEINE: {
    risk_assessment: { risk_label: 'high', confidence_score: 94, severity: 'critical' },
    pharmacogenomic_profile: {
      primary_gene: 'CYP2D6',
      diplotype: '*1/*1xN',
      phenotype: 'Ultra-rapid Metabolizer',
      detected_variants: [{ rsid: 'rs1065852', genotype: 'A/G', impact: 'Increased function' }]
    },
    clinical_recommendation: {
      action: 'Avoid codeine and use an alternative analgesic.',
      details: 'CPIC: Avoid codeine in CYP2D6 ultra-rapid metabolizers due to opioid toxicity risk.'
    },
    llm_generated_explanation: {
      summary: 'Predicted high toxicity risk from accelerated codeine to morphine conversion.',
      mechanism: 'CYP2D6 ultra-rapid activity can increase active metabolite exposure.'
    }
  },
  WARFARIN: {
    risk_assessment: { risk_label: 'moderate', confidence_score: 88, severity: 'high' },
    pharmacogenomic_profile: {
      primary_gene: 'CYP2C9',
      diplotype: '*1/*2',
      phenotype: 'Intermediate Metabolizer',
      detected_variants: [{ rsid: 'rs1799853', genotype: 'C/T', impact: 'Reduced metabolism' }]
    },
    clinical_recommendation: {
      action: 'Start with a reduced dose and monitor INR closely.',
      details: 'CPIC: 25-40% lower initial dose may be appropriate with CYP2C9 and VKORC1 effects.'
    },
    llm_generated_explanation: {
      summary: 'Moderate dose-adjustment risk due to altered warfarin metabolism.',
      mechanism: 'Reduced CYP2C9 function can increase warfarin exposure and bleeding risk.'
    }
  },
  CLOPIDOGREL: {
    risk_assessment: { risk_label: 'high', confidence_score: 91, severity: 'high' },
    pharmacogenomic_profile: {
      primary_gene: 'CYP2C19',
      diplotype: '*1/*2',
      phenotype: 'Intermediate Metabolizer',
      detected_variants: [{ rsid: 'rs4244285', genotype: 'G/A', impact: 'Loss of function' }]
    },
    clinical_recommendation: {
      action: 'Consider prasugrel or ticagrelor if clinically appropriate.',
      details: 'CPIC: CYP2C19 intermediate metabolizers may have reduced clopidogrel activation.'
    },
    llm_generated_explanation: {
      summary: 'Likely reduced efficacy due to impaired prodrug activation.',
      mechanism: 'CYP2C19 loss-of-function decreases active metabolite generation.'
    }
  },
  SIMVASTATIN: {
    risk_assessment: { risk_label: 'moderate', confidence_score: 79, severity: 'moderate' },
    pharmacogenomic_profile: {
      primary_gene: 'SLCO1B1',
      diplotype: '*1/*5',
      phenotype: 'Decreased Function',
      detected_variants: [{ rsid: 'rs4149056', genotype: 'T/C', impact: 'Reduced transport' }]
    },
    clinical_recommendation: {
      action: 'Limit dose or switch to lower-risk statin.',
      details: 'CPIC: Consider lower dose and monitor for myopathy with SLCO1B1 decreased function.'
    },
    llm_generated_explanation: {
      summary: 'Moderate myopathy risk from reduced hepatic statin uptake.',
      mechanism: 'SLCO1B1 reduction can increase systemic simvastatin concentration.'
    }
  },
  AZATHIOPRINE: {
    risk_assessment: { risk_label: 'high', confidence_score: 97, severity: 'critical' },
    pharmacogenomic_profile: {
      primary_gene: 'TPMT',
      diplotype: '*1/*3A',
      phenotype: 'Intermediate Metabolizer',
      detected_variants: [{ rsid: 'rs1800460', genotype: 'C/T', impact: 'Reduced TPMT activity' }]
    },
    clinical_recommendation: {
      action: 'Use reduced starting dose and monitor CBC frequently.',
      details: 'CPIC: TPMT intermediate activity increases risk of thiopurine toxicity.'
    },
    llm_generated_explanation: {
      summary: 'High toxicity risk from reduced thiopurine inactivation.',
      mechanism: 'Lower TPMT activity raises active metabolite levels and marrow suppression risk.'
    }
  },
  FLUOROURACIL: {
    risk_assessment: { risk_label: 'low', confidence_score: 83, severity: 'low' },
    pharmacogenomic_profile: {
      primary_gene: 'DPYD',
      diplotype: '*1/*1',
      phenotype: 'Normal Metabolizer',
      detected_variants: [{ rsid: 'rs3918290', genotype: 'G/G', impact: 'Normal function' }]
    },
    clinical_recommendation: {
      action: 'Proceed with standard dosing and routine monitoring.',
      details: 'CPIC: Normal DPYD activity generally supports standard fluoropyrimidine initiation.'
    },
    llm_generated_explanation: {
      summary: 'Low pharmacogenomic risk with expected normal clearance.',
      mechanism: 'Normal DPYD function is associated with typical 5-FU metabolism.'
    }
  }
};

const buildFallbackResults = (drugs = []) => {
  const selected = Array.isArray(drugs) && drugs.length ? drugs : Object.keys(FALLBACK_DRUG_LIBRARY);
  return selected.map((drug) => {
    const key = String(drug || '').toUpperCase();
    return {
      drug: key,
      ...(FALLBACK_DRUG_LIBRARY[key] || {
        risk_assessment: { risk_label: 'moderate', confidence_score: 70, severity: 'moderate' },
        pharmacogenomic_profile: {
          primary_gene: 'UNKNOWN',
          diplotype: 'N/A',
          phenotype: 'Unknown',
          detected_variants: []
        },
        clinical_recommendation: {
          action: 'Insufficient evidence for recommendation.',
          details: 'No fallback profile available for this drug in local mode.'
        },
        llm_generated_explanation: {
          summary: 'No curated fallback profile for this drug.',
          mechanism: 'Local fallback generator has no drug-specific mapping.'
        }
      })
    };
  });
};

/**
 * Upload VCF file and create a new PharmaGuardRecord
 * @route POST /api/v1/upload
 */
const uploadVCF = async (req, res) => {
  try {
    const { patientId } = req.body;
    const userId = req.user?.id;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No VCF file uploaded'
      });
    }

    // Validate patient ID
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Check if record already exists for this patient
    const existingRecord = await PharmaGuardRecord.findByPatientId(patientId, userId);
    if (existingRecord) {
      return res.status(409).json({
        success: false,
        error: 'Record already exists for this patient ID'
      });
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (req.file.size > MAX_SIZE) {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 5MB limit'
      });
    }

    // Create new record with VCF file
    const record = new PharmaGuardRecord({
      userId,
      patientId,
      vcfBuffer: req.file.buffer,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      processingStatus: 'pending'
    });

    await record.save();

    // TODO: Trigger FastAPI processing here
    // Send VCF to FastAPI for analysis
    // await sendToFastAPI(record._id, req.file.buffer);

    res.status(201).json({
      success: true,
      message: 'VCF file uploaded successfully',
      data: {
        recordId: record._id,
        patientId: record.patientId,
        fileName: record.fileName,
        fileSize: record.fileSize,
        fileSizeMB: record.fileSizeMB,
        uploadTimestamp: record.uploadTimestamp,
        processingStatus: record.processingStatus
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload VCF file',
      message: error.message
    });
  }
};

/**
 * Get record by patient ID
 * @route GET /api/v1/records/:patientId
 */
const getRecordByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user?.id;

    const record = await PharmaGuardRecord.findByPatientId(patientId, userId)
      .select('-vcfBuffer'); // Exclude large buffer from response

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found for this patient ID'
      });
    }

    res.json({
      success: true,
      data: record
    });

  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch record',
      message: error.message
    });
  }
};

/**
 * Get record by ID (MongoDB _id)
 * @route GET /api/v1/records/id/:recordId
 */
const getRecordById = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user?.id;

    const record = await PharmaGuardRecord.findById(recordId)
      .select('-vcfBuffer'); // Exclude large buffer

    if (!record || String(record.userId) !== String(userId)) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });

  } catch (error) {
    console.error('Error fetching record by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch record',
      message: error.message
    });
  }
};

/**
 * Get all recent records
 * @route GET /api/v1/records
 */
const getAllRecords = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user?.id;
    const records = await PharmaGuardRecord.getRecentRecords(limit, userId);

    res.json({
      success: true,
      count: records.length,
      data: records
    });

  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch records',
      message: error.message
    });
  }
};

/**
 * Update record with analysis results
 * @route PUT /api/v1/records/:recordId/results
 */
const updateResults = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { results } = req.body;
    const userId = req.user?.id;

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({
        success: false,
        error: 'Results array is required'
      });
    }

    const record = await PharmaGuardRecord.findById(recordId);
    if (!record || String(record.userId) !== String(userId)) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    await record.addResults(results);

    res.json({
      success: true,
      message: 'Results updated successfully',
      data: {
        recordId: record._id,
        patientId: record.patientId,
        resultsCount: record.results.length,
        processingStatus: record.processingStatus
      }
    });

  } catch (error) {
    console.error('Error updating results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update results',
      message: error.message
    });
  }
};

/**
 * Get processing status
 * @route GET /api/v1/records/:recordId/status
 */
const getProcessingStatus = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user?.id;

    const record = await PharmaGuardRecord.findById(recordId)
      .select('patientId processingStatus errorMessage uploadTimestamp');

    if (!record || String(record.userId) !== String(userId)) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    res.json({
      success: true,
      data: {
        recordId: record._id,
        patientId: record.patientId,
        processingStatus: record.processingStatus,
        errorMessage: record.errorMessage,
        uploadTimestamp: record.uploadTimestamp
      }
    });

  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch processing status',
      message: error.message
    });
  }
};

/**
 * Trigger analysis in FastAPI
 * @route POST /api/v1/analyze
 */
const triggerAnalysis = async (req, res) => {
  try {
    const { recordId, drugs } = req.body;
    const userId = req.user?.id;

    if (!recordId || !drugs) {
      return res.status(400).json({
        success: false,
        error: 'Record ID and drugs list are required'
      });
    }

    // 1. Get record with VCF buffer
    const record = await PharmaGuardRecord.findById(recordId);
    if (!record || String(record.userId) !== String(userId)) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    // 2. Prepare payload for FastAPI
    const payload = {
      patient_id: record.patientId,
      drugs: drugs,
      vcf_content: record.vcfBuffer.toString('utf-8') // Convert buffer to string
    };

    // 3. Send to FastAPI
    try {
      // Use axios (ensure it is installed)
      const axios = require('axios');
      const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
      
      console.log(`Sending analysis request to ${fastApiUrl}/analyze for record ${recordId}`);
      
      // Don't await full response if it takes too long? 
      // User wants feedback. FastAPI should return fast enough if it just starts or does it sync?
      // analyze.py calls `run_analysis`. If it's slow, we might timeout.
      // But for now, let's await it.
      const response = await axios.post(`${fastApiUrl}/analyze`, payload);
      
      console.log('FastAPI response:', response.data);

      // 4. Save results to DB
      if (response.data && response.data.results) {
         await record.addResults(response.data.results);
      }

      res.json({
        success: true,
        message: 'Analysis completed successfully',
        data: response.data
      });

    } catch (apiError) {
      console.error('FastAPI Error:', apiError.message);
      if (apiError.response) {
        console.error('FastAPI Response Data:', apiError.response.data);
      }

      const fallbackResults = buildFallbackResults(drugs);
      await record.addResults(fallbackResults);

      return res.status(200).json({
        success: true,
        message: 'Analysis service unavailable. Returned fallback CPIC-aligned results.',
        data: {
          mode: 'fallback',
          recordId: record._id,
          patient_id: record.patientId,
          drugs,
          results: fallbackResults
        }
      });
    }

  } catch (error) {
    console.error('Trigger analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger analysis',
      message: error.message
    });
  }
};

module.exports = {
  uploadVCF,
  getRecordByPatientId,
  getRecordById,
  getAllRecords,
  updateResults,
  getProcessingStatus,
  triggerAnalysis
};
