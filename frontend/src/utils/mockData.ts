export interface DrugRisk {
    drug: string;
    riskLevel: 'safe' | 'adjust' | 'toxic' | 'ineffective' | 'unknown';
    confidence: number;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    variants: {
        gene: string;
        rsId: string;
        diplotype: string;
        phenotype: string;
    }[];
    clinicalSummary: string;
    mechanism: string;
    cpicGuideline: string;
    recommendation: string;
}

export interface AnalysisResult {
    sampleId: string;
    timestamp: string;
    vcfFile: string;
    totalVariants: number;
    analyzedGenes: string[];
    drugs: DrugRisk[];
    overallRiskScore: number;
}

export interface Gene {
    name: string;
    function: string;
    pathway: string;
    affectedDrugs: string[];
    chromosome: string;
    variants: string[];
}

export const SUPPORTED_DRUGS = [
    'CODEINE',
    'WARFARIN',
    'CLOPIDOGREL',
    'SIMVASTATIN',
    'AZATHIOPRINE',
    'FLUOROURACIL',
] as const;

export type SupportedDrug = typeof SUPPORTED_DRUGS[number];

export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
    sampleId: 'PG-2024-001847',
    timestamp: new Date().toISOString(),
    vcfFile: 'patient_genome.vcf',
    totalVariants: 4287,
    analyzedGenes: ['CYP2D6', 'CYP2C9', 'VKORC1', 'CYP2C19', 'TPMT', 'DPYD'],
    overallRiskScore: 67,
    drugs: [
        {
            drug: 'CODEINE',
            riskLevel: 'toxic',
            confidence: 94,
            severity: 'critical',
            variants: [
                {
                    gene: 'CYP2D6',
                    rsId: 'rs1065852',
                    diplotype: '*1/*1xN',
                    phenotype: 'Ultra-rapid Metabolizer',
                },
            ],
            clinicalSummary:
                'Patient carries CYP2D6 ultra-rapid metabolizer phenotype. Codeine is rapidly converted to morphine at elevated rates, causing opioid toxicity and respiratory depression.',
            mechanism:
                'CYP2D6 enzyme converts codeine to its active metabolite morphine via O-demethylation. Ultra-rapid metabolizers produce excessive morphine concentrations, leading to life-threatening opioid toxicity.',
            cpicGuideline:
                'CPIC Grade A: Use alternative analgesic such as tramadol (with caution), morphine, or a non-opioid. Avoid codeine entirely.',
            recommendation:
                '⚠ CONTRAINDICATED: Do not use codeine. Switch to oxycodone or non-opioid analgesics. Monitor for opioid toxicity symptoms.',
        },
        {
            drug: 'WARFARIN',
            riskLevel: 'adjust',
            confidence: 88,
            severity: 'high',
            variants: [
                {
                    gene: 'CYP2C9',
                    rsId: 'rs1799853',
                    diplotype: '*1/*2',
                    phenotype: 'Intermediate Metabolizer',
                },
                {
                    gene: 'VKORC1',
                    rsId: 'rs9923231',
                    diplotype: 'G/A',
                    phenotype: 'Reduced Sensitivity',
                },
            ],
            clinicalSummary:
                'Combined CYP2C9 intermediate metabolizer and VKORC1 variant significantly affects warfarin metabolism and sensitivity. Dose reduction of 25-40% recommended.',
            mechanism:
                'CYP2C9 metabolizes the more potent S-warfarin enantiomer. Intermediate metabolizers have reduced clearance leading to drug accumulation. VKORC1 variant affects vitamin K epoxide reductase sensitivity.',
            cpicGuideline:
                'CPIC Grade A: Initiate at 25-40% lower dose. Use warfarin dosing algorithm (www.warfarindosing.org). Monitor INR closely weekly for first month.',
            recommendation:
                '💊 DOSE REDUCTION: Start at 2.5mg instead of standard 5mg. Weekly INR monitoring for 4 weeks. Target INR 2-3 for atrial fibrillation.',
        },
        {
            drug: 'CLOPIDOGREL',
            riskLevel: 'ineffective',
            confidence: 91,
            severity: 'high',
            variants: [
                {
                    gene: 'CYP2C19',
                    rsId: 'rs4244285',
                    diplotype: '*1/*2',
                    phenotype: 'Intermediate Metabolizer',
                },
            ],
            clinicalSummary:
                'Patient is a CYP2C19 intermediate metabolizer. Clopidogrel requires hepatic activation; reduced enzyme activity results in inadequate antiplatelet effect and increased cardiovascular risk.',
            mechanism:
                'Clopidogrel is a prodrug requiring CYP2C19-mediated bioactivation to its active thiol metabolite. Loss-of-function variants reduce active metabolite generation, diminishing P2Y12 receptor inhibition.',
            cpicGuideline:
                'CPIC Grade A: For ACS/PCI patients with IM phenotype, consider alternative antiplatelet agents (prasugrel or ticagrelor) unless contraindicated.',
            recommendation:
                '🔄 SWITCH THERAPY: Consider prasugrel 10mg daily or ticagrelor 90mg BID as alternative. If clopidogrel must be used, consider higher maintenance dose with platelet function testing.',
        },
        {
            drug: 'SIMVASTATIN',
            riskLevel: 'adjust',
            confidence: 79,
            severity: 'moderate',
            variants: [
                {
                    gene: 'SLCO1B1',
                    rsId: 'rs4149056',
                    diplotype: '*1/*5',
                    phenotype: 'Decreased Function',
                },
            ],
            clinicalSummary:
                'SLCO1B1 decreased function variant reduces hepatic uptake of simvastatin acid, increasing plasma concentrations and myopathy risk.',
            mechanism:
                'SLCO1B1 encodes the OATP1B1 transporter responsible for hepatic uptake of statins. Reduced transport leads to elevated systemic statin levels, increasing skeletal muscle exposure and myopathy risk.',
            cpicGuideline:
                'CPIC Grade A: Use low-intensity simvastatin ≤20mg or switch to alternative statin (rosuvastatin/pravastatin with lower myopathy risk). Avoid simvastatin 80mg.',
            recommendation:
                '📉 DOSE LIMIT: Maximum simvastatin 20mg/day. Monitor for myopathy symptoms (muscle pain, weakness). Consider switching to rosuvastatin 10mg.',
        },
        {
            drug: 'AZATHIOPRINE',
            riskLevel: 'toxic',
            confidence: 97,
            severity: 'critical',
            variants: [
                {
                    gene: 'TPMT',
                    rsId: 'rs1800460',
                    diplotype: '*1/*3A',
                    phenotype: 'Intermediate Metabolizer',
                },
            ],
            clinicalSummary:
                'TPMT intermediate metabolizer phenotype. Reduced TPMT activity leads to accumulation of cytotoxic thioguanine nucleotides, causing severe myelosuppression.',
            mechanism:
                'TPMT inactivates 6-mercaptopurine (active azathioprine metabolite). Intermediate TPMT activity allows TGN accumulation in hematopoietic cells, causing bone marrow suppression.',
            cpicGuideline:
                'CPIC Grade A: Start at 30-70% of normal dose. Monitor CBC every 2 weeks for first 3 months, then monthly. Consider NUDT15 testing for additional risk assessment.',
            recommendation:
                '⚠ DOSE REDUCTION: Reduce dose to 50mg (from standard 100-150mg). Minimum 2-weekly CBC monitoring. Hold medication if WBC <3.0 × 10⁹/L.',
        },
        {
            drug: 'FLUOROURACIL',
            riskLevel: 'safe',
            confidence: 83,
            severity: 'low',
            variants: [
                {
                    gene: 'DPYD',
                    rsId: 'rs3918290',
                    diplotype: '*1/*1',
                    phenotype: 'Normal Metabolizer',
                },
            ],
            clinicalSummary:
                'Patient carries DPYD normal metabolizer phenotype. Standard 5-FU dosing is appropriate with routine monitoring.',
            mechanism:
                'DPYD encodes dihydropyrimidine dehydrogenase, which catabolizes approximately 80% of administered 5-FU. Normal enzyme activity ensures appropriate fluorouracil clearance.',
            cpicGuideline:
                'CPIC Grade A: Normal DPYD function. Administer standard dose per protocol. Routine toxicity monitoring applies.',
            recommendation:
                '✅ STANDARD DOSE: No dose adjustment needed. Proceed with standard 5-FU dosing per oncology protocol. Routine monitoring for fluoropyrimidine toxicity.',
        },
    ],
};

