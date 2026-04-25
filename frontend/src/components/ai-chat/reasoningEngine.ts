// ─── PharmaGuard Clinical Reasoning Engine ──────────────────────────────────
// Local JSON-based intelligence for context-aware clinical chat responses.
// No external API calls. All reasoning is deterministic against report data.

import {
    CONFIDENCE_DECOMPOSITION,
    POPULATION_STATS,
    MOCK_GENES,
    ENZYME_ACTIVITY_MAP,
    POLYGENIC_WEIGHTS,
} from '../../utils/mockData';
import type { StoredAnalysis, StoredDrugRisk } from '../../services/storageService';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ChatMode = 'clinical' | 'patient' | 'research';

export interface ReportContext {
    patientId: string;
    drugs: StoredDrugRisk[];
    drugNames: string[];
    analyzedGenes: string[];
    totalVariants: number;
    overallRiskScore: number;
    confidenceScore: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    isCritical?: boolean;
}

// ─── Context Builder ────────────────────────────────────────────────────────

export function buildReportContext(analysis: StoredAnalysis): ReportContext {
    return {
        patientId: analysis.sampleId || analysis.userId,
        drugs: analysis.results,
        drugNames: analysis.drugsAnalyzed,
        analyzedGenes: analysis.analyzedGenes,
        totalVariants: analysis.totalVariants,
        overallRiskScore: analysis.overallRiskScore,
        confidenceScore: analysis.confidenceScore,
    };
}

// ─── Intent Detection ───────────────────────────────────────────────────────

type Intent =
    | 'drug_risk'
    | 'safer_alternative'
    | 'evidence_strength'
    | 'simple_explanation'
    | 'compare_drugs'
    | 'is_critical'
    | 'monitoring'
    | 'drug_ranking'
    | 'confidence_why'
    | 'what_if'
    | 'general';

function detectIntent(query: string): { intent: Intent; drugHint?: string; geneHint?: string; confidenceHint?: number } {
    const q = query.toLowerCase();

    // What-if simulation
    if (q.includes('what if') || q.includes('what-if') || q.includes('hypothetical')) {
        const geneMatch = q.match(/\b(cyp2d6|cyp2c9|cyp2c19|vkorc1|tpmt|dpyd|slco1b1)\b/i);
        return { intent: 'what_if', geneHint: geneMatch?.[1]?.toUpperCase() };
    }

    // Confidence question
    const confMatch = q.match(/(\d{1,3})%?\s*confidence/i) || q.match(/confidence.*?(\d{1,3})%?/i) || q.match(/why\s+(\d{1,3})%/i);
    if (confMatch || q.includes('confidence') && (q.includes('why') || q.includes('how'))) {
        return { intent: 'confidence_why', confidenceHint: confMatch ? parseInt(confMatch[1]) : undefined };
    }

    // Drug ranking / safest
    if (q.includes('safest') || q.includes('rank') || q.includes('which is safe') || q.includes('order by risk') || q.includes('compare all')) {
        return { intent: 'drug_ranking' };
    }

    // Compare
    if (q.includes('compare') || q.includes('versus') || q.includes(' vs ')) {
        return { intent: 'compare_drugs' };
    }

    // Critical
    if (q.includes('critical') || q.includes('dangerous') || q.includes('life-threatening') || q.includes('emergency')) {
        return { intent: 'is_critical' };
    }

    // Monitoring
    if (q.includes('monitor') || q.includes('follow-up') || q.includes('watch for') || q.includes('test') || q.includes('lab')) {
        return { intent: 'monitoring' };
    }

    // Safer alternative
    if (q.includes('alternative') || q.includes('safer') || q.includes('substitute') || q.includes('replace') || q.includes('switch')) {
        return { intent: 'safer_alternative' };
    }

    // Evidence strength
    if (q.includes('evidence') || q.includes('strong') || q.includes('reliable') || q.includes('guideline level')) {
        return { intent: 'evidence_strength' };
    }

    // Simple explanation
    if (q.includes('simple') || q.includes('plain') || q.includes('explain like') || q.includes('layman') || q.includes('easy to understand')) {
        return { intent: 'simple_explanation' };
    }

    // Drug risk
    if (q.includes('risky') || q.includes('risk') || q.includes('why is') || q.includes('toxic') || q.includes('danger')) {
        const drugMatch = findDrugInQuery(q);
        return { intent: 'drug_risk', drugHint: drugMatch };
    }

    // Fallback: check if a specific drug is mentioned
    const drugMention = findDrugInQuery(q);
    if (drugMention) {
        return { intent: 'drug_risk', drugHint: drugMention };
    }

    return { intent: 'general' };
}

