const nodemailer = require('nodemailer');
const axios = require('axios');

const DEFAULT_SENDER_NAME = process.env.MAIL_SENDER_NAME || 'PharmaGuard';

const getBackendBaseUrl = () => {
  if (process.env.BACKEND_BASE_URL) return process.env.BACKEND_BASE_URL;
  const port = process.env.PORT || process.env.AUTH_PORT || 3000;
  return `http://localhost:${port}`;
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatLabel = (value) =>
  String(value || 'Unknown')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const isEmailConfigured = () =>
  Boolean(
    process.env.GMAIL_APPS_SCRIPT_URL ||
    (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS)
  );

const buildEmailLayout = ({ title, preview, bodyHtml }) => `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#081018;font-family:Arial,Helvetica,sans-serif;color:#e5eef5;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview || title)}</div>
    <div style="max-width:680px;margin:0 auto;padding:24px 16px;">
      <div style="background:linear-gradient(135deg,#0d7377,#14b8a6);border-radius:18px 18px 0 0;padding:24px 28px;">
        <div style="font-size:28px;font-weight:700;letter-spacing:0.2px;color:#ffffff;">${escapeHtml(DEFAULT_SENDER_NAME)}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.82);margin-top:6px;">Pharmacogenomics AI clinical updates</div>
      </div>
      <div style="background:#101722;border:1px solid #1f2937;border-top:none;border-radius:0 0 18px 18px;padding:28px;">
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#f8fafc;">${escapeHtml(title)}</h1>
        <div style="font-size:15px;line-height:1.7;color:#cbd5e1;">${bodyHtml}</div>
        <div style="margin-top:28px;padding-top:18px;border-top:1px solid #243142;font-size:12px;color:#94a3b8;">
          This message was sent by ${escapeHtml(DEFAULT_SENDER_NAME)}.
        </div>
      </div>
    </div>
  </body>
</html>`;

const buildRequestMetaHtml = (meta = {}) => {
  const entries = [
    ['Time', meta.timestamp],
    ['IP address', meta.ipAddress],
    ['Browser', meta.userAgent],
  ].filter(([, value]) => value);

  if (!entries.length) return '';

  return `
    <div style="margin-top:18px;padding:14px 16px;background:#0b1220;border:1px solid #203044;border-radius:12px;">
      <div style="font-size:13px;font-weight:700;color:#f8fafc;margin-bottom:8px;">Request details</div>
      ${entries
        .map(
          ([label, value]) =>
            `<div style="font-size:13px;color:#cbd5e1;margin:4px 0;"><strong style="color:#f8fafc;">${escapeHtml(label)}:</strong> ${escapeHtml(value)}</div>`
        )
        .join('')}
    </div>
  `;
};

const toBase64 = (value) => Buffer.from(String(value || ''), 'utf-8').toString('base64');

const sendViaAppsScript = async ({ to, subject, text, html, attachments = [] }) => {
  const url = process.env.GMAIL_APPS_SCRIPT_URL;
  if (!url) return false;

  const payload = {
    token: process.env.GMAIL_APPS_SCRIPT_TOKEN || '',
    to,
    subject,
    text,
    html,
    senderName: DEFAULT_SENDER_NAME,
    attachments,
  };

  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
    maxBodyLength: Infinity,
  });

  return response.status >= 200 && response.status < 300;
};