export const MOCK_GENES: Record<string, Gene> = {
    CYP2D6: {
        name: 'CYP2D6',
        function: 'Cytochrome P450 2D6 – metabolizes ~25% of commonly used drugs',
        pathway: 'Hepatic oxidative metabolism (Phase I)',
        affectedDrugs: ['Codeine', 'Tramadol', 'Metoprolol', 'Tamoxifen', 'Antidepressants'],
        chromosome: '22q13.2',
        variants: ['*2', '*3', '*4', '*5', '*6', '*10', '*41'],
    },
    CYP2C9: {
        name: 'CYP2C9',
        function: 'Cytochrome P450 2C9 – metabolizes warfarin, NSAIDs, sulfonylureas',
        pathway: 'Hepatic oxidative metabolism (Phase I)',
        affectedDrugs: ['Warfarin', 'Phenytoin', 'Losartan', 'NSAIDs'],
        chromosome: '10q23.33',
        variants: ['*2', '*3', '*5', '*6', '*8', '*11'],
    },
    VKORC1: {
        name: 'VKORC1',
        function: 'Vitamin K Epoxide Reductase Complex 1 – warfarin target enzyme',
        pathway: 'Vitamin K cycle / Coagulation cascade',
        affectedDrugs: ['Warfarin', 'Acenocoumarol', 'Phenprocoumon'],
        chromosome: '16p11.2',
        variants: ['rs9923231', 'rs7294'],
    },
    CYP2C19: {
        name: 'CYP2C19',
        function: 'Cytochrome P450 2C19 – activates clopidogrel, metabolizes PPIs',
        pathway: 'Hepatic bioactivation and metabolism',
        affectedDrugs: ['Clopidogrel', 'PPIs', 'Escitalopram', 'Voriconazole'],
        chromosome: '10q24.1-q24.3',
        variants: ['*2', '*3', '*17'],
    },
    TPMT: {
        name: 'TPMT',
        function: 'Thiopurine S-methyltransferase – inactivates thiopurine drugs',
        pathway: 'Thiopurine metabolism',
        affectedDrugs: ['Azathioprine', '6-Mercaptopurine', 'Thioguanine'],
        chromosome: '6p22.3',
        variants: ['*2', '*3A', '*3B', '*3C', '*4'],
    },
    DPYD: {
        name: 'DPYD',
        function: 'Dihydropyrimidine dehydrogenase – catabolizes fluoropyrimidines',
        pathway: 'Pyrimidine catabolism',
        affectedDrugs: ['5-Fluorouracil', 'Capecitabine', 'Tegafur'],
        chromosome: '1p22',
        variants: ['*2A', 'rs2297595', 'HapB3'],
    },
    SLCO1B1: {
        name: 'SLCO1B1',
        function: 'Organic Anion Transporter – hepatic uptake of statins',
        pathway: 'Drug transport (Phase III)',
        affectedDrugs: ['Simvastatin', 'Atorvastatin', 'Repaglinide', 'Methotrexate'],
        chromosome: '12p12.2',
        variants: ['*5', '*15', '*17'],
    },
};

