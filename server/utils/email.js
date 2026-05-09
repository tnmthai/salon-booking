const nodemailer = require('nodemailer');

// Configure transporter from environment variables
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log(`[EMAIL] Not configured. SMTP_HOST=${SMTP_HOST||'(none)'} SMTP_USER=${SMTP_USER||'(none)'} SMTP_PASS=${SMTP_PASS?'***':'(none)'}`);
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '465'),
    secure: parseInt(SMTP_PORT || '465') === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return transporter;
}

async function sendEmail(to, subject, html) {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Email skipped] To: ${to} | Subject: ${subject}`);
    return null;
  }

  try {
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || `"Salon Booking" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email sent] To: ${to} | Subject: ${subject} | ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[Email error] To: ${to} | Error: ${err.message}`);
    return null;
  }
}

function bookingConfirmationEmail({ customerName, salonName, serviceName, staffName, date, time, duration, price, address }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 40px; margin-bottom: 8px;">✂️</div>
          <h1 style="color: #111; font-size: 24px; margin: 0;">Booking Confirmed!</h1>
        </div>
        
        <p style="color: #555; font-size: 16px;">Hi ${customerName},</p>
        <p style="color: #555;">Your appointment at <strong>${salonName}</strong> has been confirmed.</p>
        
        <div style="background: #fdf2f8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; font-size: 14px; color: #333;">
            <tr><td style="padding: 6px 0; color: #888;">Service</td><td style="padding: 6px 0; font-weight: 600;">${serviceName}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Staff</td><td style="padding: 6px 0; font-weight: 600;">${staffName}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Date</td><td style="padding: 6px 0; font-weight: 600;">${date}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Time</td><td style="padding: 6px 0; font-weight: 600;">${time}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Duration</td><td style="padding: 6px 0; font-weight: 600;">${duration} min</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Price</td><td style="padding: 6px 0; font-weight: 600;">$${price}</td></tr>
          </table>
        </div>
        
        ${address ? `<p style="color: #555; font-size: 14px;">📍 ${address}</p>` : ''}
        
        <p style="color: #888; font-size: 13px; margin-top: 32px; text-align: center;">
          We look forward to seeing you! If you need to cancel or reschedule, please contact the salon directly.
        </p>
      </div>
    </body>
    </html>
  `;
}

function shopOwnerNotificationEmail({ salonName, customerName, customerPhone, customerEmail, serviceName, staffName, date, time, duration, price, notes }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 40px; margin-bottom: 8px;">🔔</div>
          <h1 style="color: #111; font-size: 24px; margin: 0;">New Booking!</h1>
        </div>
        
        <p style="color: #555; font-size: 16px;">You have a new booking at <strong>${salonName}</strong>.</p>
        
        <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px; color: #111; font-size: 14px;">Customer</h3>
          <table style="width: 100%; font-size: 14px; color: #333;">
            <tr><td style="padding: 4px 0; color: #888;">Name</td><td style="padding: 4px 0; font-weight: 600;">${customerName}</td></tr>
            <tr><td style="padding: 4px 0; color: #888;">Phone</td><td style="padding: 4px 0;">${customerPhone || '—'}</td></tr>
            <tr><td style="padding: 4px 0; color: #888;">Email</td><td style="padding: 4px 0;">${customerEmail || '—'}</td></tr>
          </table>
        </div>

        <div style="background: #fdf2f8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px; color: #111; font-size: 14px;">Appointment</h3>
          <table style="width: 100%; font-size: 14px; color: #333;">
            <tr><td style="padding: 4px 0; color: #888;">Service</td><td style="padding: 4px 0; font-weight: 600;">${serviceName}</td></tr>
            <tr><td style="padding: 4px 0; color: #888;">Staff</td><td style="padding: 4px 0; font-weight: 600;">${staffName}</td></tr>
            <tr><td style="padding: 4px 0; color: #888;">Date</td><td style="padding: 4px 0; font-weight: 600;">${date}</td></tr>
            <tr><td style="padding: 4px 0; color: #888;">Time</td><td style="padding: 4px 0; font-weight: 600;">${time}</td></tr>
            <tr><td style="padding: 4px 0; color: #888;">Duration</td><td style="padding: 4px 0; font-weight: 600;">${duration} min</td></tr>
            <tr><td style="padding: 4px 0; color: #888;">Price</td><td style="padding: 4px 0; font-weight: 600;">$${price}</td></tr>
            ${notes ? `<tr><td style="padding: 4px 0; color: #888;">Notes</td><td style="padding: 4px 0;">${notes}</td></tr>` : ''}
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.APP_URL || 'https://salon-booking.up.railway.app'}/admin" 
             style="display: inline-block; background: #111; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            View in Dashboard →
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = { sendEmail, bookingConfirmationEmail, shopOwnerNotificationEmail };