const sendViaSmtp = async ({ to, subject, text, html, attachments = [] }) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  await transporter.sendMail({
    from: `"${DEFAULT_SENDER_NAME}" <${process.env.SENDER_EMAIL || process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments: attachments.map((attachment) => ({
      filename: attachment.filename,
      content: Buffer.from(attachment.contentBase64, 'base64'),
      contentType: attachment.mimeType,
    })),
  });

  return true;
};

const sendMail = async ({ to, subject, text, html, attachments = [] }) => {
  if (!to) return false;

  try {
    if (process.env.GMAIL_APPS_SCRIPT_URL) {
      return await sendViaAppsScript({ to, subject, text, html, attachments });
    }

    const sent = await sendViaSmtp({ to, subject, text, html, attachments });
    if (!sent) {
      console.warn('No mail provider configured. Skipping email send.');
    }
    return sent;
  } catch (error) {
    console.error('Email send failed:', error.response?.data || error.message);
    return false;
  }
};

const buildWelcomeHtml = ({ name, provider }) =>
  buildEmailLayout({
    title: 'Welcome to PharmaGuard',
    preview: 'Your PharmaGuard account is ready.',
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${escapeHtml(name || 'there')},</p>
      <p style="margin:0 0 14px;">Your PharmaGuard account has been created successfully${provider ? ` using ${escapeHtml(provider)}` : ''}.</p>
      <p style="margin:0 0 14px;">You can now upload VCF files, run pharmacogenomic analysis, and review CPIC-aligned risk reports from your dashboard.</p>
      <p style="margin:0;">We are glad to have you here.</p>
    `,
  });

const buildLoginHtml = ({ name, provider, meta }) =>
  buildEmailLayout({
    title: 'New sign-in detected',
    preview: 'A sign-in to your PharmaGuard account was detected.',
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${escapeHtml(name || 'there')},</p>
      <p style="margin:0 0 14px;">A ${escapeHtml(provider || 'password')} sign-in to your PharmaGuard account was just detected.</p>
      <p style="margin:0;">If this was you, no action is needed. If not, reset your password right away.</p>
      ${buildRequestMetaHtml(meta)}
    `,
  });

const buildPasswordChangedHtml = ({ name, meta }) =>
  buildEmailLayout({
    title: 'Your password was changed',
    preview: 'Your PharmaGuard password has been updated.',
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${escapeHtml(name || 'there')},</p>
      <p style="margin:0 0 14px;">Your PharmaGuard password has been changed successfully.</p>
      <p style="margin:0;">If you did not make this change, secure your account immediately.</p>
      ${buildRequestMetaHtml(meta)}
    `,
  });