export const GENOMIC_TIMELINE_STEPS = [
    {
        step: 1,
        label: 'Genetic Variant',
        description: 'CYP2D6 *1/*1xN detected',
        icon: '🧬',
        color: '#22d3ee',
    },
    {
        step: 2,
        label: 'Gene Expression',
        description: 'Amplified CYP2D6 gene copies',
        icon: '🔬',
        color: '#8b5cf6',
    },
    {
        step: 3,
        label: 'Enzyme Activity',
        description: 'Ultra-rapid CYP2D6 activity (>2x normal)',
        icon: '⚗️',
        color: '#f59e0b',
    },
    {
        step: 4,
        label: 'Drug Metabolism',
        description: 'Excessive codeine → morphine conversion',
        icon: '💊',
        color: '#ef4444',
    },
    {
        step: 5,
        label: 'Clinical Outcome',
        description: 'Opioid toxicity risk – respiratory depression',
        icon: '⚠️',
        color: '#ef4444',
    },
];

export const HEATMAP_DATA = [
    { gene: 'CYP2D6', codeine: 95, warfarin: 10, clopidogrel: 15, simvastatin: 5, azathioprine: 5, fluorouracil: 5 },
    { gene: 'CYP2C9', codeine: 5, warfarin: 85, clopidogrel: 20, simvastatin: 30, azathioprine: 5, fluorouracil: 5 },
    { gene: 'VKORC1', codeine: 5, warfarin: 75, clopidogrel: 5, simvastatin: 5, azathioprine: 5, fluorouracil: 5 },
    { gene: 'CYP2C19', codeine: 10, warfarin: 10, clopidogrel: 90, simvastatin: 15, azathioprine: 5, fluorouracil: 5 },
    { gene: 'TPMT', codeine: 5, warfarin: 5, clopidogrel: 5, simvastatin: 5, azathioprine: 97, fluorouracil: 10 },
    { gene: 'DPYD', codeine: 5, warfarin: 5, clopidogrel: 5, simvastatin: 5, azathioprine: 5, fluorouracil: 15 },
    { gene: 'SLCO1B1', codeine: 5, warfarin: 15, clopidogrel: 10, simvastatin: 80, azathioprine: 5, fluorouracil: 5 },
];