function findDrugInQuery(q: string): string | undefined {
    const drugs = ['codeine', 'warfarin', 'clopidogrel', 'simvastatin', 'azathioprine', 'fluorouracil'];
    return drugs.find(d => q.includes(d))?.toUpperCase();
}

// ─── Response Generators ────────────────────────────────────────────────────

function generateDrugRiskResponse(ctx: ReportContext, mode: ChatMode, drugName?: string): { text: string; isCritical: boolean } {
    const drug = drugName
        ? ctx.drugs.find(d => d.drug.toUpperCase() === drugName.toUpperCase())
        : ctx.drugs.find(d => d.riskLevel === 'toxic') || ctx.drugs[0];

    if (!drug) return { text: 'No matching drug found in this analysis.', isCritical: false };

    const isCritical = drug.riskLevel === 'toxic' || drug.severity === 'critical';
    const variant = drug.variants[0];
    const gene = variant?.gene || 'Unknown';
    const phenotype = variant?.phenotype || 'Unknown';

    if (mode === 'patient') {
        return {
            text: `**About ${drug.drug}**\n\n` +
                `Your genetic test found a variation in the ${gene} gene. ` +
                `This means your body processes ${drug.drug.toLowerCase()} differently than most people.\n\n` +
                (isCritical
                    ? `This is a significant finding. Your doctor should know about this before prescribing ${drug.drug.toLowerCase()}.\n\n`
                    : `This finding suggests your doctor may want to adjust how this medication is used.\n\n`) +
                `**What this means for you:** ${drug.recommendation}\n\n` +
                `The confidence in this finding is ${drug.confidence}%, which means the evidence supporting it is ${drug.confidence >= 90 ? 'very strong' : drug.confidence >= 75 ? 'strong' : 'moderate'}.`,
            isCritical,
        };
    }

    if (mode === 'research') {
        const polyWeights = POLYGENIC_WEIGHTS[drug.drug.toUpperCase()];
        const enzymeData = ENZYME_ACTIVITY_MAP[gene];
        return {
            text: `**Pharmacogenomic Risk Analysis: ${drug.drug}**\n\n` +
                `**Primary Gene:** ${gene}\n` +
                `**Diplotype:** ${variant?.diplotype || 'N/A'}\n` +
                `**Phenotype:** ${phenotype}\n` +
                `**Risk Classification:** ${drug.riskLevel.toUpperCase()} (Severity: ${drug.severity})\n\n` +
                `**Molecular Mechanism:**\n${drug.mechanism}\n\n` +
                (enzymeData ? `**Enzyme Activity Level:** ${enzymeData.level} -- ${enzymeData.explanation}\n\n` : '') +
                (polyWeights
                    ? `**Polygenic Contribution:**\n${polyWeights.map(pw => `- ${pw.gene} (weight: ${pw.weight}%): ${pw.impact}`).join('\n')}\n\n`
                    : '') +
                `**Confidence Decomposition:**\n` +
                `Evidence strength, guideline alignment, and variant-level data all contribute to the ${drug.confidence}% composite score. ` +
                `See confidence clarification for full breakdown.\n\n` +
                `**CPIC Guideline:** ${drug.cpicGuideline}`,
            isCritical,
        };
    }

    // Clinical mode
    return {
        text: `**${drug.drug} -- Risk Assessment**\n\n` +
            `**Gene/Variant:** ${gene} ${variant?.diplotype || ''} (${variant?.rsId || ''})\n` +
            `**Phenotype:** ${phenotype}\n` +
            `**Risk Level:** ${drug.riskLevel.toUpperCase()} | Severity: ${drug.severity.toUpperCase()}\n` +
            `**Confidence:** ${drug.confidence}%\n\n` +
            `**Clinical Summary:**\n${drug.clinicalSummary}\n\n` +
            `**Mechanism:**\n${drug.mechanism}\n\n` +
            `**CPIC Guideline:**\n${drug.cpicGuideline}\n\n` +
            `**Recommendation:**\n${drug.recommendation}`,
        isCritical,
    };
}

