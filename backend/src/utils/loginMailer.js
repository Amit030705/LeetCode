const nodemailer = require('nodemailer');

const requiredMailConfig = ['GMAIL_USER', 'GMAIL_APP_PASSWORD'];

const hasMailConfig = () =>
  requiredMailConfig.every((key) => Boolean(process.env[key]));

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const formatDate = () =>
  new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  });

const sendMail = async ({ to, subject, text, html }) => {
  if (!hasMailConfig()) {
    console.warn('Email skipped: Gmail environment variables are missing.');
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"LeecoAI Security" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

const sendAuthNotificationEmail = async ({ user, eventType, ipAddress, userAgent }) => {
  if (!process.env.LOGIN_ALERT_TO) {
    console.warn('Auth notification skipped: LOGIN_ALERT_TO is missing.');
    return;
  }

  const eventTime = formatDate();
  const firstName = user.firstName || 'User';
  const safeFirstName = escapeHtml(firstName);
  const safeEmail = escapeHtml(user.emailId);
  const safeEventType = escapeHtml(eventType);
  const safeIpAddress = escapeHtml(ipAddress || 'Unknown');
  const safeUserAgent = escapeHtml(userAgent || 'Unknown');

  await sendMail({
    to: process.env.LOGIN_ALERT_TO,
    subject: `LeecoAI ${eventType}: ${user.emailId}`,
    text: [
      `LeecoAI ${eventType}`,
      '',
      `Name: ${firstName}`,
      `Email: ${user.emailId}`,
      `Time: ${eventTime}`,
      `IP Address: ${ipAddress || 'Unknown'}`,
      `Device: ${userAgent || 'Unknown'}`,
    ].join('\n'),
    html: `
      <div style="margin:0;background:#f6f8fc;padding:28px;font-family:Inter,Roboto,Arial,sans-serif;color:#202124;">
        <div style="max-width:580px;margin:0 auto;background:#ffffff;border:1px solid #e8eaed;border-radius:20px;overflow:hidden;box-shadow:0 18px 50px rgba(60,64,67,0.12);">
          <div style="padding:28px 30px 18px;border-bottom:1px solid #eef0f4;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:14px;background:#1a73e8;color:#ffffff;font-size:20px;font-weight:700;">L</div>
            <h1 style="margin:20px 0 6px;font-size:24px;line-height:1.25;font-weight:700;color:#202124;">${safeEventType}</h1>
            <p style="margin:0;font-size:15px;line-height:1.6;color:#5f6368;">A user activity event happened in your LeecoAI authentication system.</p>
          </div>
          <div style="padding:24px 30px;">
            <div style="padding:16px;border:1px solid #e8eaed;border-radius:14px;background:#fafbff;">
              <p style="margin:0 0 10px;font-size:14px;color:#5f6368;">User email</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:#202124;">${safeEmail}</p>
            </div>
            <table style="width:100%;border-collapse:collapse;margin-top:18px;font-size:14px;color:#3c4043;">
              <tr><td style="padding:10px 0;color:#5f6368;">Name</td><td style="padding:10px 0;text-align:right;font-weight:600;">${safeFirstName}</td></tr>
              <tr><td style="padding:10px 0;color:#5f6368;">Type</td><td style="padding:10px 0;text-align:right;font-weight:600;">${safeEventType}</td></tr>
              <tr><td style="padding:10px 0;color:#5f6368;">Time</td><td style="padding:10px 0;text-align:right;font-weight:600;">${eventTime}</td></tr>
              <tr><td style="padding:10px 0;color:#5f6368;">IP address</td><td style="padding:10px 0;text-align:right;font-weight:600;">${safeIpAddress}</td></tr>
            </table>
            <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#5f6368;">Device: ${safeUserAgent}</p>
          </div>
        </div>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async ({ user, resetUrl }) => {
  const safeFirstName = escapeHtml(user.firstName || 'there');
  const safeResetUrl = escapeHtml(resetUrl);

  await sendMail({
    to: user.emailId,
    subject: 'Reset your LeecoAI password',
    text: [
      `Hi ${user.firstName || 'there'},`,
      '',
      'Use this secure link to reset your LeecoAI password. It expires in 15 minutes:',
      resetUrl,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="margin:0;background:#f6f8fc;padding:28px;font-family:Inter,Roboto,Arial,sans-serif;color:#202124;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e8eaed;border-radius:20px;overflow:hidden;box-shadow:0 18px 50px rgba(60,64,67,0.12);">
          <div style="padding:30px;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:14px;background:#1a73e8;color:#ffffff;font-size:20px;font-weight:700;">L</div>
            <h1 style="margin:22px 0 10px;font-size:24px;line-height:1.25;font-weight:700;color:#202124;">Reset your password</h1>
            <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#5f6368;">Hi ${safeFirstName}, use the button below to create a new password. This link expires in 15 minutes.</p>
            <a href="${safeResetUrl}" style="display:inline-block;background:#1a73e8;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-size:14px;font-weight:700;">Reset password</a>
            <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#5f6368;">If the button does not work, open this link:<br>${safeResetUrl}</p>
          </div>
        </div>
      </div>
    `,
  });
};

module.exports = { sendAuthNotificationEmail, sendPasswordResetEmail };