export const RADAR_DATA = [
    { subject: 'Efficacy', codeine: 20, warfarin: 75, clopidogrel: 30, simvastatin: 70, azathioprine: 45, fluorouracil: 85 },
    { subject: 'Safety', codeine: 15, warfarin: 55, clopidogrel: 40, simvastatin: 65, azathioprine: 30, fluorouracil: 80 },
    { subject: 'Metabolism', codeine: 90, warfarin: 70, clopidogrel: 65, simvastatin: 60, azathioprine: 85, fluorouracil: 75 },
    { subject: 'Toxicity', codeine: 95, warfarin: 55, clopidogrel: 30, simvastatin: 40, azathioprine: 90, fluorouracil: 20 },
    { subject: 'Dosing', codeine: 10, warfarin: 60, clopidogrel: 35, simvastatin: 65, azathioprine: 45, fluorouracil: 85 },
];

export const RISK_COLORS: Record<string, string> = {
    safe: '#10b981',
    adjust: '#f59e0b',
    toxic: '#ef4444',
    ineffective: '#3b82f6',
    unknown: '#6b7280',
};

export const RISK_LABELS: Record<string, string> = {
    safe: '✅ Safe',
    adjust: '⚠️ Adjust Dosage',
    toxic: '🔴 Toxic',
    ineffective: '🔵 Ineffective',
    unknown: '⚪ Unknown',
};

export const SEVERITY_COLORS: Record<string, string> = {
    low: '#10b981',
    moderate: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
};

export interface ConfidenceDecomposition {
    evidenceStrength: number;
    variantCoverage: number;
    dataQuality: number;
    guidelineAlignment: number;
    cpicLevel: string;
}

export interface PopulationStat {
    phenotype: string;
    prevalence: number;
    ancestry: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'very rare';
    percentile: number;
}

export interface FdaBiomarkerPair {
    recognized: boolean;
    label: string;
    tooltip: string;
}

export interface AnalysisHistoryEntry {
    id: string;
    date: string;
    engineVersion: string;
    cpicVersion: string;
    overallRisk: number;
    topRiskDrug: string;
    confidenceScore: number;
    isCurrent: boolean;
}

export interface PolygenicWeight {
    gene: string;
    weight: number;
    impact: string;
}

export type ActivityLevel = 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid';

export interface EnzymeActivity {
    level: ActivityLevel;
    color: string;
    explanation: string;
}

export const CONFIDENCE_DECOMPOSITION: Record<string, ConfidenceDecomposition> = {
    CODEINE: { evidenceStrength: 96, variantCoverage: 92, dataQuality: 95, guidelineAlignment: 93, cpicLevel: 'A' },
    WARFARIN: { evidenceStrength: 92, variantCoverage: 89, dataQuality: 90, guidelineAlignment: 91, cpicLevel: 'A' },
    CLOPIDOGREL: { evidenceStrength: 94, variantCoverage: 88, dataQuality: 90, guidelineAlignment: 92, cpicLevel: 'A' },
    SIMVASTATIN: { evidenceStrength: 82, variantCoverage: 77, dataQuality: 80, guidelineAlignment: 78, cpicLevel: 'A' },
    AZATHIOPRINE: { evidenceStrength: 98, variantCoverage: 96, dataQuality: 97, guidelineAlignment: 95, cpicLevel: 'A' },
    FLUOROURACIL: { evidenceStrength: 86, variantCoverage: 82, dataQuality: 84, guidelineAlignment: 81, cpicLevel: 'A' },
};