function generateDrugRanking(ctx: ReportContext, mode: ChatMode): { text: string; isCritical: boolean } {
    const riskWeight: Record<string, number> = { toxic: 100, ineffective: 70, adjust: 40, safe: 10, unknown: 50 };
    const sevWeight: Record<string, number> = { critical: 40, high: 30, moderate: 20, low: 10 };

    const ranked = [...ctx.drugs]
        .map(d => ({
            drug: d.drug,
            riskLevel: d.riskLevel,
            severity: d.severity,
            confidence: d.confidence,
            composite: (riskWeight[d.riskLevel] || 50) + (sevWeight[d.severity] || 20) - (d.confidence * 0.1),
        }))
        .sort((a, b) => a.composite - b.composite);

    const isCritical = ranked.some(r => r.riskLevel === 'toxic');

    if (mode === 'patient') {
        return {
            text: `**Drug Safety Ranking (Safest to Most Concerning)**\n\n` +
                ranked.map((r, i) => {
                    const label = r.riskLevel === 'safe' ? 'Generally safe for you'
                        : r.riskLevel === 'adjust' ? 'May need dose adjustment'
                            : r.riskLevel === 'toxic' ? 'Not recommended based on your genetics'
                                : r.riskLevel === 'ineffective' ? 'May not work well for you'
                                    : 'More information needed';
                    return `${i + 1}. **${r.drug}** -- ${label}`;
                }).join('\n') +
                `\n\nThis ranking is based on your personal genetic profile. Always discuss changes with your healthcare provider.`,
            isCritical,
        };
    }

    return {
        text: `**Drug Safety Ranking (Composite Score: Lower = Safer)**\n\n` +
            `| Rank | Drug | Risk | Severity | Confidence | Composite |\n` +
            `|------|------|------|----------|------------|-----------|\n` +
            ranked.map((r, i) =>
                `| ${i + 1} | ${r.drug} | ${r.riskLevel.toUpperCase()} | ${r.severity} | ${r.confidence}% | ${r.composite.toFixed(1)} |`
            ).join('\n') +
            `\n\n**Scoring Method:** Risk classification weight + severity weight - confidence adjustment. ` +
            `Lower composite indicates better safety profile for this patient's genotype.` +
            (isCritical ? `\n\n**ALERT:** One or more drugs carry toxic-level risk and should be avoided or substituted.` : ''),
        isCritical,
    };
}

function generateConfidenceExplanation(ctx: ReportContext, mode: ChatMode, targetConfidence?: number): { text: string; isCritical: boolean } {
    const drug = targetConfidence
        ? ctx.drugs.find(d => d.confidence === targetConfidence)
        : ctx.drugs[0];

    if (!drug) {
        const closest = ctx.drugs.reduce((prev, curr) =>
            targetConfidence && Math.abs(curr.confidence - targetConfidence) < Math.abs(prev.confidence - targetConfidence) ? curr : prev
        );
        return generateConfidenceForDrug(closest, mode);
    }
    return generateConfidenceForDrug(drug, mode);
}