const buildResetOtpHtml = ({ name, otp }) =>
  buildEmailLayout({
    title: 'Password reset OTP',
    preview: 'Use this OTP to reset your PharmaGuard password.',
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${escapeHtml(name || 'there')},</p>
      <p style="margin:0 0 14px;">Use the OTP below to reset your PharmaGuard password. It expires in 10 minutes.</p>
      <div style="margin:20px 0;padding:18px 20px;background:#0b1220;border:1px solid #203044;border-radius:14px;text-align:center;">
        <div style="font-size:30px;letter-spacing:8px;font-weight:700;color:#5eead4;">${escapeHtml(otp)}</div>
      </div>
      <p style="margin:0;">If you did not request this, you can ignore this email.</p>
    `,
  });

const normalizeExplanation = (explanation) => {
  if (typeof explanation === 'string') {
    return { summary: explanation, mechanism: explanation };
  }
  return {
    summary: explanation?.summary || '',
    mechanism: explanation?.mechanism || '',
  };
};

const buildAnalysisCsv = ({ record, results = [] }) => {
  const header = [
    'patient_id',
    'record_id',
    'vcf_file',
    'drug',
    'risk_label',
    'severity',
    'confidence_score',
    'primary_gene',
    'diplotype',
    'phenotype',
    'variants',
    'recommendation',
    'guideline_details',
    'summary',
    'mechanism',
  ];

  const lines = [header.join(',')];

  results.forEach((result) => {
    const explanation = normalizeExplanation(result.llm_generated_explanation);
    const variants = (result.pharmacogenomic_profile?.detected_variants || [])
      .map((variant) => `${variant.rsid}:${variant.genotype}:${variant.impact}`)
      .join(' | ');

    const row = [
      record.patientId,
      record._id,
      record.fileName,
      result.drug,
      result.risk_assessment?.risk_label,
      result.risk_assessment?.severity,
      result.risk_assessment?.confidence_score,
      result.pharmacogenomic_profile?.primary_gene,
      result.pharmacogenomic_profile?.diplotype,
      result.pharmacogenomic_profile?.phenotype,
      variants,
      result.clinical_recommendation?.action,
      result.clinical_recommendation?.details,
      explanation.summary,
      explanation.mechanism,
    ]
      .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
      .join(',');

    lines.push(row);
  });

  return lines.join('\n');
};

const buildRiskBadgeHtml = (label) => {
  const normalized = String(label || '').toLowerCase();
  const colors = {
    low: ['#052e2b', '#5eead4'],
    moderate: ['#3a2b05', '#fbbf24'],
    high: ['#3b1111', '#fb7185'],
    very_high: ['#450a0a', '#f87171'],
    unknown: ['#1e293b', '#cbd5e1'],
  };

  const [bg, fg] = colors[normalized] || colors.unknown;
  return `<span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${bg};color:${fg};font-size:12px;font-weight:700;">${escapeHtml(formatLabel(label))}</span>`;
};

const buildAnalysisHtml = ({ name, record, results = [], mode }) =>
  buildEmailLayout({
    title: 'Your pharmacogenomic analysis is ready',
    preview: 'PharmaGuard completed your VCF analysis.',
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${escapeHtml(name || 'there')},</p>
      <p style="margin:0 0 14px;">Your PharmaGuard analysis has completed for VCF file <strong>${escapeHtml(record.fileName || 'uploaded file')}</strong>.</p>
      <div style="margin:18px 0;padding:14px 16px;background:#0b1220;border:1px solid #203044;border-radius:12px;">
        <div style="font-size:13px;color:#cbd5e1;margin-bottom:4px;"><strong style="color:#f8fafc;">Patient ID:</strong> ${escapeHtml(record.patientId)}</div>
        <div style="font-size:13px;color:#cbd5e1;margin-bottom:4px;"><strong style="color:#f8fafc;">Record ID:</strong> ${escapeHtml(record._id)}</div>
        <div style="font-size:13px;color:#cbd5e1;"><strong style="color:#f8fafc;">Mode:</strong> ${escapeHtml(mode === 'fallback' ? 'Fallback CPIC-aligned result set' : 'Full analysis')}</div>
      </div>
      <div style="margin-top:18px;">
        ${results
          .map((result) => {
            const explanation = normalizeExplanation(result.llm_generated_explanation);
            const variants = (result.pharmacogenomic_profile?.detected_variants || [])
              .map((variant) => `${variant.rsid} (${variant.genotype})`)
              .join(', ') || 'No variant details available';

            return `
              <div style="margin-bottom:16px;padding:16px;background:#0b1220;border:1px solid #203044;border-radius:14px;">
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;">
                  <div>
                    <div style="font-size:17px;font-weight:700;color:#f8fafc;">${escapeHtml(result.drug)}</div>
                    <div style="font-size:13px;color:#94a3b8;margin-top:4px;">${escapeHtml(result.pharmacogenomic_profile?.primary_gene || 'Unknown gene')} • ${escapeHtml(result.pharmacogenomic_profile?.phenotype || 'Unknown phenotype')}</div>
                  </div>
                  <div>${buildRiskBadgeHtml(result.risk_assessment?.risk_label)}</div>
                </div>
                <div style="font-size:13px;color:#cbd5e1;margin-top:12px;"><strong style="color:#f8fafc;">Confidence:</strong> ${escapeHtml(result.risk_assessment?.confidence_score)}%</div>
                <div style="font-size:13px;color:#cbd5e1;margin-top:6px;"><strong style="color:#f8fafc;">Severity:</strong> ${escapeHtml(formatLabel(result.risk_assessment?.severity))}</div>
                <div style="font-size:13px;color:#cbd5e1;margin-top:6px;"><strong style="color:#f8fafc;">Variants:</strong> ${escapeHtml(variants)}</div>
                <div style="font-size:13px;color:#cbd5e1;margin-top:10px;"><strong style="color:#f8fafc;">Recommendation:</strong> ${escapeHtml(result.clinical_recommendation?.action || 'No recommendation')}</div>
                <div style="font-size:13px;color:#cbd5e1;margin-top:8px;"><strong style="color:#f8fafc;">Guideline details:</strong> ${escapeHtml(result.clinical_recommendation?.details || 'No guideline details')}</div>
                <div style="font-size:13px;color:#cbd5e1;margin-top:8px;"><strong style="color:#f8fafc;">Clinical summary:</strong> ${escapeHtml(explanation.summary || 'No summary available')}</div>
              </div>
            `;
          })
          .join('')}
      </div>
      <p style="margin:16px 0 0;">A CSV report is attached to this email for spreadsheet review and recordkeeping.</p>
    `,
  });

const sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${getBackendBaseUrl()}/api/v1/users/verify-email/${token}`;
    const subject = 'Verify your PharmaGuard account';
    const text = `Welcome to PharmaGuard.\n\nPlease verify your email:\n${verificationUrl}\n\nThis link expires in 10 minutes.`;
    const html = buildEmailLayout({
      title: 'Verify your PharmaGuard account',
      preview: 'Complete your PharmaGuard account verification.',
      bodyHtml: `
        <p style="margin:0 0 14px;">Welcome to PharmaGuard.</p>
        <p style="margin:0 0 14px;">Please verify your email address using the link below. This link expires in 10 minutes.</p>
        <p style="margin:0;"><a href="${escapeHtml(verificationUrl)}" style="color:#5eead4;">Verify account</a></p>
      `,
    });
    return await sendMail({ to: email, subject, text, html });
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    return false;
  }
};

const sendResetPasswordOtpEmail = async (email, otp, name) => {
  try {
    const subject = 'Reset your PharmaGuard password';
    const text = `Your PharmaGuard password reset OTP is: ${otp}\n\nThis OTP expires in 10 minutes.`;
    const html = buildResetOtpHtml({ name, otp });
    return await sendMail({ to: email, subject, text, html });
  } catch (error) {
    console.error('Error sending reset password OTP email:', error.message);
    return false;
  }
};

const sendWelcomeEmail = async (email, { name, provider } = {}) => {
  const subject = 'Welcome to PharmaGuard';
  const text = `Hi ${name || 'there'},\n\nYour PharmaGuard account is ready${provider ? ` using ${provider}` : ''}.`;
  const html = buildWelcomeHtml({ name, provider });
  return sendMail({ to: email, subject, text, html });
};

const sendLoginNotificationEmail = async (email, { name, provider, meta } = {}) => {
  const subject = 'New sign-in to your PharmaGuard account';
  const text = `Hi ${name || 'there'},\n\nA ${provider || 'password'} sign-in to your PharmaGuard account was detected.`;
  const html = buildLoginHtml({ name, provider, meta });
  return sendMail({ to: email, subject, text, html });
};

const sendPasswordChangedEmail = async (email, { name, meta } = {}) => {
  const subject = 'Your PharmaGuard password was changed';
  const text = `Hi ${name || 'there'},\n\nYour PharmaGuard password has been updated successfully.`;
  const html = buildPasswordChangedHtml({ name, meta });
  return sendMail({ to: email, subject, text, html });
};

const sendAnalysisReportEmail = async (email, { name, record, results, mode } = {}) => {
  const csv = buildAnalysisCsv({ record, results });
  const subject = `PharmaGuard analysis complete for ${record.fileName || record.patientId}`;
  const text = `Hi ${name || 'there'},\n\nYour PharmaGuard analysis is complete. Patient ID: ${record.patientId}. CSV report attached.`;
  const html = buildAnalysisHtml({ name, record, results, mode });
  const attachments = [
    {
      filename: `pharmaguard-analysis-${record.patientId || 'report'}.csv`,
      mimeType: 'text/csv',
      contentBase64: toBase64(csv),
    },
  ];

  return sendMail({ to: email, subject, text, html, attachments });
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordOtpEmail,
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendPasswordChangedEmail,
  sendAnalysisReportEmail,
  isEmailConfigured,
};