export const POPULATION_STATS: Record<string, PopulationStat> = {
    CYP2D6: { phenotype: 'Ultra-rapid Metabolizer', prevalence: 2.1, ancestry: 'Global mixed', rarity: 'rare', percentile: 96 },
    CYP2C9: { phenotype: 'Intermediate Metabolizer', prevalence: 11.8, ancestry: 'European enriched', rarity: 'uncommon', percentile: 78 },
    VKORC1: { phenotype: 'Reduced Sensitivity', prevalence: 34.7, ancestry: 'Global', rarity: 'common', percentile: 61 },
    CYP2C19: { phenotype: 'Intermediate Metabolizer', prevalence: 27.5, ancestry: 'Asian enriched', rarity: 'common', percentile: 73 },
    TPMT: { phenotype: 'Intermediate Metabolizer', prevalence: 8.9, ancestry: 'Global mixed', rarity: 'uncommon', percentile: 91 },
    DPYD: { phenotype: 'Normal Metabolizer', prevalence: 76.2, ancestry: 'Global', rarity: 'common', percentile: 24 },
    SLCO1B1: { phenotype: 'Decreased Function', prevalence: 13.2, ancestry: 'Global mixed', rarity: 'uncommon', percentile: 84 },
};

export const FDA_BIOMARKER_PAIRS: Record<string, FdaBiomarkerPair> = {
    'CYP2D6-CODEINE': {
        recognized: true,
        label: 'FDA Biomarker',
        tooltip: 'CYP2D6 is an FDA-labeled pharmacogenomic biomarker for codeine safety and efficacy.',
    },
    'CYP2C9-WARFARIN': {
        recognized: true,
        label: 'FDA Biomarker',
        tooltip: 'CYP2C9 genotype impacts warfarin exposure and dose recommendations in FDA labeling.',
    },
    'VKORC1-WARFARIN': {
        recognized: true,
        label: 'FDA Biomarker',
        tooltip: 'VKORC1 variation affects warfarin sensitivity and initial dose strategy.',
    },
    'CYP2C19-CLOPIDOGREL': {
        recognized: true,
        label: 'FDA Biomarker',
        tooltip: 'CYP2C19 poor/intermediate metabolism can reduce clopidogrel response.',
    },
    'SLCO1B1-SIMVASTATIN': {
        recognized: true,
        label: 'FDA Biomarker',
        tooltip: 'SLCO1B1 decreased function is associated with increased simvastatin myopathy risk.',
    },
    'TPMT-AZATHIOPRINE': {
        recognized: true,
        label: 'FDA Biomarker',
        tooltip: 'TPMT activity strongly influences thiopurine toxicity risk and initial dosing.',
    },
    'DPYD-FLUOROURACIL': {
        recognized: true,
        label: 'FDA Biomarker',
        tooltip: 'DPYD deficiency increases fluoropyrimidine toxicity risk and supports dose reduction.',
    },
};

export const ANALYSIS_HISTORY: AnalysisHistoryEntry[] = [
    {
        id: 'h1',
        date: '2025-12-14T09:12:00.000Z',
        engineVersion: 'v2.2.0',
        cpicVersion: 'CPIC v23.4',
        overallRisk: 74,
        topRiskDrug: 'CODEINE',
        confidenceScore: 86,
        isCurrent: false,
    },
    {
        id: 'h2',
        date: '2026-01-08T11:45:00.000Z',
        engineVersion: 'v2.3.1',
        cpicVersion: 'CPIC v24.0',
        overallRisk: 69,
        topRiskDrug: 'AZATHIOPRINE',
        confidenceScore: 89,
        isCurrent: false,
    },
    {
        id: 'h3',
        date: '2026-02-19T15:10:00.000Z',
        engineVersion: 'v2.4.0',
        cpicVersion: 'CPIC v24.2',
        overallRisk: 67,
        topRiskDrug: 'CODEINE',
        confidenceScore: 92,
        isCurrent: true,
    },
];