function generateConfidenceForDrug(drug: StoredDrugRisk, mode: ChatMode): { text: string; isCritical: boolean } {
    const decomp = CONFIDENCE_DECOMPOSITION[drug.drug.toUpperCase()];
    const gene = drug.variants[0]?.gene || 'Unknown';
    const popStat = POPULATION_STATS[gene];

    if (mode === 'patient') {
        return {
            text: `**Understanding the ${drug.confidence}% Confidence for ${drug.drug}**\n\n` +
                `This number tells us how sure we are about the finding. A score of ${drug.confidence}% means ` +
                `${drug.confidence >= 90 ? 'we are very confident' : drug.confidence >= 75 ? 'we have good confidence' : 'there is moderate confidence'} in this result.\n\n` +
                `**What affects this score:**\n` +
                `- How well-studied the genetic variant is\n` +
                `- Whether clinical guidelines cover this specific situation\n` +
                `- The quality of the genetic data from your test\n` +
                `- Whether any important genetic information is missing\n\n` +
                (popStat ? `About ${popStat.prevalence}% of the general population shares a similar genetic profile for ${gene}.` : ''),
            isCritical: false,
        };
    }

    if (!decomp) {
        return {
            text: `**Confidence Score: ${drug.confidence}% for ${drug.drug}**\n\nDetailed decomposition data is not available for this drug in the current analysis pipeline.`,
            isCritical: false,
        };
    }

    if (mode === 'research') {
        return {
            text: `**Confidence Decomposition: ${drug.drug} (${drug.confidence}%)**\n\n` +
                `| Component | Score | Weight |\n` +
                `|-----------|-------|--------|\n` +
                `| Evidence Strength | ${decomp.evidenceStrength}% | Primary literature and clinical trial data |\n` +
                `| Variant Coverage | ${decomp.variantCoverage}% | Proportion of known functional variants detected |\n` +
                `| Data Quality | ${decomp.dataQuality}% | Sequencing depth, call quality, and coverage metrics |\n` +
                `| Guideline Alignment | ${decomp.guidelineAlignment}% | CPIC/DPWG guideline applicability |\n\n` +
                `**CPIC Evidence Level:** ${decomp.cpicLevel}\n\n` +
                (popStat
                    ? `**Population Context:** ${gene} ${popStat.phenotype} phenotype occurs in ~${popStat.prevalence}% of ${popStat.ancestry} populations (${popStat.rarity}, ${popStat.percentile}th percentile).\n\n`
                    : '') +
                `**Potential Gaps:**\n` +
                `- ${decomp.variantCoverage < 90 ? 'Some known functional variants may not be covered by the input VCF' : 'Good variant coverage detected'}\n` +
                `- ${decomp.guidelineAlignment < 90 ? 'Partial guideline coverage -- some edge cases may not be addressed' : 'Strong guideline alignment'}`,
            isCritical: false,
        };
    }

    // Clinical
    return {
        text: `**Confidence Analysis: ${drug.drug} -- ${drug.confidence}%**\n\n` +
            `**Evidence Strength:** ${decomp.evidenceStrength}%\n` +
            `**Variant Coverage:** ${decomp.variantCoverage}%\n` +
            `**Data Quality:** ${decomp.dataQuality}%\n` +
            `**Guideline Alignment:** ${decomp.guidelineAlignment}%\n` +
            `**CPIC Level:** ${decomp.cpicLevel}\n\n` +
            `The composite score reflects weighted contributions from variant-level evidence, ` +
            `sequencing quality metrics, and alignment with CPIC pharmacogenomic guidelines.\n\n` +
            (decomp.variantCoverage < 85
                ? `**Note:** Variant coverage below 85% indicates potential missing annotations that could refine this assessment.`
                : `Variant coverage is adequate for clinical decision support.`),
        isCritical: false,
    };
}

function generateWhatIf(ctx: ReportContext, mode: ChatMode, geneHint?: string): { text: string; isCritical: boolean } {
    const gene = geneHint || ctx.drugs[0]?.variants[0]?.gene || 'CYP2C19';
    const affectedDrugs = ctx.drugs.filter(d => d.variants.some(v => v.gene.toUpperCase() === gene.toUpperCase()));

    if (affectedDrugs.length === 0) {
        return { text: `No drugs in this analysis are directly affected by ${gene} variants.`, isCritical: false };
    }

    const simulations = affectedDrugs.map(drug => {
        const originalRisk = drug.riskLevel;
        const simulatedRisk = originalRisk === 'toxic' ? 'safe' : originalRisk === 'adjust' ? 'safe' : originalRisk === 'ineffective' ? 'safe' : originalRisk;
        const originalSeverity = drug.severity;
        const simulatedSeverity = originalSeverity === 'critical' ? 'low' : originalSeverity === 'high' ? 'low' : 'low';

        return { drug: drug.drug, gene, originalRisk, simulatedRisk, originalSeverity, simulatedSeverity };
    });

    if (mode === 'patient') {
        return {
            text: `**What If Your ${gene} Gene Worked Normally?**\n\n` +
                `If your ${gene} gene had typical activity, here is how things would change:\n\n` +
                simulations.map(s =>
                    `- **${s.drug}:** Would likely change from "${s.originalRisk}" to "${s.simulatedRisk}" risk. ` +
                    `This means ${s.simulatedRisk === 'safe' ? 'it would generally be safe to use at standard doses' : 'some caution may still apply'}.`
                ).join('\n') +
                `\n\nThis is a hypothetical scenario. Your actual genetic profile is what matters for clinical decisions.`,
            isCritical: false,
        };
    }

    return {
        text: `**What-If Simulation: ${gene} Normal Metabolizer Phenotype**\n\n` +
            `| Drug | Original Risk | Simulated Risk | Original Severity | Simulated Severity |\n` +
            `|------|--------------|----------------|-------------------|--------------------|\n` +
            simulations.map(s =>
                `| ${s.drug} | ${s.originalRisk.toUpperCase()} | ${s.simulatedRisk.toUpperCase()} | ${s.originalSeverity} | ${s.simulatedSeverity} |`
            ).join('\n') +
            `\n\n**Interpretation:** Normalizing ${gene} function would remove the primary pharmacogenomic risk driver for ` +
            `${simulations.map(s => s.drug).join(', ')}. Standard dosing protocols would apply.\n\n` +
            `**Disclaimer:** This is a computational simulation. Actual phenotype changes depend on complex polygenic interactions.`,
        isCritical: false,
    };
}

function generateSaferAlternative(ctx: ReportContext, mode: ChatMode, drugHint?: string): { text: string; isCritical: boolean } {
    const alternatives: Record<string, { alt: string; reasoning: string }[]> = {
        CODEINE: [
            { alt: 'Morphine (direct administration)', reasoning: 'Bypasses CYP2D6 activation pathway entirely' },
            { alt: 'Oxycodone', reasoning: 'Less dependent on CYP2D6 for activation' },
            { alt: 'Non-opioid analgesics (NSAIDs, acetaminophen)', reasoning: 'No CYP2D6 involvement' },
        ],
        WARFARIN: [
            { alt: 'Direct oral anticoagulants (DOACs)', reasoning: 'Rivaroxaban, apixaban do not require CYP2C9/VKORC1 dose adjustment' },
            { alt: 'Low-dose warfarin with frequent INR monitoring', reasoning: 'Mitigates risk through dose titration' },
        ],
        CLOPIDOGREL: [
            { alt: 'Prasugrel', reasoning: 'Does not require CYP2C19 activation' },
            { alt: 'Ticagrelor', reasoning: 'Direct-acting P2Y12 inhibitor, no prodrug conversion needed' },
        ],
        SIMVASTATIN: [
            { alt: 'Rosuvastatin', reasoning: 'Lower SLCO1B1 interaction and myopathy risk' },
            { alt: 'Pravastatin', reasoning: 'Minimal SLCO1B1 dependence' },
        ],
        AZATHIOPRINE: [
            { alt: 'Mycophenolate mofetil', reasoning: 'Alternative immunosuppressant not dependent on TPMT' },
            { alt: 'Reduced-dose azathioprine with CBC monitoring', reasoning: 'Mitigates risk while maintaining therapy' },
        ],
        FLUOROURACIL: [
            { alt: 'Standard dosing appropriate', reasoning: 'Normal DPYD function detected -- no alternative needed' },
        ],
    };

    const targetDrugs = drugHint
        ? ctx.drugs.filter(d => d.drug.toUpperCase() === drugHint.toUpperCase())
        : ctx.drugs.filter(d => d.riskLevel === 'toxic' || d.riskLevel === 'ineffective' || d.riskLevel === 'adjust');

    if (targetDrugs.length === 0) {
        return { text: 'All analyzed drugs appear to have acceptable safety profiles. No alternatives are needed at this time.', isCritical: false };
    }

    const isCritical = targetDrugs.some(d => d.riskLevel === 'toxic');

    const sections = targetDrugs.map(drug => {
        const alts = alternatives[drug.drug.toUpperCase()] || [{ alt: 'Consult prescribing guidelines', reasoning: 'No specific alternative mapping available' }];

        if (mode === 'patient') {
            return `**${drug.drug}** (currently: ${drug.riskLevel})\n` +
                `Your doctor may consider:\n` +
                alts.map(a => `- **${a.alt}** -- ${a.reasoning}`).join('\n');
        }

        return `**${drug.drug}** (${drug.riskLevel.toUpperCase()} | ${drug.severity})\n` +
            alts.map(a => `- **${a.alt}:** ${a.reasoning}`).join('\n');
    });

    const header = mode === 'patient'
        ? '**Possible Medication Alternatives**\n\nBased on your genetic profile, here are some options your doctor might consider:\n\n'
        : '**Pharmacogenomic-Guided Therapeutic Alternatives**\n\n';

    return {
        text: header + sections.join('\n\n') +
            '\n\nAll substitutions require clinical evaluation and should be discussed with the prescribing physician.',
        isCritical,
    };
}