export const POLYGENIC_WEIGHTS: Record<string, PolygenicWeight[]> = {
    CODEINE: [
        { gene: 'CYP2D6', weight: 58, impact: 'Primary activation pathway; copy number increase drives toxicity' },
        { gene: 'OPRM1', weight: 24, impact: 'Opioid receptor sensitivity modifier' },
        { gene: 'ABCB1', weight: 18, impact: 'CNS transport and exposure modulation' },
    ],
    WARFARIN: [
        { gene: 'CYP2C9', weight: 44, impact: 'Reduced metabolic clearance component' },
        { gene: 'VKORC1', weight: 39, impact: 'Target sensitivity and dose requirement' },
        { gene: 'CYP4F2', weight: 17, impact: 'Vitamin K cycling modifier' },
    ],
    CLOPIDOGREL: [
        { gene: 'CYP2C19', weight: 61, impact: 'Major prodrug activation determinant' },
        { gene: 'ABCB1', weight: 23, impact: 'Absorption and bioavailability influence' },
        { gene: 'PON1', weight: 16, impact: 'Minor activation pathway contribution' },
    ],
    SIMVASTATIN: [
        { gene: 'SLCO1B1', weight: 63, impact: 'Hepatic uptake and systemic exposure driver' },
        { gene: 'ABCG2', weight: 21, impact: 'Efflux transporter effect' },
        { gene: 'CYP3A4', weight: 16, impact: 'Metabolic contribution to clearance' },
    ],
    AZATHIOPRINE: [
        { gene: 'TPMT', weight: 68, impact: 'Thiopurine inactivation capacity' },
        { gene: 'NUDT15', weight: 22, impact: 'TGN handling and marrow toxicity risk' },
        { gene: 'ITPA', weight: 10, impact: 'Secondary tolerance modifier' },
    ],
    FLUOROURACIL: [
        { gene: 'DPYD', weight: 72, impact: 'Primary 5-FU catabolism determinant' },
        { gene: 'TYMS', weight: 18, impact: 'Target pathway sensitivity' },
        { gene: 'MTHFR', weight: 10, impact: 'Folate cycle modulation of toxicity' },
    ],
};

export const CYP_DRUG_ENZYME: Record<string, string[]> = {
    CODEINE: ['CYP2D6'],
    WARFARIN: ['CYP2C9', 'CYP3A4'],
    CLOPIDOGREL: ['CYP2C19', 'CYP3A4'],
    SIMVASTATIN: ['CYP3A4', 'SLCO1B1'],
    AZATHIOPRINE: ['TPMT'],
    FLUOROURACIL: ['DPYD'],
};

export const ENZYME_ACTIVITY_MAP: Record<string, EnzymeActivity> = {
    CYP2D6: {
        level: 'ultrarapid',
        color: '#ef4444',
        explanation: 'Multiple functional copies increase conversion of prodrugs such as codeine.',
    },
    CYP2C9: {
        level: 'intermediate',
        color: '#f59e0b',
        explanation: 'Reduced CYP2C9 activity can elevate exposure for CYP2C9 substrates.',
    },
    VKORC1: {
        level: 'intermediate',
        color: '#f59e0b',
        explanation: 'VKORC1 variation modifies warfarin sensitivity and initial dosing needs.',
    },
    CYP2C19: {
        level: 'intermediate',
        color: '#f59e0b',
        explanation: 'Lower activation efficiency can reduce clopidogrel antiplatelet response.',
    },
    TPMT: {
        level: 'intermediate',
        color: '#f97316',
        explanation: 'Decreased TPMT activity raises active thiopurine metabolite exposure.',
    },
    DPYD: {
        level: 'normal',
        color: '#10b981',
        explanation: 'Normal DPYD activity supports standard fluoropyrimidine dose initiation.',
    },
    SLCO1B1: {
        level: 'intermediate',
        color: '#f59e0b',
        explanation: 'Decreased transporter function can increase systemic statin concentrations.',
    },
};