function generateMonitoring(ctx: ReportContext, mode: ChatMode): { text: string; isCritical: boolean } {
    const protocols: Record<string, { tests: string[]; frequency: string; alerts: string[] }> = {
        CODEINE: {
            tests: ['Respiratory rate monitoring', 'Sedation scoring', 'Pain assessment scales'],
            frequency: 'Continuous monitoring if administered; reassess at 30-minute intervals',
            alerts: ['Respiratory rate < 12/min', 'Excessive sedation', 'Pinpoint pupils'],
        },
        WARFARIN: {
            tests: ['INR (International Normalized Ratio)', 'PT (Prothrombin Time)', 'CBC with platelets'],
            frequency: 'Weekly for first 4 weeks, then biweekly, then monthly when stable',
            alerts: ['INR > 4.0', 'Unexplained bruising or bleeding', 'Dark stool'],
        },
        CLOPIDOGREL: {
            tests: ['Platelet function testing (VerifyNow P2Y12)', 'CBC', 'Bleeding time'],
            frequency: 'At initiation, then as clinically indicated',
            alerts: ['Inadequate platelet inhibition', 'Recurrent thrombotic events', 'Major bleeding'],
        },
        SIMVASTATIN: {
            tests: ['CK (Creatine Kinase)', 'LFTs (ALT, AST)', 'Lipid panel'],
            frequency: 'Baseline, 6-12 weeks after initiation, then annually',
            alerts: ['CK > 10x upper limit of normal', 'Unexplained muscle pain or weakness', 'Dark urine'],
        },
        AZATHIOPRINE: {
            tests: ['CBC with differential', 'LFTs', 'Serum amylase'],
            frequency: 'Every 2 weeks for first 3 months, then monthly',
            alerts: ['WBC < 3.0 x 10^9/L', 'Neutrophils < 1.5 x 10^9/L', 'Platelets < 100 x 10^9/L'],
        },
        FLUOROURACIL: {
            tests: ['CBC with differential', 'Mucositis assessment', 'Hand-foot syndrome evaluation'],
            frequency: 'Before each cycle, weekly during treatment',
            alerts: ['ANC < 1.0 x 10^9/L', 'Grade 3+ mucositis', 'Severe diarrhea'],
        },
    };

    const isCritical = ctx.drugs.some(d => d.riskLevel === 'toxic');

    const sections = ctx.drugs.map(drug => {
        const proto = protocols[drug.drug.toUpperCase()];
        if (!proto) return `**${drug.drug}:** Standard monitoring per institutional protocol.`;

        if (mode === 'patient') {
            return `**${drug.drug}**\n` +
                `Tests your doctor may order:\n` +
                proto.tests.map(t => `- ${t}`).join('\n') +
                `\n\nHow often: ${proto.frequency}\n` +
                `\nWatch for:\n` +
                proto.alerts.map(a => `- ${a}`).join('\n');
        }

        return `**${drug.drug}** (${drug.riskLevel.toUpperCase()})\n` +
            `**Required Tests:** ${proto.tests.join(', ')}\n` +
            `**Frequency:** ${proto.frequency}\n` +
            `**Critical Alerts:** ${proto.alerts.join('; ')}`;
    });

    return {
        text: (mode === 'patient'
            ? '**Monitoring Plan for Your Medications**\n\nHere is what your healthcare team will be watching:\n\n'
            : '**Pharmacogenomic Monitoring Protocols**\n\n') +
            sections.join('\n\n'),
        isCritical,
    };
}

function generateCompareDrugs(ctx: ReportContext, mode: ChatMode): { text: string; isCritical: boolean } {
    if (ctx.drugs.length < 2) {
        return { text: 'Only one drug was analyzed. Comparison requires at least two drugs.', isCritical: false };
    }

    const isCritical = ctx.drugs.some(d => d.riskLevel === 'toxic');

    if (mode === 'patient') {
        const lines = ctx.drugs.map(d => {
            const safetyLabel = d.riskLevel === 'safe' ? 'appears safe' : d.riskLevel === 'adjust' ? 'needs dose adjustment' : d.riskLevel === 'toxic' ? 'should be avoided' : 'may not work effectively';
            return `- **${d.drug}:** ${safetyLabel} (confidence: ${d.confidence}%)`;
        });
        return {
            text: `**Comparing Your Medications**\n\n${lines.join('\n')}\n\nYour genetic profile affects each of these medications differently. Discuss any concerns with your healthcare provider.`,
            isCritical,
        };
    }

    const table = `| Drug | Risk | Severity | Confidence | Gene | Phenotype |\n` +
        `|------|------|----------|------------|------|-----------|\n` +
        ctx.drugs.map(d => {
            const v = d.variants[0];
            return `| ${d.drug} | ${d.riskLevel.toUpperCase()} | ${d.severity} | ${d.confidence}% | ${v?.gene || '-'} | ${v?.phenotype || '-'} |`;
        }).join('\n');

    return {
        text: `**Multi-Drug Pharmacogenomic Comparison**\n\n${table}\n\n` +
            `**Key Observations:**\n` +
            ctx.drugs.filter(d => d.riskLevel === 'toxic').map(d => `- ${d.drug}: Contraindicated due to ${d.variants[0]?.phenotype || 'altered'} metabolizer status`).join('\n') +
            (ctx.drugs.filter(d => d.riskLevel === 'toxic').length === 0 ? '- No contraindicated drugs detected' : ''),
        isCritical,
    };
}

function generateEvidenceStrength(ctx: ReportContext, mode: ChatMode): { text: string; isCritical: boolean } {
    const sections = ctx.drugs.map(drug => {
        const decomp = CONFIDENCE_DECOMPOSITION[drug.drug.toUpperCase()];
        const gene = drug.variants[0]?.gene;
        const popStat = gene ? POPULATION_STATS[gene] : undefined;

        if (mode === 'patient') {
            const strength = drug.confidence >= 90 ? 'very strong' : drug.confidence >= 75 ? 'strong' : 'moderate';
            return `- **${drug.drug}:** The evidence is ${strength} (${drug.confidence}%). ` +
                (decomp ? `This is based on well-established clinical guidelines (CPIC Level ${decomp.cpicLevel}).` : '');
        }

        return `**${drug.drug}** -- Confidence: ${drug.confidence}%\n` +
            (decomp
                ? `- CPIC Evidence Level: ${decomp.cpicLevel}\n- Evidence Strength: ${decomp.evidenceStrength}%\n- Guideline Alignment: ${decomp.guidelineAlignment}%`
                : '- Detailed decomposition not available') +
            (popStat ? `\n- Population prevalence: ${popStat.prevalence}% (${popStat.ancestry})` : '');
    });

    return {
        text: (mode === 'patient'
            ? '**How Strong Is the Evidence?**\n\n'
            : '**Evidence Strength Assessment**\n\n') +
            sections.join('\n\n'),
        isCritical: false,
    };
}

function generateIsCritical(ctx: ReportContext, mode: ChatMode): { text: string; isCritical: boolean } {
    const critical = ctx.drugs.filter(d => d.riskLevel === 'toxic' || d.severity === 'critical');
    const isCritical = critical.length > 0;

    if (!isCritical) {
        return {
            text: mode === 'patient'
                ? '**Good News**\n\nNone of the analyzed medications show critical-level risk based on your genetic profile. Some may need dose adjustments, but no drugs are flagged as dangerous.'
                : '**Critical Risk Assessment**\n\nNo drugs in this panel carry toxic or critical-severity classification. Dose modifications may still apply for adjust-level findings.',
            isCritical: false,
        };
    }

    return {
        text: (mode === 'patient'
            ? '**Important Alert**\n\nThe following medications have been flagged as potentially dangerous based on your genetic profile:\n\n'
            : '**CRITICAL PHARMACOGENOMIC ALERTS**\n\n') +
            critical.map(d =>
                mode === 'patient'
                    ? `- **${d.drug}:** This medication may cause serious side effects. ${d.recommendation}`
                    : `**${d.drug}** -- Risk: ${d.riskLevel.toUpperCase()} | Severity: ${d.severity.toUpperCase()}\n` +
                    `Gene: ${d.variants[0]?.gene || 'Unknown'} | Phenotype: ${d.variants[0]?.phenotype || 'Unknown'}\n` +
                    `Action: ${d.recommendation}`
            ).join('\n\n') +
            '\n\nImmediate clinical review is recommended for these findings.',
        isCritical: true,
    };
}

function generateSimpleExplanation(ctx: ReportContext): { text: string; isCritical: boolean } {
    const isCritical = ctx.drugs.some(d => d.riskLevel === 'toxic');
    const lines = ctx.drugs.map(d => {
        if (d.riskLevel === 'safe') return `- **${d.drug}:** Safe to use at normal doses.`;
        if (d.riskLevel === 'adjust') return `- **${d.drug}:** Your body processes this differently, so the dose may need to be changed.`;
        if (d.riskLevel === 'toxic') return `- **${d.drug}:** Your genetics make this medication risky. Your doctor should consider a different option.`;
        if (d.riskLevel === 'ineffective') return `- **${d.drug}:** This medication may not work as well for you. An alternative may be better.`;
        return `- **${d.drug}:** More information is needed.`;
    });

    return {
        text: `**Your Results in Simple Terms**\n\n` +
            `We looked at your DNA to see how your body handles ${ctx.drugs.length} medication${ctx.drugs.length > 1 ? 's' : ''}. ` +
            `Everyone's body processes drugs a little differently, and your genes play a big role.\n\n` +
            `Here is what we found:\n\n${lines.join('\n')}\n\n` +
            `Your overall risk score is ${ctx.overallRiskScore} out of 100. ` +
            (ctx.overallRiskScore > 60
                ? 'This is on the higher side, so please review these results with your doctor.'
                : 'This is within an acceptable range, but always discuss medications with your healthcare provider.'),
        isCritical,
    };
}

function generateGeneralResponse(ctx: ReportContext, mode: ChatMode, query: string): { text: string; isCritical: boolean } {
    return {
        text: mode === 'patient'
            ? `Thank you for your question. Based on your pharmacogenomic report, ` +
            `${ctx.drugs.length} medications were analyzed across ${ctx.analyzedGenes.length} genes. ` +
            `Your overall risk score is ${ctx.overallRiskScore}/100.\n\n` +
            `You can ask me things like:\n` +
            `- "Why is [drug name] risky?"\n` +
            `- "Which drug is the safest?"\n` +
            `- "Explain in simple language"\n` +
            `- "What monitoring is needed?"\n\n` +
            `I am here to help you understand your results.`
            : `**Report Overview**\n\n` +
            `Patient: ${ctx.patientId}\n` +
            `Drugs Analyzed: ${ctx.drugNames.join(', ')}\n` +
            `Genes Covered: ${ctx.analyzedGenes.join(', ')}\n` +
            `Total Variants: ${ctx.totalVariants}\n` +
            `Overall Risk Score: ${ctx.overallRiskScore}/100\n\n` +
            `Ask a specific question about drug risk, alternatives, monitoring, confidence scores, or request a drug safety ranking.`,
        isCritical: false,
    };
}

// ─── Main Entry Point ───────────────────────────────────────────────────────

export function generateResponse(
    query: string,
    context: ReportContext,
    mode: ChatMode
): { text: string; isCritical: boolean } {
    const { intent, drugHint, geneHint, confidenceHint } = detectIntent(query);

    switch (intent) {
        case 'drug_risk':
            return generateDrugRiskResponse(context, mode, drugHint);
        case 'drug_ranking':
            return generateDrugRanking(context, mode);
        case 'confidence_why':
            return generateConfidenceExplanation(context, mode, confidenceHint);
        case 'what_if':
            return generateWhatIf(context, mode, geneHint);
        case 'safer_alternative':
            return generateSaferAlternative(context, mode, drugHint);
        case 'monitoring':
            return generateMonitoring(context, mode);
        case 'compare_drugs':
            return generateCompareDrugs(context, mode);
        case 'evidence_strength':
            return generateEvidenceStrength(context, mode);
        case 'is_critical':
            return generateIsCritical(context, mode);
        case 'simple_explanation':
            return generateSimpleExplanation(context);
        default:
            return generateGeneralResponse(context, mode, query);
    }
}
